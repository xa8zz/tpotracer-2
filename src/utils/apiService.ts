import { LeaderboardEntry, GameResult } from '../types';

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Interface for leaderboard cache
interface LeaderboardCache {
  data: LeaderboardEntry[];
  timestamp: number;
  userPosition?: { position: number; entry: LeaderboardEntry };
}

// Cache for leaderboard data
let leaderboardCache: LeaderboardCache = { 
  data: [], 
  timestamp: 0 
};

// Refresh interval in milliseconds (5 minutes)
export const LEADERBOARD_REFRESH_INTERVAL = 5 * 60 * 1000; 

/**
 * Check if leaderboard cache needs refresh
 * @returns boolean indicating if cache is stale
 */
export const isLeaderboardCacheStale = (): boolean => {
  return Date.now() - leaderboardCache.timestamp > LEADERBOARD_REFRESH_INTERVAL;
};

/**
 * Get time remaining until next refresh in seconds
 * @returns number of seconds until next refresh
 */
export const getTimeUntilNextRefresh = (): number => {
  const timeElapsed = Date.now() - leaderboardCache.timestamp;
  const timeRemaining = LEADERBOARD_REFRESH_INTERVAL - timeElapsed;
  return Math.max(0, Math.floor(timeRemaining / 1000));
};

/**
 * Fetch leaderboard data from the API
 * @param force Force refresh even if cache is valid
 * @param username Current user's username to find their position
 * @returns Promise with leaderboard data
 */
export const fetchLeaderboard = async (
  force = false, 
  username?: string
): Promise<LeaderboardCache> => {
  // Return cached data if it's fresh and not forcing refresh
  if (!force && !isLeaderboardCacheStale()) {
    return leaderboardCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=20`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: LeaderboardEntry[] = await response.json();
    let userPosition;
    
    // Find user position if username is provided
    if (username) {
      const position = data.findIndex(entry => entry.username === username);
      if (position !== -1) {
        userPosition = { position, entry: data[position] };
      } else {
        // Try to fetch user's position in a separate call if not in top 20
        try {
          const userResponse = await fetch(`${API_BASE_URL}/leaderboard?search=${encodeURIComponent(username)}&limit=1`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.length > 0) {
              // Calculate position (this would need a separate API endpoint in a real app)
              const countResponse = await fetch(`${API_BASE_URL}/rank/${encodeURIComponent(username)}`);
              if (countResponse.ok) {
                const { rank } = await countResponse.json();
                userPosition = { position: rank, entry: userData[0] };
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user position:', error);
        }
      }
    }
    
    // Update cache
    leaderboardCache = {
      data,
      timestamp: Date.now(),
      userPosition
    };
    
    return leaderboardCache;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    // Return cached data even if stale in case of API failure
    if (leaderboardCache.data.length > 0) {
      return leaderboardCache;
    }
    
    // If no cached data, return empty array
    return { data: [], timestamp: 0 };
  }
};

// Timeout for score submission to prevent spam
let submitScoreTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Submit a new score to the backend
 * @param result Game result data
 * @param forceSubmit Force submission even if throttling is active
 * @returns Promise<boolean> indicating success
 */
export const submitScore = async (result: GameResult, forceSubmit = false): Promise<boolean> => {
  // Check if throttling is active
  if (submitScoreTimeout && !forceSubmit) {
    console.log('Score submission throttled. Try again later.');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: result.username,
        wpm: result.wpm,
        rawWpm: result.rawWpm,
        accuracy: result.accuracy,
        keystrokes: result.keystrokes,
        words: result.words
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Set throttling timeout (30 seconds)
    if (submitScoreTimeout) {
      clearTimeout(submitScoreTimeout);
    }
    
    submitScoreTimeout = setTimeout(() => {
      submitScoreTimeout = null;
    }, 30000);

    // Force refresh leaderboard cache
    await fetchLeaderboard(true, result.username);
    
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
};

// Additional API endpoints can be added here 