import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/leaderboardUtils';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Initial load
    const loadLeaderboard = () => {
      const data = getLeaderboard();
      setLeaderboardData(data);
    };

    loadLeaderboard();

    // Set up a listener for storage events to update if another tab changes the leaderboard
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tpotracer_leaderboard') {
        loadLeaderboard();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Create an interval to check for updates
    const intervalId = setInterval(loadLeaderboard, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  return { leaderboardData };
};