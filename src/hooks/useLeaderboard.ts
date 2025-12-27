import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry } from '../types';
import {
  fetchLeaderboard,
  getTimeUntilNextRefresh,
  LEADERBOARD_REFRESH_INTERVAL,
  subscribe
} from '../utils/apiService'; // Removed isLeaderboardCacheStale import as it's not directly used here now

interface UseLeaderboardProps {
  username: string | null;
}

interface LeaderboardState {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  refreshTime: number; // Seconds until next refresh
  userPosition?: number;
};

export const useLeaderboard = ({ username }: UseLeaderboardProps = { username: null}) => {
  const [state, setState] = useState<LeaderboardState>({
    data: [],
    isLoading: true,
    error: null,
    refreshTime: Math.ceil(LEADERBOARD_REFRESH_INTERVAL / 1000), // Initial display value
    userPosition: undefined
  });

  // Memoized function to load leaderboard data
  const loadLeaderboard = useCallback(async (force = false) => {
    // Only set loading if we are actually fetching (or forced)
    if (force || state.isLoading || state.error) {
         setState(prev => ({ ...prev, isLoading: true, error: null }));
    }
    try {
      const result = await fetchLeaderboard(force, username); // fetchLeaderboard handles its own cache check
      setState(prev => ({ // Use functional update to avoid stale state issues
        ...prev,
        data: result.data,
        isLoading: false,
        error: null, // Clear error on success
        refreshTime: Math.ceil(getTimeUntilNextRefresh() / 1000), // Update countdown on successful fetch
        userPosition: result.userPosition
      }));
    } catch (error) {
      console.error("Error in loadLeaderboard callback:", error);
      setState(prev => ({ // Use functional update
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred fetching leaderboard'
      }));
    }
  }, [username, state.isLoading, state.error]); // Add dependencies that might influence fetching logic

  // Effect for initial load and setting up intervals
  useEffect(() => {
    // Initial load
    loadLeaderboard();

    // Subscribe to service updates (e.g. from score submission)
    const unsubscribe = subscribe(() => {
      loadLeaderboard(false); // Fetch from (now fresh) cache
    });

    // Interval to update the countdown timer display every second
    const timerId = setInterval(() => {
      setState(prev => ({
        ...prev,
        refreshTime: Math.ceil(getTimeUntilNextRefresh() / 1000)
      }));
    }, 1000);

    // Interval to force refresh the data periodically
    const refreshId = setInterval(() => {
      loadLeaderboard(true); // Force refresh
    }, LEADERBOARD_REFRESH_INTERVAL);

    // Cleanup function to clear intervals when the component unmounts or dependencies change
    return () => {
      unsubscribe();
      clearInterval(timerId);
      clearInterval(refreshId);
    };
    // Rerun effect if loadLeaderboard function identity changes (due to username change)
  }, [loadLeaderboard]);

  // Function to allow manual refresh from the component
  const forceRefresh = useCallback(() => {
    loadLeaderboard(true);
  }, [loadLeaderboard]);

  return {
    leaderboardData: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refreshTime: state.refreshTime,
    userPosition: state.userPosition,
    forceRefresh
  };
};