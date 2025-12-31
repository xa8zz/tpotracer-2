/**
 * Score validation service
 * Performs sanity checks on submitted scores to detect obvious cheating
 * Philosophy: When in doubt, let the score through
 */

// ===========================================
// VALIDATION FLAGS - Toggle checks on/off
// ===========================================

// Reject if WPM or raw WPM exceeds MAX_WPM (500)
const ENABLE_WPM_CAP_CHECK = true;

// Reject if no keystroke data is provided
const ENABLE_KEYSTROKES_REQUIRED_CHECK = true;

// Reject if no words data is provided
const ENABLE_WORDS_REQUIRED_CHECK = true;

// Reject if game completed in less than MIN_ELAPSED_TIME_MS (1 second)
const ENABLE_MIN_ELAPSED_TIME_CHECK = true;

// Reject if recalculated WPM from keystrokes differs too much from submitted WPM
const ENABLE_WPM_RECALCULATION_CHECK = true;

// Reject if keystroke intervals are suspiciously uniform (scripted/bot typing)
const ENABLE_KEYSTROKE_INTERVAL_CHECK = false;

// Reject if keystroke count is way more than expected for the words typed
const ENABLE_KEYSTROKE_COUNT_CHECK = false;

// Reject if WPM, Raw WPM, and Accuracy are mathematically inconsistent
const ENABLE_CONSISTENCY_CHECK = true;

// ===========================================
// VALIDATION THRESHOLDS
// ===========================================
const MAX_WPM = 500;
const WPM_TOLERANCE = 0.20; // 20% tolerance for WPM recalculation
const MIN_WPM_DIFF = 10; // Minimum absolute WPM difference to trigger rejection (for low scores)
const MIN_KEYSTROKE_INTERVAL_STD_DEV = 10; // ms - below this with many keystrokes is suspicious
const MIN_KEYSTROKES_FOR_INTERVAL_CHECK = 20; // Only check interval std dev with enough data
const MIN_ELAPSED_TIME_MS = 1000; // At least 1 second of gameplay

/**
 * Calculate standard deviation of an array of numbers
 * @param {number[]} values 
 * @returns {number}
 */
