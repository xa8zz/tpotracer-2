import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry } from '../types';
import { 
  fetchLeaderboard, 
  isLeaderboardCacheStale, 
  getTimeUntilNextRefresh,
  LEADERBOARD_REFRESH_INTERVAL
} from '../utils/apiService';

interface UseLeaderboardProps {
  username?: string;
}

interface LeaderboardState {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  refreshTime: number;
  userPosition?: {
    position: number;
    entry: LeaderboardEntry;
  };
}

export const useLeaderboard = ({ username }: UseLeaderboardProps = {}) => {
  const [state, setState] = useState<LeaderboardState>({
    data: [],
    isLoading: true,
    error: null,
    refreshTime: 0,
    userPosition: undefined
  });

  const loadLeaderboard = useCallback(async (force = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await fetchLeaderboard(force, username);
      setState({
        data: result.data,
        isLoading: false,
        error: null,
        refreshTime: getTimeUntilNextRefresh(),
        userPosition: result.userPosition
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [username]);

  useEffect(() => {
    // Initial load
    loadLeaderboard();

    // Set up a timer to update the refresh time countdown
    const timerId = setInterval(() => {
      if (isLeaderboardCacheStale()) {
        loadLeaderboard();
      } else {
        setState(prev => ({
          ...prev,
          refreshTime: getTimeUntilNextRefresh()
        }));
      }
    }, 1000);

    // Set up an interval to refresh the leaderboard based on the refresh interval
    const refreshId = setInterval(() => {
      loadLeaderboard(true);
    }, LEADERBOARD_REFRESH_INTERVAL);

    return () => {
      clearInterval(timerId);
      clearInterval(refreshId);
    };
  }, [loadLeaderboard]);

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