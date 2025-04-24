import React, { useState, useEffect, useRef } from 'react';
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
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize new game
  const initializeGame = () => {
    const newWords = getRandomWords(10);
    setWords(newWords);
    setCurrentWordIndex(0);
    setTypedText('');
    setKeystrokes([]);
    setGameState('waiting');
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalChars(0);
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Keep input focused and handle global keypresses
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key press at any time to restart the game
      if (e.code === 'Tab') {
        e.preventDefault();
        handleStartNewGame();
        return;
      }

      // Don't handle keys if they're pressed while typing in the input
      if (e.target instanceof HTMLInputElement) {
        return;
      }

      // Don't capture modifier key combinations (e.g., Cmd+C, Ctrl+V)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Focus input and simulate the keypress if it's a printable character
      if (inputRef.current && e.key.length === 1) {
        e.preventDefault();
        inputRef.current.focus();
        // Simulate the keypress in the input
        const newEvent = new KeyboardEvent('keydown', {
          key: e.key,
          code: e.code,
          bubbles: true
        });
        inputRef.current.dispatchEvent(newEvent);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState]);

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

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Tab key press to restart game
    if (e.key === 'Tab') {
      e.preventDefault();
      handleStartNewGame();
      return;
    }

    // Prevent default for space to avoid scrolling
    if (e.key === ' ') {
      e.preventDefault();
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
      return; // The onChange handler will update typedText
    }

    // Handle regular keypress
    if (e.key.length === 1) {
      const currentWord = words[currentWordIndex];
      const newTypedText = typedText + e.key;
      const isCorrect = currentWord.startsWith(newTypedText);
      
      // Update character count statistics
      setTotalChars(prev => prev + 1);
      if (newTypedText.length <= currentWord.length && 
          currentWord[newTypedText.length - 1] === e.key) {
        setCorrectChars(prev => prev + 1);
      } else {
        setIncorrectChars(prev => prev + 1);
      }

      // Check if word is completed
      if (newTypedText === currentWord && currentWordIndex === words.length - 1) {
        handleGameComplete();
      }
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedText(e.target.value);
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
            gameState={gameState}
          />
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full p-4 text-2xl bg-gray-800 border-2 border-gray-700 rounded-md focus:border-blue-500 outline-none font-mono text-white"
            placeholder={gameState === 'completed' ? "Type to start a new test..." : "Start typing..."}
            aria-label="Type here"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            disabled={gameState === 'completed'}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;