import { ScoreData } from '../types';

/**
 * Calculate WPM, Raw WPM, and Accuracy
 * @param correctChars Number of correctly typed characters
 * @param incorrectChars Number of incorrectly typed characters
 * @param totalChars Total number of characters typed
 * @param elapsedTimeInMinutes Time elapsed in minutes
 * @returns Object with calculated WPM, Raw WPM, and Accuracy
 */
export const calculateScores = (
  correctChars: number,
  incorrectChars: number,
  totalChars: number,
  elapsedTimeInMinutes: number
): ScoreData => {
  // Calculate raw WPM (all characters / 5) / time
  const rawWpm = totalChars > 0 && elapsedTimeInMinutes > 0
    ? (totalChars / 5) / elapsedTimeInMinutes
    : 0;
  
  // Calculate WPM (correct characters / 5) / time
  const wpm = correctChars > 0 && elapsedTimeInMinutes > 0
    ? (correctChars / 5) / elapsedTimeInMinutes
    : 0;
  
  // Calculate accuracy (percentage of correct keystrokes)
  const accuracy = totalChars > 0
    ? (correctChars / totalChars) * 100
    : 100; // Default to 100% if no chars typed
  
  return {
    wpm,
    rawWpm,
    accuracy
  };
};