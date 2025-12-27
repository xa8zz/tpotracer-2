// src/services/apiService.ts

import { LeaderboardEntry, GameResult } from '../types';

// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_ENABLED = !!API_BASE_URL;
if (!API_ENABLED) {
  console.warn("VITE_API_BASE_URL not set - API features disabled (local dev mode)");
} else {
  console.log("API URL:", API_BASE_URL);
}

// Types
interface LeaderboardCache {
  data: LeaderboardEntry[];
  timestamp: number;
  userPosition?: number;
}

// Cache + Constants
let leaderboardCache: LeaderboardCache = {
  data: [],
  timestamp: 0,
};
export const LEADERBOARD_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 mins

// Helper to check if cache is stale
export const isLeaderboardCacheStale = (): boolean => {
  return Date.now() - leaderboardCache.timestamp > LEADERBOARD_REFRESH_INTERVAL;
};

// Subscription system for instant updates
type LeaderboardUpdateListener = () => void;
const listeners: Set<LeaderboardUpdateListener> = new Set();

export const subscribe = (listener: LeaderboardUpdateListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const getTimeUntilNextRefresh = (): number => {
  return Math.max(0, LEADERBOARD_REFRESH_INTERVAL - (Date.now() - leaderboardCache.timestamp));
};

// Fetch leaderboard (with optional force or username lookup)
export const fetchLeaderboard = async (
  force = false,
  username: string | null
): Promise<LeaderboardCache> => {
  if (!API_ENABLED) {
    return leaderboardCache; // Return empty cache in dev mode
  }

  let data = leaderboardCache.data;
  let timestamp = leaderboardCache.timestamp;

  // Fetch new data if forced or stale
  if (force || isLeaderboardCacheStale()) {
    try {
      const headers = {
        'x-api-key': import.meta.env.VITE_API_KEY
      };

      const response = await fetch(`${API_BASE_URL}/api/leaderboard?limit=20`, { headers });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      data = await response.json();
      timestamp = Date.now();
      
      // Update basic cache immediately
      leaderboardCache.data = data;
      leaderboardCache.timestamp = timestamp;
    } catch (error) {
      console.error("Leaderboard fetch failed", error);
      // Fallback to existing data if fetch fails
    }
  }

  // Calculate user position for the requested username (always, even if using cached list)
  let userPosition: number | undefined = undefined;

  if (username) {
    const index = data.findIndex(entry => entry.username === username);
    if (index !== -1) {
      userPosition = index + 1;
    } else {
      try {
        const headers = {
          'x-api-key': import.meta.env.VITE_API_KEY
        };
        // Check if user exists first (optional but helps avoid 404s in logs if we want)
        // Actually, just fetch rank directly.
        const countResponse = await fetch(`${API_BASE_URL}/api/rank/${encodeURIComponent(username)}`, { headers });
        if (countResponse.ok) {
          const { rank } = await countResponse.json();
          userPosition = rank;
        }
      } catch (err) {
        console.error("Failed to fetch user position", err);
      }
    }
  }

  // Update the cache object with the specific userPosition for this request
  leaderboardCache = { 
    data, 
    timestamp, 
    userPosition 
  };
  
  return leaderboardCache;
};

// Submit score (with anti-spam throttle)
let submitScoreTimeout: ReturnType<typeof setTimeout> | null = null;

export const submitScore = async (
  result: GameResult,
  forceSubmit = false
): Promise<{ success: boolean; rank?: number }> => {
  if (!API_ENABLED) {
    console.warn("Score not submitted - API disabled in dev mode");
    return { success: true }; // Pretend it worked
  }

  if (submitScoreTimeout && !forceSubmit) {
    console.warn("Submit blocked due to cooldown");
    return { success: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY, 
      },
      body: JSON.stringify(result),
    });
    

    if (!response.ok) throw new Error('Score submission failed');
    
    const data = await response.json();

    // Update cache with fresh data from response if available
    if (data.leaderboard) {
      leaderboardCache = {
        data: data.leaderboard,
        timestamp: Date.now(),
        userPosition: data.rank // update user position if we have it
      };
      notifyListeners();
    }

    if (submitScoreTimeout) clearTimeout(submitScoreTimeout);
    submitScoreTimeout = setTimeout(() => {
      submitScoreTimeout = null;
    }, 2000); // 2s cooldown

    await fetchLeaderboard(true, result.username); // refresh with latest result (or use cache if we just updated it)
    return { success: true, rank: data.rank };
  } catch (error) {
    console.error("Submit score failed", error);
    return { success: false };
  }
};
