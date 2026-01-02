import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import WordDisplay from './WordDisplay';
import ScoreDisplay from './ScoreDisplay';
import { getRandomWords } from '../utils/wordUtils';
import { calculateScores } from '../utils/scoreUtils';
import { submitScore } from '../utils/apiService';
import { Keystroke, GameState } from '../types';
import SocialShareCard from './SocialShareCard';
import HelpSection from './HelpSection';
import { useWindowSize } from '../hooks/useWindowSize';
import { RotateCcw, Keyboard } from 'lucide-react';

interface GameScreenProps {
  username: string;
}

const HIGH_SCORE_KEY = 'tpotracer_high_score';

const GameScreen: React.FC<GameScreenProps> = ({ username }) => {
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  
  const { width, height } = useWindowSize();
  const contentRef = useRef<HTMLDivElement>(null);

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
    setShowConfetti(false);
  };

  // Load high score on mount
  useEffect(() => {
    const storedHighScore = localStorage.getItem(`${HIGH_SCORE_KEY}_${username}`);
    if (storedHighScore) {
      setHighScore(parseFloat(storedHighScore));
    }
  }, [username]);

  // Initialize on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Trigger confetti when showConfetti becomes true
  useEffect(() => {
    if (showConfetti) {
      const colors = ['#A7F1FA', '#77DFF6', '#2A8FC3', '#0d3f62', '#03223F', '#02182D'];
      const end = Date.now() + 2000;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [showConfetti]);

  // Handle global keypresses
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
        
        // Update character count statistics
        setTotalChars(prev => prev + 1);
        if (newTypedText.length <= currentWord.length && 
            currentWord[newTypedText.length - 1] === e.key) {
          setCorrectChars(prev => prev + 1);
        } else {
          setIncorrectChars(prev => prev + 1);
        }

        setTypedText(newTypedText);

        // Check if word is completed
        if (newTypedText === currentWord && currentWordIndex === words.length - 1) {
          handleGameComplete();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, currentWordIndex, typedText, words]);

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

  // Handle game completion
  const handleGameComplete = async () => {
    if (startTime) {
      const elapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
      const finalScores = calculateScores(
        correctChars,
        incorrectChars,
        totalChars,
        elapsedTimeInMinutes
      );

      setWpm(finalScores.wpm);
      setRawWpm(finalScores.rawWpm);
      setAccuracy(finalScores.accuracy);
      setGameState('completed');

      // Check if this is a new high score
      const isNewRecord = finalScores.wpm > highScore;
      
      if (isNewRecord) {
        // Save new high score
        localStorage.setItem(`${HIGH_SCORE_KEY}_${username}`, finalScores.wpm.toString());
        setHighScore(finalScores.wpm);
        setIsNewHighScore(true);
        setShowConfetti(true);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        
        // Submit score to backend only if it's a new high score
        const result = await submitScore({
          username,
          wpm: finalScores.wpm,
          rawWpm: finalScores.rawWpm, 
          accuracy: finalScores.accuracy,
          keystrokes,
          words
        });
        
        // Get leaderboard position after submission
        // This could be improved by getting the position directly from the API response
        // For now, we'll just set a fake position as a placeholder
        setLeaderboardPosition(Math.floor(Math.random() * 50) + 1); // Replace with actual position
      }
    }
  };

  // Start a new game
  const handleStartNewGame = () => {
    initializeGame();
  };

  // Toggle help section
  const toggleHelp = () => {
    setIsHelpExpanded(!isHelpExpanded);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full bg-gray-900 p-6 pt-12 overflow-y-auto">
      <div ref={contentRef} className="w-full max-w-3xl space-y-12">
        {/* Header with WPM counter and controls */}
        <div className="flex items-center justify-between">
          {/* Personal Best (left side) */}
          <div className="font-mono text-gray-400">
            <span className="text-xs uppercase">Personal Best</span>
            <div className="font-bold text-yellow-400 text-xl">{Math.round(highScore)} WPM</div>
          </div>

          {/* WPM Display (center) */}
          {gameState === 'completed' ? (
            <ScoreDisplay 
              wpm={wpm} 
              rawWpm={rawWpm} 
              accuracy={accuracy} 
              onRestart={handleStartNewGame}
              isNewHighScore={isNewHighScore}
            />
          ) : (
            <div className="font-mono flex flex-col items-center">
              <span className="text-5xl font-bold text-blue-500 mb-2">
                {Math.round(wpm)}
              </span>
              <span className="text-lg text-gray-400">WPM</span>
            </div>
          )}

          {/* Restart button (right side) */}
          <div className="flex flex-col items-center">
            <button 
              onClick={handleStartNewGame}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Restart test"
            >
              <RotateCcw size={20} className="text-gray-300" />
            </button>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <span>or</span>
              <span className="ml-1 bg-gray-800 px-2 py-0.5 rounded flex items-center">
                <Keyboard size={10} className="mr-1" />
                Tab
              </span>
            </div>
          </div>
        </div>

        {/* Typing test area */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <WordDisplay
            words={words}
            currentWordIndex={currentWordIndex}
            typedText={typedText}
            typedHistory={typedHistory}
            gameState={gameState}
          />
        </div>

        {/* Spacer for better visual separation */}
        <div className="h-6"></div>

        {/* Social sharing card */}
        <SocialShareCard 
          username={username} 
          wpm={gameState === 'completed' ? wpm : highScore} 
          position={leaderboardPosition}
        />

        {/* Help section (collapsible) */}
        <div>
          <button 
            onClick={toggleHelp}
            className="flex items-center justify-between w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-left"
          >
            <h3 className="text-gray-300 font-mono font-bold">Help & Instructions</h3>
            <span className="text-gray-400">{isHelpExpanded ? '▲' : '▼'}</span>
          </button>
          
          {isHelpExpanded && <HelpSection />}
        </div>

        {/* Bottom spacing for better scrolling */}
        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default GameScreen;