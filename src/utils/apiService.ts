// src/services/apiService.ts

import { LeaderboardEntry, GameResult } from '../types';

// Use Vite environment variable for API base URL
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 if (!API_BASE_URL) {
   throw new Error("VITE_API_BASE_URL is not defined");
 }
console.log("API URL:", API_BASE_URL);

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

export const getTimeUntilNextRefresh = (): number => {
  return Math.max(0, LEADERBOARD_REFRESH_INTERVAL - (Date.now() - leaderboardCache.timestamp));
};

// Fetch leaderboard (with optional force or username lookup)
export const fetchLeaderboard = async (
  force = false,
  username?: string
): Promise<LeaderboardCache> => {
  if (!force && !isLeaderboardCacheStale()) {
    return leaderboardCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=20`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');

    const data: LeaderboardEntry[] = await response.json();
    let userPosition: number | undefined = undefined;

    if (username) {
      const index = data.findIndex(entry => entry.username === username);
      if (index !== -1) {
        userPosition = index + 1;
      } else {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/leaderboard?search=${encodeURIComponent(username)}&limit=1`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const countResponse = await fetch(`${API_BASE_URL}/rank/${encodeURIComponent(username)}`);
            if (countResponse.ok) {
              const { rank } = await countResponse.json();
              userPosition = rank;
            }
          }
        } catch (err) {
          console.error("Failed to fetch user position", err);
        }
      }
    }

    leaderboardCache = { data, timestamp: Date.now(), userPosition };
    return leaderboardCache;
  } catch (error) {
    console.error("Leaderboard fetch failed", error);
    return leaderboardCache;
  }
};

// Submit score (with anti-spam throttle)
let submitScoreTimeout: ReturnType<typeof setTimeout> | null = null;

export const submitScore = async (
  result: GameResult,
  forceSubmit = false
): Promise<boolean> => {
  if (submitScoreTimeout && !forceSubmit) {
    console.warn("Submit blocked due to cooldown");
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY, 
      },
      body: JSON.stringify(result),
    });
    

    if (!response.ok) throw new Error('Score submission failed');

    if (submitScoreTimeout) clearTimeout(submitScoreTimeout);
    submitScoreTimeout = setTimeout(() => {
      submitScoreTimeout = null;
    }, 30000); // 30s cooldown

    await fetchLeaderboard(true, result.username); // refresh with latest result
    return true;
  } catch (error) {
    console.error("Submit score failed", error);
    return false;
  }
};
