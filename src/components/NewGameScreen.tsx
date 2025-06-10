import React, { useRef } from 'react';
import NewButton from './NewButton';
import Cursor from './Cursor';
import { useGameContext } from '../contexts/GameContext';
import { preloadGameAssets } from '../utils/preloadAssets';
import { whenVideoPlaying } from '../utils/youtube';

interface NewGameScreenProps {
  username: string | null;
  onSettingsClick: () => void;
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};

// Helper function to render padded numbers with leading zeros at 0.4 opacity
const renderPaddedNumber = (num: number): JSX.Element => {
  const cappedNum = Math.min(Math.round(num), 999); // Cap at 999
  const numStr = cappedNum.toString();
  const paddedStr = numStr.padStart(3, '0');
  
  // If the actual number is 0, all digits should have low opacity
  const isActualZero = cappedNum === 0;
  
  return (
    <>
      {paddedStr.split('').map((digit, index) => (
        <span 
          key={index} 
          className={isActualZero || index < 3 - numStr.length ? 'opacity-40' : ''}
        >
          {digit}
        </span>
      ))}
    </>
  );
};

// Helper function to render words with typing progress
const renderWordsWithProgress = (
  words: string[], 
  currentWordIndex: number, 
  typedText: string, 
  typedHistory: string[],
  cursorRef: React.RefObject<HTMLSpanElement>
): JSX.Element => {
  const incorrectCharClass = 'text-red-300 opacity-100 [text-shadow:0_0_2px_rgb(252,165,165)]';

  return (
    <>
      {words.map((word, wordIndex) => {
        if (wordIndex < currentWordIndex) {
          // Word has been completed - show typing history with correct/incorrect styling
          const typedWord = typedHistory[wordIndex] || '';
          return (
            <span key={wordIndex} className="inline-block">
              {word.split('').map((char, charIndex) => {
                const typedChar = typedWord[charIndex];
                const wasTyped = charIndex < typedWord.length;
                const wasCorrect = wasTyped && typedChar === char;
                
                let className = 'text-tpotracer-100 ';
                if (wasTyped) {
                  className += wasCorrect ? 'opacity-100' : incorrectCharClass;
                } else {
                  // Character was never typed (word was shorter than expected)
                  className += 'opacity-40';
                }
                
                return (
                  <span key={charIndex} className={className}>
                    {char}
                  </span>
                );
              })}
            </span>
          );
        } else if (wordIndex === currentWordIndex) {
          // Current word being typed
          return (
            <span key={wordIndex} className="inline-block relative">
              {word.split('').map((char, charIndex) => {
                const isTyped = charIndex < typedText.length;
                const isCorrect = isTyped && typedText[charIndex] === char;
                const isCursorPosition = charIndex === typedText.length && typedText.length < word.length;
                
                let className = 'text-tpotracer-100 ';
                if (isTyped) {
                  className += isCorrect ? 'opacity-100' : incorrectCharClass;
                } else {
                  className += 'opacity-40';
                }
                
                return (
                  <span key={charIndex} className="relative">
                    <span className={className}>
                      {char}
                    </span>
                    {isCursorPosition && (
                      <span 
                        ref={cursorRef}
                        className="absolute left-0 top-0 w-0 h-full opacity-0 pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                );
              })}
              {/* Handle cursor at the end of completed current word - stays here until space is pressed */}
              {typedText.length === word.length && (
                <span 
                  ref={cursorRef}
                  className="absolute opacity-0 pointer-events-none top-0 h-full"
                  style={{ left: '100%' }}
                  aria-hidden="true"
                />
              )}
            </span>
          );
        } else {
          // Future words - tpotracer-100 with low opacity
          return (
            <span key={wordIndex} className="text-tpotracer-100 opacity-40 inline-block">
              {word}
            </span>
          );
        }
      })}
    </>
  );
};

const NewGameScreen: React.FC<NewGameScreenProps> = ({ username, onSettingsClick }) => {
  // Create ref for cursor positioning
  const cursorRef = useRef<HTMLSpanElement>(null);
  
  // Destructure all values and functions from game context
  const {
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
    showConfetti,
    isHelpExpanded,
    leaderboardPosition,
    width,
    height,
    initializeGame,
    handleGameComplete,
    handleStartNewGame,
    toggleHelp,
  } = useGameContext();

  // Determine if cursor should be visible (during typing states)
  const isCursorVisible = gameState === 'playing' || gameState === 'waiting';

  return (
    <div className="">
      <div className="game-container relative grow">
        <span className="absolute font-ptclean glow-text-shadow-sm text-tpotracer-100 text-2xl top-[108px] left-[104px]">
          Best WPM:
        </span>
        <span className="absolute font-ptclean glow-text-shadow-sm text-tpotracer-100 font-bold text-6xl top-[130px] left-[122px]">
          {renderPaddedNumber(highScore)}
        </span>
        <span className="absolute font-ptclean glow-text-shadow-sm text-tpotracer-100 font-bold text-4xl top-[96px] left-[314px]">
          {leaderboardPosition ? (
            <>
              {leaderboardPosition}
              <sup className="text-2xl">{getOrdinalSuffix(leaderboardPosition)}</sup>
            </>
          ) : ''}
        </span>
        <span className="user-avatar bg-tpotracer-100 rounded-[400px] absolute w-[40px] h-[40px] top-[36px] left-[470px]">

        </span>
        <span className="absolute font-ptclean glow-text-shadow-sm text-tpotracer-100 text-3xl top-[40px] left-[520px]">
          @{username}
        </span>
        <NewButton className="absolute top-[121px] left-[473px]" onClick={handleStartNewGame}>
          Retry (Tab)
        </NewButton>
        <NewButton className="absolute top-[121px] left-[661px]" onClick={onSettingsClick}>
          Settings
        </NewButton>
        <div className="inner-screen absolute top-[226px] left-[250px] w-[474px] h-[338px] rounded-[49px] flex flex-col p-[30px]">
          <div className="badge-row">
            <ul className="flex gap-[20px]">
              <li className="font-ptclean glow-text-shadow-sm text-2xl text-tpotracer-100">
                {"WPM: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] glow-shadow-sm dark-text-shadow">{renderPaddedNumber(wpm)}</span>
              </li>
              <li className="font-ptclean glow-text-shadow-sm text-2xl text-tpotracer-100">
                {"RAW: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] glow-shadow-sm dark-text-shadow">{renderPaddedNumber(rawWpm)}</span>
              </li>
              <li className="font-ptclean glow-text-shadow-sm text-2xl text-tpotracer-100">
                {"ACC: "}
                <span className="bg-tpotracer-100 text-tpotracer-400 font-bold px-[10px] pt-[2px] rounded-[4px] glow-shadow-sm dark-text-shadow">{Math.round(accuracy)}%</span>
              </li>
            </ul>
          </div>
          <div className="grow mt-[20px] flex justify-center">
          <div className="wordlist font-ptclean content-center glow-text-shadow-sm text-tpotracer-100 text-5xl mt-[20px] flex flex-wrap items-start gap-x-5">
            {renderWordsWithProgress(words, currentWordIndex, typedText, typedHistory, cursorRef)}
          </div>
          </div>
        </div>
        <div className="share-preview absolute top-[609px] left-[141px] w-[304px] h-[188px] bg-tpotracer-300 rounded-[29px]">
        </div>
        <NewButton className="absolute top-[606px] left-[471px]">
          Share Image
        </NewButton>
        <NewButton className="absolute top-[606px] left-[659px]">
          Share on X
        </NewButton>
        
        {/* Custom Cursor Component */}
        <Cursor targetRef={cursorRef} isVisible={isCursorVisible} />
      </div>
    </div>
  );
};

export default NewGameScreen;