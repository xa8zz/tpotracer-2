import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry } from '../types';
import {
  fetchLeaderboard,
  fetchMoreLeaderboard,
  getTimeUntilNextRefresh,
  LEADERBOARD_REFRESH_INTERVAL,
  subscribe
} from '../utils/apiService';

interface UseLeaderboardProps {
  username: string | null;
}

interface LeaderboardState {
  data: LeaderboardEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refreshTime: number;
  userPosition?: number;
  hasMore: boolean;
}

export const useLeaderboard = ({ username }: UseLeaderboardProps = { username: null }) => {
  const [state, setState] = useState<LeaderboardState>({
    data: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    refreshTime: Math.ceil(LEADERBOARD_REFRESH_INTERVAL / 1000),
    userPosition: undefined,
    hasMore: true
  });

  // Load initial leaderboard data
  const loadLeaderboard = useCallback(async (force = false) => {
    if (force || state.isLoading || state.error) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }
    try {
      const result = await fetchLeaderboard(force, username);
      setState(prev => ({
        ...prev,
        data: result.data,
        isLoading: false,
        error: null,
        refreshTime: Math.ceil(getTimeUntilNextRefresh() / 1000),
        userPosition: result.userPosition,
        hasMore: result.hasMore
      }));
    } catch (error) {
      console.error("Error in loadLeaderboard callback:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred fetching leaderboard'
      }));
    }
  }, [username, state.isLoading, state.error]);

  // Load more entries (pagination)
  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return;
    
    setState(prev => ({ ...prev, isLoadingMore: true }));
    try {
      const result = await fetchMoreLeaderboard(state.data);
      setState(prev => ({
        ...prev,
        data: result.data,
        isLoadingMore: false,
        hasMore: result.hasMore,
        userPosition: result.userPosition ?? prev.userPosition
      }));
    } catch (error) {
      console.error("Error loading more leaderboard data:", error);
      setState(prev => ({ ...prev, isLoadingMore: false }));
    }
  }, [state.data, state.isLoadingMore, state.hasMore]);

  // Effect for initial load and setting up intervals
  useEffect(() => {
    loadLeaderboard();

    // Subscribe to service updates (e.g. from score submission)
    const unsubscribe = subscribe(() => {
      loadLeaderboard(false);
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
      loadLeaderboard(true);
    }, LEADERBOARD_REFRESH_INTERVAL);

    return () => {
      unsubscribe();
      clearInterval(timerId);
      clearInterval(refreshId);
    };
  }, [loadLeaderboard]);

  // Manual refresh
  const forceRefresh = useCallback(() => {
    loadLeaderboard(true);
  }, [loadLeaderboard]);

  return {
    leaderboardData: state.data,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.hasMore,
    error: state.error,
    refreshTime: state.refreshTime,
    userPosition: state.userPosition,
    forceRefresh,
    loadMore
  };
};
