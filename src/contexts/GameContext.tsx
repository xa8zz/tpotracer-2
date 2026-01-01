import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getRandomWords } from '../utils/wordUtils';
import { calculateScores } from '../utils/scoreUtils';
import { submitScore, fetchLeaderboard } from '../utils/apiService';
import { Keystroke, GameState } from '../types';
import { useWindowSize } from '../hooks/useWindowSize';
import { initSoundService, playClick, playError } from '../utils/soundService';

interface GameContextType {
  // State values
  words: string[];
  currentWordIndex: number;
  typedText: string;
  typedHistory: string[];
  keystrokes: Keystroke[];
  gameState: GameState;
  startTime: number | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  highScore: number;
  isNewHighScore: boolean;
  isSubmittingScore: boolean;
  isRetryingScore: boolean;
  isScoreInvalid: boolean;
  invalidErrorCode: number | null;
  showConfetti: boolean;
  isHelpExpanded: boolean;
  leaderboardPosition: number | null;
  wpmToBeat: number | null;
  width: number;
  height: number;
  
  // Functions
  initializeGame: () => void;
  handleGameComplete: () => Promise<void>;
  handleStartNewGame: () => void;
  toggleHelp: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const HIGH_SCORE_KEY = 'tpotracer_high_score';

interface GameContextProviderProps {
  children: ReactNode;
  username: string;
}

export const GameContextProvider: React.FC<GameContextProviderProps> = ({ children, username }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isRetryingScore, setIsRetryingScore] = useState(false);
  const [isScoreInvalid, setIsScoreInvalid] = useState(false);
  const [invalidErrorCode, setInvalidErrorCode] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [wpmToBeat, setWpmToBeat] = useState<number | null>(null);
  
  const { width, height } = useWindowSize();

  // Initialize new game
  const initializeGame = () => {
    const newWords = getRandomWords(10);
    setWords(newWords);
    setCurrentWordIndex(0);
    setTypedText('');
    setTypedHistory([]);
    setKeystrokes([]);
    setGameState('waiting');
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalChars(0);
    setIsNewHighScore(false);
    setIsScoreInvalid(false);
    setInvalidErrorCode(null);
    setShowConfetti(false);
  };

