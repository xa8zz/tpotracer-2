import { LeaderboardEntry, GameResult } from '../types';

// Use Vite environment variable for API base URL
// IMPORTANT: Vite env vars need the VITE_ prefix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log("API URL:", API_BASE_URL); // Good for debugging

// ... (rest of the file remains the same) ...

interface LeaderboardCache { /* ... */ }
let leaderboardCache: LeaderboardCache = { /* ... */ };
export const LEADERBOARD_REFRESH_INTERVAL = 5 * 60 * 1000;

export const isLeaderboardCacheStale = (): boolean => { /* ... */ };
export const getTimeUntilNextRefresh = (): number => { /* ... */ };

export const fetchLeaderboard = async (
  force = false,
  username?: string
): Promise<LeaderboardCache> => {
  if (!force && !isLeaderboardCacheStale()) { /* ... */ }
  try {
    // Fetch from the configured API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=20`);
    if (!response.ok) { throw new Error(/* ... */); }
    const data: LeaderboardEntry[] = await response.json();
    let userPosition;
    if (username) {
      // Fetch user rank from the configured API_BASE_URL
      const position = data.findIndex(entry => entry.username === username);
      if (position !== -1) { /* ... */ }
      else {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/leaderboard?search=${encodeURIComponent(username)}&limit=1`);
          if (userResponse.ok) { /* ... */
            const countResponse = await fetch(`${API_BASE_URL}/rank/${encodeURIComponent(username)}`);
            if (countResponse.ok) { /* ... */ }
          }
        } catch (error) { /* ... */ }
      }
    }
    leaderboardCache = { data, timestamp: Date.now(), userPosition };
    return leaderboardCache;
  } catch (error) { /* ... */ }
};

let submitScoreTimeout: ReturnType<typeof setTimeout> | null = null;

export const submitScore = async (result: GameResult, forceSubmit = false): Promise<boolean> => {
  if (submitScoreTimeout && !forceSubmit) { /* ... */ }
  try {
    // Post score to the configured API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ /* ... */ }),
    });
    if (!response.ok) { throw new Error(/* ... */); }
    if (submitScoreTimeout) { clearTimeout(submitScoreTimeout); }
    submitScoreTimeout = setTimeout(() => { submitScoreTimeout = null; }, 30000);
    await fetchLeaderboard(true, result.username);
    return true;
  } catch (error) { /* ... */ }
};