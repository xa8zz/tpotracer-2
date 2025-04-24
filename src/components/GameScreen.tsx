import React, { useState, useEffect } from 'react';
import WordDisplay from './WordDisplay';
import ScoreDisplay from './ScoreDisplay';
import { getRandomWords } from '../utils/wordUtils';
import { calculateScores } from '../utils/scoreUtils';
import { recordKeystroke, submitGameResults } from '../utils/gameUtils';
import { Keystroke, GameState } from '../types';

interface GameScreenProps {
  username: string;
}

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
  };

  // Initialize on component mount
  useEffect(() => {
    initializeGame();
  }, []);

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
      recordKeystroke(keystroke);

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
  const handleGameComplete = () => {
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

      // Submit results to backend
      submitGameResults({
        username,
        wpm: finalScores.wpm,
        rawWpm: finalScores.rawWpm, 
        accuracy: finalScores.accuracy,
        keystrokes,
        words
      });
    }
  };

  // Start a new game
  const handleStartNewGame = () => {
    initializeGame();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6">
      <div className="w-full max-w-3xl">
        {/* Header with WPM counter */}
        <div className="mb-8 text-center">
          {gameState === 'completed' ? (
            <ScoreDisplay 
              wpm={wpm} 
              rawWpm={rawWpm} 
              accuracy={accuracy} 
              onRestart={handleStartNewGame}
            />
          ) : (
            <div className="font-mono flex flex-col items-center">
              <span className="text-5xl font-bold text-blue-500 mb-2">
                {Math.round(wpm)}
              </span>
              <span className="text-lg text-gray-400">WPM</span>
            </div>
          )}
        </div>

        {/* Word display area */}
        <div className="mb-8">
          <WordDisplay 
            words={words}
            currentWordIndex={currentWordIndex}
            typedText={typedText}
            typedHistory={typedHistory}
            gameState={gameState}
          />
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-400 mt-8">
          {gameState === 'completed' ? (
            <div className="flex flex-col items-center gap-4">
              <p>Press Tab to start a new test</p>
              <button 
                onClick={handleStartNewGame}
                className="px-6 py-2 bg-blue-600 text-white font-mono rounded hover:bg-blue-700 transition-colors duration-200"
              >
                New Test (or press Tab)
              </button>
            </div>
          ) : gameState === 'waiting' ? (
            "Start typing to begin..."
          ) : (
            "Press Tab to restart at any time"
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;