const calculateStdDev = (values) => {
  if (values.length < 2) return Infinity; // Can't calculate std dev with < 2 values
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Validate a score submission
 * @param {object} scoreData - The score data from the request
 * @param {number} scoreData.wpm - Submitted WPM
 * @param {number} scoreData.rawWpm - Submitted raw WPM
 * @param {number} scoreData.accuracy - Submitted accuracy
 * @param {Array<{key: string, timestamp: number}>} scoreData.keystrokes - Array of keystrokes
 * @param {string[]} scoreData.words - Array of words typed
 * @returns {{ valid: boolean, errorCode?: number }}
 * 
 * Error codes:
 * 1 - WPM cap exceeded
 * 2 - No keystroke data provided
 * 3 - No words data provided
 * 4 - Game completed too quickly
 * 5 - WPM recalculation mismatch
 * 6 - Suspicious keystroke pattern (bot/script)
 * 7 - Too many keystrokes for words
 * 8 - Inconsistent score data (WPM/Raw/Accuracy mismatch)
 */
export const validateScore = (scoreData) => {
  const { wpm, rawWpm, keystrokes, words, accuracy } = scoreData;
  
  // Check 1: WPM cap
  if (ENABLE_WPM_CAP_CHECK) {
    if (wpm > MAX_WPM) {
      return { valid: false, errorCode: 1 };
    }
    
    if (rawWpm > MAX_WPM) {
      return { valid: false, errorCode: 1 };
    }
  }
  
  // Check 2: Keystrokes must exist
  if (ENABLE_KEYSTROKES_REQUIRED_CHECK) {
    if (!keystrokes || !Array.isArray(keystrokes) || keystrokes.length === 0) {
      return { valid: false, errorCode: 2 };
    }
  }
  
  // Check 3: Words must exist
  if (ENABLE_WORDS_REQUIRED_CHECK) {
    if (!words || !Array.isArray(words) || words.length === 0) {
      return { valid: false, errorCode: 3 };
    }
  }
  
  // Early return if keystrokes not available for remaining checks
  if (!keystrokes || !Array.isArray(keystrokes) || keystrokes.length === 0) {
    return { valid: true };
  }
  
  // Check 4: Minimum elapsed time
  const firstTimestamp = keystrokes[0]?.timestamp;
  const lastTimestamp = keystrokes[keystrokes.length - 1]?.timestamp;
  
  if (!firstTimestamp || !lastTimestamp) {
    return { valid: true }; // Can't validate without timestamps, let it through
  }
  
  const elapsedTimeMs = lastTimestamp - firstTimestamp;
  
  if (ENABLE_MIN_ELAPSED_TIME_CHECK) {
    if (elapsedTimeMs < MIN_ELAPSED_TIME_MS) {
      return { valid: false, errorCode: 4 };
    }
  }
  
  // Check 5: Recalculate WPM from keystrokes and compare
  if (ENABLE_WPM_RECALCULATION_CHECK && elapsedTimeMs > 0) {
    const elapsedMinutes = elapsedTimeMs / 1000 / 60;
    const totalKeystrokes = keystrokes.length;
    const recalculatedRawWpm = (totalKeystrokes / 5) / elapsedMinutes;
    
    // Compare with submitted rawWpm
    // Only penalize if submitted rawWpm is significantly HIGHER than recalculated
    // If submitted is lower, it means the user was inefficient (e.g. typing spaces after wrong words which client ignores), which is valid.
    if (rawWpm > recalculatedRawWpm) {
      const wpmDifference = rawWpm - recalculatedRawWpm;
      const allowedDifference = recalculatedRawWpm * WPM_TOLERANCE;
      
      console.log('[Validation] WPM Check:', {
        submittedRawWpm: rawWpm.toFixed(1),
        recalculatedRawWpm: recalculatedRawWpm.toFixed(1),
        wpmDifference: wpmDifference.toFixed(1),
        allowedDifference: allowedDifference.toFixed(1),
        minWpmDiff: MIN_WPM_DIFF,
        elapsedTimeMs,
        totalKeystrokes
      });
      
      if (wpmDifference > allowedDifference && wpmDifference > MIN_WPM_DIFF) {
        console.warn('[Validation] REJECTED - Submitted Raw WPM is too high compared to keystrokes');
        return { valid: false, errorCode: 5 };
      }
    }
  }
  
  // Check 8: Consistency Check (WPM vs Raw WPM vs Accuracy)
  // WPM should be approximately Raw WPM * (Accuracy / 100)
  // We allow a generous margin for rounding differences and timing variations
  if (ENABLE_CONSISTENCY_CHECK) {
    const expectedWpm = rawWpm * (accuracy / 100);
    const difference = Math.abs(wpm - expectedWpm);
    const consistencyTolerance = 5; // Allow 5 WPM variance
    
    if (difference > consistencyTolerance) {
      console.warn('[Validation] REJECTED - WPM/Raw/Accuracy inconsistency', {
        wpm, rawWpm, accuracy, expectedWpm, difference
      });
      return { valid: false, errorCode: 8 };
    }

    // Also ensure Net WPM is not higher than Raw WPM (sanity check)
    if (wpm > rawWpm + 1) { // +1 buffer for float weirdness
       console.warn('[Validation] REJECTED - Net WPM > Raw WPM');
       return { valid: false, errorCode: 8 };
    }
  }
  
  // Check 6: Keystroke interval analysis (detect scripted typing)
  if (ENABLE_KEYSTROKE_INTERVAL_CHECK) {
    if (keystrokes.length >= MIN_KEYSTROKES_FOR_INTERVAL_CHECK) {
      const intervals = [];
      for (let i = 1; i < keystrokes.length; i++) {
        const interval = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
        // Only include reasonable intervals (not pauses between words)
        if (interval > 0 && interval < 1000) {
          intervals.push(interval);
        }
      }
      
      if (intervals.length >= MIN_KEYSTROKES_FOR_INTERVAL_CHECK) {
        const stdDev = calculateStdDev(intervals);
        
        if (stdDev < MIN_KEYSTROKE_INTERVAL_STD_DEV) {
          return { valid: false, errorCode: 6 };
        }
      }
    }
  }
  
  // Check 7: Keystroke count sanity check
  if (ENABLE_KEYSTROKE_COUNT_CHECK && words && Array.isArray(words) && words.length > 0) {
    // Expected characters = sum of word lengths + spaces between words
    const expectedChars = words.reduce((sum, word) => sum + word.length, 0) + (words.length - 1);
    const keystrokeCount = keystrokes.length;
    
    // Allow some tolerance - keystrokes could include mistakes
    // But shouldn't be way more than expected (e.g., 2x)
    if (keystrokeCount > expectedChars * 2) {
      return { valid: false, errorCode: 7 };
    }
  }
  
  // All checks passed
  return { valid: true };
};

export default { validateScore };
