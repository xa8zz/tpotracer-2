import { LeaderboardEntry } from '../types';

const LEADERBOARD_KEY = 'tpotracer_leaderboard';

/**
 * Get the leaderboard data from local storage
 * @returns Array of leaderboard entries
 */
export const getLeaderboard = (): LeaderboardEntry[] => {
  const storedData = localStorage.getItem(LEADERBOARD_KEY);
  if (!storedData) {
    return [];
  }
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing leaderboard data:', error);
    return [];
  }
};

/**
 * Update the leaderboard with a new entry
 * @param entry The new leaderboard entry
 */
export const updateLeaderboard = (entry: LeaderboardEntry): void => {
  const leaderboard = getLeaderboard();
  
  // Check if user already exists
  const existingIndex = leaderboard.findIndex(item => item.username === entry.username);
  
  if (existingIndex >= 0) {
    // Update only if new WPM is higher
    if (entry.wpm > leaderboard[existingIndex].wpm) {
      leaderboard[existingIndex] = entry;
    }
  } else {
    // Add new entry
    leaderboard.push(entry);
  }
  
  // Sort by WPM (highest first)
  leaderboard.sort((a, b) => b.wpm - a.wpm);
  
  // Save to localStorage
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
};