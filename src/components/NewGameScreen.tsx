import React, { useState, useEffect, useRef } from 'react';
import { Keystroke, GameState } from '../types';
import { useWindowSize } from '../hooks/useWindowSize';
import NewButton from './NewButton';

interface NewGameScreenProps {
  username: string | null;
}

const HIGH_SCORE_KEY = 'tpotracer_high_score';

const NewGameScreen: React.FC<NewGameScreenProps> = ({ username }) => {
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
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  
  const { width, height } = useWindowSize();

  // Initialize new game
  const initializeGame = () => {
    // Implementation would go here
  };

  // Handle game completion
  const handleGameComplete = () => {
    // Implementation would go here
  };

  // Start a new game
  const handleStartNewGame = () => {
    // Implementation would go here
  };

  // Load high score on mount
  useEffect(() => {
    if (!username) return;
    const storedHighScore = localStorage.getItem(`${HIGH_SCORE_KEY}_${username}`);
    if (storedHighScore) {
      setHighScore(parseFloat(storedHighScore));
    }
  }, [username]);

  // Initialize on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Handle global keypresses
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Key handling logic would go here
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, currentWordIndex, typedText, words]);

  // Calculate WPM in real-time
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      // WPM calculation logic would go here
    }
  }, [gameState, startTime, correctChars, incorrectChars, totalChars]);

  return (
    <div className="">
      <div className="game-container relative grow">
        <span className="absolute font-ptclean glow-text-shadow text-tpotracer-100 text-2xl top-[108px] left-[100px]">
          Best WPM:
        </span>
        <span className="absolute font-ptclean glow-text-shadow text-tpotracer-100 font-bold text-6xl top-[130px] left-[128px]">
          150
        </span>
        <span className="absolute font-ptclean glow-text-shadow text-tpotracer-100 font-bold text-4xl top-[96px] left-[314px]">
          4th
        </span>
        <span className="user-avatar bg-tpotracer-100 rounded-[400px] absolute w-[40px] h-[40px] top-[36px] left-[470px]">

        </span>
        <span className="absolute font-ptclean glow-text-shadow text-tpotracer-100 text-3xl top-[40px] left-[520px]">
          @marcusquest
        </span>
        <NewButton className="absolute top-[128px] left-[480px]">
          Retry (Tab)
        </NewButton>
        <NewButton className="absolute top-[128px] left-[669px]">
          Settings
        </NewButton>
        <div className="inner-screen absolute top-[226px] left-[250px] w-[474px] h-[338px] rounded-[49px] flex flex-col p-[30px]">
          <div className="badge-row">
            <ul className="flex gap-[20px]">
              <li className="font-ptclean glow-text-shadow text-2xl text-tpotracer-100">
                {"WPM: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] shadow-[0_0_1px_1px_#A7F1FA] [text-shadow:0_0_1px_#02182D]">150</span>
              </li>
              <li className="font-ptclean glow-text-shadow text-2xl text-tpotracer-100">
                {"RAW: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] shadow-[0_0_1px_1px_#A7F1FA] [text-shadow:0_0_1px_#02182D]">150</span>
              </li>
              <li className="font-ptclean glow-text-shadow text-2xl text-tpotracer-100">
                {"ACC: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] shadow-[0_0_1px_1px_#A7F1FA] [text-shadow:0_0_1px_#02182D]">100%</span>
              </li>
            </ul>
          </div>
          <div className="wordlist font-ptclean glow-text-shadow text-tpotracer-100 text-5xl mt-[20px] grow flex items-center">
          increase increase increase increase increase increase increase increase increase increase 
          </div>
        </div>
        <div className="share-preview absolute top-[609px] left-[141px] w-[304px] h-[188px] bg-tpotracer-300 rounded-[29px]">

        </div>
        <NewButton className="absolute top-[613px] left-[479px]">
          Share Image
        </NewButton>
        <NewButton className="absolute top-[613px] left-[667px]">
          Share on X
        </NewButton>
      </div>
    </div>
  );
};

export default NewGameScreen;