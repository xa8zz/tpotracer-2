import { LeaderboardEntry } from '../types';

const LEADERBOARD_KEY = 'tpotracer_leaderboard';
const TIME_LIMIT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // One week from now

/**
 * Get the remaining time until the time limit ends
 * @returns Formatted string like "-D:hh:mm:ss"
 */
export const getRemainingTimeUntilEnd = (): string => {
  const now = new Date();
  const timeLeft = TIME_LIMIT.getTime() - now.getTime();
  
  // If time has passed, return "0:00:00:00"
  if (timeLeft <= 0) {
    return "-0:00:00:00";
  }
  
  // Calculate days, hours, minutes, seconds
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  // Format with leading zeros for hours, minutes, seconds
  const formatTime = (num: number): string => num.toString().padStart(2, '0');
  
  return `-${days}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
};

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

// Returns the badge class for a given leaderboard place (1, 2, 3 get special classes)
export function getBadgeClass(place: number): string {
  if (place >= 4) {
    return "text-tpotracer-100 glow-text-shadow-sm leaderboard-badge-plain";
  }
  return `leaderboard-badge-${place}`;
}