  // Handle game completion
  const handleGameComplete = async (finalCorrect?: number, finalIncorrect?: number, finalTotal?: number) => {
    if (startTime) {
      const elapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
      const finalScores = calculateScores(
        finalCorrect ?? correctChars,
        finalIncorrect ?? incorrectChars,
        finalTotal ?? totalChars,
        elapsedTimeInMinutes
      );

      setWpm(finalScores.wpm);
      setRawWpm(finalScores.rawWpm);
      setAccuracy(finalScores.accuracy);
      setGameState('completed');

      // Check if this is a new high score
      const isNewRecord = finalScores.wpm > highScore;
      
      if (isNewRecord) {
        // Optimistically update state (but not localStorage yet)
        setHighScore(finalScores.wpm);
        setIsNewHighScore(true);
        setShowConfetti(true);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }

      // Submit score to backend only if it's better than current known best 
      // OR if there is no current known best (highScore is 0)
      if (isNewRecord || highScore === 0) {
        setIsSubmittingScore(true);
        setIsRetryingScore(false);
        
        let success = false;
        let attempts = 0;
        const maxAttempts = 3; // Initial + 2 retries

        while (!success && attempts < maxAttempts) {
          attempts++;
          // Wait a bit before retrying if this isn't the first attempt
          if (attempts > 1) {
            setIsRetryingScore(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const result = await submitScore({
            username,
            wpm: finalScores.wpm,
            rawWpm: finalScores.rawWpm, 
            accuracy: finalScores.accuracy,
            keystrokes,
            words
          });
          
          if (result && result.success) {
            success = true;
            if (result.rank) {
                 setLeaderboardPosition(result.rank);
            }
            // Set wpmToBeat (null if user is #1)
            setWpmToBeat(result.wpmToBeat ?? null);
            
            // Save new high score to local storage ONLY on success
            if (isNewRecord) {
              localStorage.setItem(`${HIGH_SCORE_KEY}_${username}`, finalScores.wpm.toString());
            }
          } else if (result && result.invalid) {
            // Score was rejected as invalid (cheating detected)
            setIsScoreInvalid(true);
            setInvalidErrorCode(result.errorCode ?? null);
            // Don't retry if the score is invalid
            break;
          }
        }
        
        setIsSubmittingScore(false);
        setIsRetryingScore(false);
      }
      
      // Fetch updated leaderboard to get real rank
      try {
        const cache = await fetchLeaderboard(true, username);
        if (cache.userPosition) {
           setLeaderboardPosition(cache.userPosition);
        }
      } catch (e) {
        console.error("Failed to update rank after game", e);
      }

    }
  };

  // Start a new game
  const handleStartNewGame = useCallback(() => {
    if (isSubmittingScore) return;
    initializeGame();
  }, [isSubmittingScore]);

  // Toggle help section
  const toggleHelp = () => {
    setIsHelpExpanded(!isHelpExpanded);
  };

  // Load high score and rank on username change
  useEffect(() => {
    // Reset state for new user
    setLeaderboardPosition(null);
    setIsNewHighScore(false);
    initializeGame();

    if (!username) {
      setHighScore(0);
      return;
    }

    // Load local high score
    const storedHighScore = localStorage.getItem(`${HIGH_SCORE_KEY}_${username}`);
    if (storedHighScore) {
      setHighScore(parseFloat(storedHighScore));
    } else {
      setHighScore(0);
    }

    // Fetch initial rank
    const fetchInitialRank = async () => {
      try {
        const cache = await fetchLeaderboard(false, username); 
        if (cache.userPosition) {
          setLeaderboardPosition(cache.userPosition);
        }
      } catch (e) {
        console.error("Failed to fetch initial rank", e);
      }
    };
    fetchInitialRank();
  }, [username]);

  // Initialize on component mount
  useEffect(() => {
    initializeGame();
    // Initialize sound service (lazy load)
    initSoundService();
  }, []);

  // Handle global keypresses
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If an input or textarea is focused, don't handle game keypresses
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      // Don't capture modifier key combinations (e.g., Cmd+C, Ctrl+V)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Handle Tab key press at any time to restart the game
      if (e.code === 'Tab') {
        e.preventDefault();
        handleStartNewGame();
        return;
      }

      // Prevent default for space to avoid scrolling
      if (e.key === ' ') {
        e.preventDefault();
      }

      // Don't handle keys if game is completed
      if (gameState === 'completed') {
        if (e.code === 'Tab') {
          e.preventDefault();
          handleStartNewGame();
        }
        return;
      }

      // Record keystroke
      const keystroke: Keystroke = {
        key: e.key,
        timestamp: Date.now()
      };
      
      setKeystrokes(prev => [...prev, keystroke]);

      // Start the game if it's not already playing
      if (gameState === 'waiting') {
        setGameState('playing');
        setStartTime(Date.now());
      }

      // Handle space key (move to next word)
      if (e.key === ' ' && typedText.length > 0) {
        // Play click sound for space
        playClick();
        
        // Count space as a correct character when the word is typed correctly
        const currentWord = words[currentWordIndex];
        if (typedText === currentWord) {
          setCorrectChars(prev => prev + 1);
          setTotalChars(prev => prev + 1);
        }

        // Store the typed text in history
        setTypedHistory(prev => {
          const newHistory = [...prev];
          newHistory[currentWordIndex] = typedText;
          return newHistory;
        });

        // If this is the last word, complete the game
        if (currentWordIndex === words.length - 1) {
          handleGameComplete();
          return;
        }

        setCurrentWordIndex(prev => prev + 1);
        setTypedText('');
        return;
      }

      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault(); // Prevent the default backspace behavior
        return;
      }

      // Handle regular keypress
      if (e.key.length === 1) {
        const currentWord = words[currentWordIndex];
        const newTypedText = typedText + e.key;
        
        // Calculate new stats locally to pass to handleGameComplete if needed
        let newCorrectChars = correctChars;
        let newIncorrectChars = incorrectChars;
        const newTotalChars = totalChars + 1;

        // Update character count statistics and play appropriate sound
        setTotalChars(prev => prev + 1);
        if (newTypedText.length <= currentWord.length && 
            currentWord[newTypedText.length - 1] === e.key) {
          // Correct character - play click sound
          playClick();
          setCorrectChars(prev => prev + 1);
          newCorrectChars++;
        } else {
          // Incorrect character - play error sound
          playError();
          setIncorrectChars(prev => prev + 1);
          newIncorrectChars++;
        }

        setTypedText(newTypedText);

        // Check if word is completed (auto-complete if reached end of word on last word)
        if (currentWordIndex === words.length - 1 && newTypedText.length === currentWord.length) {
          handleGameComplete(newCorrectChars, newIncorrectChars, newTotalChars);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, currentWordIndex, typedText, words, handleStartNewGame]);

  // Calculate WPM in real-time
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      // Calculate immediately first
      const elapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
      if (elapsedTimeInMinutes > 0) {
        const scores = calculateScores(
          correctChars,
          incorrectChars,
          totalChars,
          elapsedTimeInMinutes
        );
        
        setWpm(scores.wpm);
        setRawWpm(scores.rawWpm);
        setAccuracy(scores.accuracy);
      }

      // Then set up interval for future updates
      const intervalId = setInterval(() => {
        const currentElapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
        if (currentElapsedTimeInMinutes > 0) {
          const scores = calculateScores(
            correctChars,
            incorrectChars,
            totalChars,
            currentElapsedTimeInMinutes
          );
          
          setWpm(scores.wpm);
          setRawWpm(scores.rawWpm);
          setAccuracy(scores.accuracy);
        }
      }, 250);

      return () => clearInterval(intervalId);
    }
  }, [gameState, startTime, correctChars, incorrectChars, totalChars]);

  const contextValue: GameContextType = {
    // State values
    words,
    currentWordIndex,
    typedText,
    typedHistory,
    keystrokes,
    gameState,
    startTime,
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalChars,
    highScore,
    isNewHighScore,
    isSubmittingScore,
    isRetryingScore,
    isScoreInvalid,
    invalidErrorCode,
    showConfetti,
    isHelpExpanded,
    leaderboardPosition,
    wpmToBeat,
    width,
    height,
    
    // Functions
    initializeGame,
    handleGameComplete,
    handleStartNewGame,
    toggleHelp,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
}; 