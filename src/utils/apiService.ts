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
export interface LeaderboardResult {
  data: LeaderboardEntry[];
  hasMore: boolean;
  userPosition?: number;
  wpmToBeat?: number | null;
  wpmToBeatRaw?: number | null;
}

// Cache for first page + user position
interface LeaderboardCache {
  data: LeaderboardEntry[];
  timestamp: number;
  userPosition?: number;
  wpmToBeat?: number | null;
  wpmToBeatRaw?: number | null;
}

let leaderboardCache: LeaderboardCache = {
  data: [],
  timestamp: 0,
};

export const LEADERBOARD_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 mins
const PAGE_SIZE = 20;

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

// Fetch a page of leaderboard data
export const fetchLeaderboardPage = async (
  offset = 0,
  limit = PAGE_SIZE
): Promise<LeaderboardEntry[]> => {
  if (!API_ENABLED) {
    return [];
  }

  const headers = {
    'x-api-key': import.meta.env.VITE_API_KEY
  };

  const response = await fetch(
    `${API_BASE_URL}/api/leaderboard?limit=${limit}&offset=${offset}`, 
    { headers }
  );
  
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
};

// Fetch initial leaderboard (first page + user position)
export const fetchLeaderboard = async (
  force = false,
  username: string | null
): Promise<LeaderboardResult> => {
  if (!API_ENABLED) {
    return { data: [], hasMore: false };
  }

  let data = leaderboardCache.data;
  let timestamp = leaderboardCache.timestamp;

  // Fetch new data if forced or stale
  if (force || isLeaderboardCacheStale()) {
    try {
      data = await fetchLeaderboardPage(0, PAGE_SIZE);
      timestamp = Date.now();
      
      // Update cache
      leaderboardCache.data = data;
      leaderboardCache.timestamp = timestamp;
    } catch (error) {
      console.error("Leaderboard fetch failed", error);
      // Fallback to existing data if fetch fails
    }
  }

  // Calculate user position for the requested username
  let userPosition: number | undefined = undefined;
  let wpmToBeat: number | undefined | null = undefined;
  let wpmToBeatRaw: number | undefined | null = undefined;

  if (username) {
    const index = data.findIndex(entry => entry.username === username);
    if (index !== -1) {
      userPosition = index + 1;
    } 
    
    // Always fetch from rank endpoint to get wpmToBeat and wpmToBeatRaw
    try {
      const headers = {
        'x-api-key': import.meta.env.VITE_API_KEY
      };
      const countResponse = await fetch(`${API_BASE_URL}/api/rank/${encodeURIComponent(username)}`, { headers });
      if (countResponse.ok) {
        const result = await countResponse.json();
        userPosition = result.rank;
        wpmToBeat = result.wpmToBeat;
        wpmToBeatRaw = result.wpmToBeatRaw;
      }
    } catch (err) {
      console.error("Failed to fetch user position", err);
    }
  }

  // Update cache with user position
  leaderboardCache = { 
    data, 
    timestamp, 
    userPosition,
    wpmToBeat,
    wpmToBeatRaw
  };
  
  return {
    data,
    hasMore: data.length === PAGE_SIZE,
    userPosition,
    wpmToBeat,
    wpmToBeatRaw
  };
};

// Fetch more leaderboard entries (for pagination)
export const fetchMoreLeaderboard = async (
  currentData: LeaderboardEntry[]
): Promise<LeaderboardResult> => {
  if (!API_ENABLED) {
    return { data: currentData, hasMore: false };
  }

  try {
    const newPage = await fetchLeaderboardPage(currentData.length, PAGE_SIZE);
    const combinedData = [...currentData, ...newPage];
    
    // Update cache with combined data
    leaderboardCache.data = combinedData;
    leaderboardCache.timestamp = Date.now();
    
    return {
      data: combinedData,
      hasMore: newPage.length === PAGE_SIZE,
      userPosition: leaderboardCache.userPosition
    };
  } catch (error) {
    console.error("Failed to fetch more leaderboard data", error);
    return { data: currentData, hasMore: false };
  }
};

// Submit score (with anti-spam throttle)
let submitScoreTimeout: ReturnType<typeof setTimeout> | null = null;

export const submitScore = async (
  result: GameResult,
  forceSubmit = false
): Promise<{ success: boolean; rank?: number; wpmToBeat?: number | null; wpmToBeatRaw?: number | null; invalid?: boolean; errorCode?: number }> => {
  if (!API_ENABLED) {
    console.warn("Score not submitted - API disabled in dev mode");
    return { success: true };
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
    
    // Parse response body to check for validation errors
    const data = await response.json();

    // Check for validation failure (score rejected as invalid/cheating)
    if (!response.ok) {
      if (data.invalid) {
        console.warn("Score rejected as invalid:", data.error, "code:", data.errorCode);
        return { success: false, invalid: true, errorCode: data.errorCode };
      }
      throw new Error(data.error || 'Score submission failed');
    }

    // Update cache with fresh data from response if available
    if (data.leaderboard) {
      leaderboardCache = {
        data: data.leaderboard,
        timestamp: Date.now(),
        userPosition: data.rank
      };
      notifyListeners();
    }

    if (submitScoreTimeout) clearTimeout(submitScoreTimeout);
    submitScoreTimeout = setTimeout(() => {
      submitScoreTimeout = null;
    }, 2000); // 2s cooldown

    await fetchLeaderboard(true, result.username);
    return { success: true, rank: data.rank, wpmToBeat: data.wpmToBeat, wpmToBeatRaw: data.wpmToBeatRaw };
  } catch (error) {
    console.error("Submit score failed", error);
    return { success: false };
  }
};
