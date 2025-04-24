import { Keystroke, GameResult } from '../types';
import { updateLeaderboard } from './leaderboardUtils';

/**
 * Record a keystroke (can be extended to send to backend in real-time)
 * @param keystroke The keystroke to record
 */
export const recordKeystroke = (keystroke: Keystroke): void => {
  // This is a placeholder function that could be expanded
  // to send keystroke data to a backend in real-time
  console.log('Keystroke recorded:', keystroke);
};

/**
 * Submit game results to the backend
 * @param result Game result data
 */
export const submitGameResults = (result: GameResult): void => {
  // Update local leaderboard immediately
  updateLeaderboard({
    username: result.username,
    wpm: result.wpm,
    timestamp: Date.now()
  });

  // This would typically be an API call to submit results
  // For now, we'll just log it to the console
  console.log('Game results submitted:', result);
  
  // Simulate an async function call to a backend
  setTimeout(() => {
    console.log('Backend updated with game results');
  }, 500);
};