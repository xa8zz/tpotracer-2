import React, { useState, useEffect, useRef } from 'react';
import NewButton from './NewButton';
import Cursor from './Cursor';
import { useGameContext } from '../contexts/GameContext';
import { preloadGameAssets } from '../utils/preloadAssets';
import UserAvatar from './UserAvatar';
import { getBadgeClass } from '../utils/leaderboardUtils';
import html2canvas from 'html2canvas';
import sharableBg from '../assets/sharable.png';
import logo from '../assets/logosm.png';

// Flag to hide share preview card contents (keeps background visible)
const HIDE_SHARE_PREVIEW_CONTENTS = false;

// Flag to force display "GAME INVALID :(" message (for testing)
const FORCE_SHOW_INVALID = false;

interface NewGameScreenProps {
  username: string | null;
  onSettingsClick: () => void;
}

// DEBUG FLAG: Set to true to preview the share card in center of screen
const DEBUG_SHOW_SHARE_CARD = false;

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
          className={isActualZero || index < 3 - numStr.length ? 'opacity-20' : ''}
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
                
                let className = '';
                if (wasTyped) {
                  className += wasCorrect ? 'text-tpotracer-100 opacity-100' : incorrectCharClass;
                } else {
                  // Character was never typed (word was shorter than expected)
                  className += 'text-tpotracer-100 opacity-40';
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
                
                let className = '';
                if (isTyped) {
                  className += isCorrect ? 'text-tpotracer-100 opacity-100' : incorrectCharClass;
                } else {
                  className += 'text-tpotracer-100 opacity-40';
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

// Shadow helper functions for relative units (with ~1.5x boost for more glow)
const glowTextShadow = (size: number, height: number) => 
  `0 0 ${(size * 1.5 / height) * 100}cqh #A7F1FA`;
const darkTextShadow = (size: number, height: number) => 
  `0 0 ${(size * 1.5 / height) * 100}cqh #02182D`;
const glowBoxShadow = (blur: number, spread: number, height: number) => 
  `0 0 ${(blur * 1.5 / height) * 100}cqh ${(spread * 1.2 / height) * 100}cqh #A7F1FA`;
const darkBoxShadow = (blur: number, spread: number, height: number) => 
  `0 0 ${(blur * 1.5 / height) * 100}cqh ${(spread * 1.2 / height) * 100}cqh #02182D`;
const tpotracer300BoxShadow = (blur: number, spread: number, height: number) => 
  `0 0 ${(blur * 1.5 / height) * 100}cqh ${(spread * 1.2 / height) * 100}cqh #03223F`;

const NewGameScreen: React.FC<NewGameScreenProps> = ({ username, onSettingsClick }) => {
  // Game container dimensions (from src/index.css)
  const CONTAINER_WIDTH = 853;
  const CONTAINER_HEIGHT = 806;
  
  // Relative border radius helper
  const relBorderRadius = (px: number) => `${(px / CONTAINER_HEIGHT) * 100}cqh`;
  
  const [isFlashing, setIsFlashing] = useState(false);
  const [finishedGameState, setFinishedGameState] = useState<{
    wpm: number;
    leaderboardPosition: number | null;
    isNewHighScore: boolean;
    wpmToBeat: number | null;
  } | null>(null);
  // Create ref for cursor positioning
  const cursorRef = useRef<HTMLSpanElement>(null);
  // Create ref for share card
  const shareCardRef = useRef<HTMLDivElement>(null);
  
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
    isRetryingScore,
    isScoreInvalid,
    invalidErrorCode,
    showConfetti,
    isHelpExpanded,
    leaderboardPosition,
    wpmToBeat,
    width,
    height,
    initializeGame,
    handleGameComplete,
    handleStartNewGame,
    toggleHelp,
  } = useGameContext();

  useEffect(() => {
    if (gameState === 'completed') {
      setFinishedGameState({
        wpm,
        leaderboardPosition,
        isNewHighScore,
        wpmToBeat,
      });
    }
  }, [gameState, wpm, leaderboardPosition, isNewHighScore, wpmToBeat]);

  useEffect(() => {
    if (gameState === 'completed' && isNewHighScore) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 900);

      return () => clearTimeout(timer);
    } else {
      setIsFlashing(false);
    }
  }, [gameState, isNewHighScore]);

  // Determine if cursor should be visible (during typing states)
  const isCursorVisible = gameState === 'playing' || gameState === 'waiting';

  const statsForFinishedScreen =
    gameState === 'completed'
      ? { wpm, leaderboardPosition, isNewHighScore, wpmToBeat }
      : finishedGameState;

  const handleDownloadShareImage = async () => {
    if (!shareCardRef.current || !username) return;
    
    try {
      // Temporarily make the element visible (but keep it off-screen) for html2canvas
      const originalOpacity = shareCardRef.current.style.opacity;
      const originalVisibility = shareCardRef.current.style.visibility;
      shareCardRef.current.style.opacity = '1';
      shareCardRef.current.style.visibility = 'visible';
      
      // Ensure all content is properly rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: shareCardRef.current.offsetWidth,
        height: shareCardRef.current.offsetHeight,
        onclone: (_document, element) => {
          const clone = element as HTMLElement;
          clone.style.width = `${shareCardRef.current!.offsetWidth}px`;
          clone.style.height = `${shareCardRef.current!.offsetHeight}px`;
          clone.style.overflow = 'hidden';
          clone.style.opacity = '1';
          clone.style.visibility = 'visible';
        }
      });
      
      // Restore original styles
      shareCardRef.current.style.opacity = originalOpacity;
      shareCardRef.current.style.visibility = originalVisibility;
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tpotracer-${username}-${Math.round(wpm)}wpm.png`;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Error generating image:', error);
      // Make sure to restore styles even on error
      if (shareCardRef.current) {
        shareCardRef.current.style.opacity = '';
        shareCardRef.current.style.visibility = '';
      }
    }
  };

  const handleShareToX = () => {
    const tweetText = `I just typed at ${Math.round(wpm)} WPM. Can you beat me? https://tpotracer.com`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="">
      <div className="game-container relative grow">
        {(highScore && highScore > 0) ? (
          <>
            <span 
              className="absolute font-ptclean text-tpotracer-100"
              style={{ 
                top: `${(88 / CONTAINER_HEIGHT) * 100}%`, 
                left: `${(89 / CONTAINER_WIDTH) * 100}%`,
                fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
              }}
            >
              Best WPM:
            </span>
            <span 
              className="absolute font-ptclean text-tpotracer-100 font-bold"
              style={{ 
                top: `${(114 / CONTAINER_HEIGHT) * 100}%`, 
                left: `${(107 / CONTAINER_WIDTH) * 100}%`,
                fontSize: `${(60 / CONTAINER_HEIGHT) * 100}cqh`,
                lineHeight: '1',
                textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
              }}
            >
              {renderPaddedNumber(highScore)}
            </span>
          </>
        ) : null}
        {/* Rank in the right circle (matching Best WPM style) */}
        {leaderboardPosition ? (
          <>
            <span 
              className="absolute font-ptclean text-tpotracer-100"
              style={{ 
                top: `${(66 / CONTAINER_HEIGHT) * 100}%`, 
                left: `${(278 / CONTAINER_WIDTH) * 100}%`,
                fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
              }}
            >
              Rank:
            </span>
            <span 
              className="absolute font-ptclean text-right text-tpotracer-100 font-bold"
              style={{ 
                top: `${(92 / CONTAINER_HEIGHT) * 100}%`, 
                left: `${(235 / CONTAINER_WIDTH) * 100}%`,
                fontSize: `${(
                  (leaderboardPosition >= 100 ? 39 : 55) 
                  / CONTAINER_HEIGHT
                ) * 100}cqh`,
                lineHeight: '1',
                display: 'inline-block',
                width: `${(120 / CONTAINER_WIDTH) * 100}%`,
                textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
              }}
            >
              {leaderboardPosition}
            </span>
          </>
        ) : null}
        <a
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute"
          style={{ 
            width: `${(40 / CONTAINER_WIDTH) * 100}%`, 
            height: `${(40 / CONTAINER_HEIGHT) * 100}%`,
            top: `${(21 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(460 / CONTAINER_WIDTH) * 100}%` 
          }}
        >
          <UserAvatar 
            username={username}
            className="w-full h-full"
            style={{ borderRadius: '50%' }}
          />
        </a>
        <a 
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute font-ptclean text-tpotracer-100 hover:underline"
          style={{ 
            top: `${(25 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(510 / CONTAINER_WIDTH) * 100}%`,
            fontSize: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
            lineHeight: `${(36 / CONTAINER_HEIGHT) * 100}cqh`,
            textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
          }}
        >
          @{username}
        </a>
        <NewButton 
          className="absolute" 
          style={{ 
            top: `${(105 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(410 / CONTAINER_WIDTH) * 100}%`,
            width: `${(181 / CONTAINER_WIDTH) * 100}%`,
            height: `${(63 / CONTAINER_HEIGHT) * 100}%`,
            '--btn-font-size': `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
            lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`
          } as React.CSSProperties}
          onClick={handleStartNewGame}
        >
          Retry (Tab)
        </NewButton>
        <NewButton 
          className="absolute" 
          style={{ 
            top: `${(105 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(580 / CONTAINER_WIDTH) * 100}%`,
            width: `${(181 / CONTAINER_WIDTH) * 100}%`,
            height: `${(63 / CONTAINER_HEIGHT) * 100}%`,
            '--btn-font-size': `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
            lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`
          } as React.CSSProperties}
          onClick={onSettingsClick}
        >
          Settings
        </NewButton>
        <NewButton 
          size="circle" 
          className="absolute" 
          style={{ 
            top: `${(112 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(777 / CONTAINER_WIDTH) * 100}%`,
            width: `${(49 / CONTAINER_WIDTH) * 100}%`,
            height: `${(49 / CONTAINER_HEIGHT) * 100}%`,
            '--btn-font-size': `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
            lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
            textShadow: darkTextShadow(2, CONTAINER_HEIGHT)
          } as React.CSSProperties}
          onClick={toggleHelp}
        >
          ?
        </NewButton>
        <div 
          className={`game-finished-screen absolute text-tpotracer-400 ${gameState === 'completed' ? 'tr-visible' : ''}`}
          style={{ 
            top: `${(306 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(243 / CONTAINER_WIDTH) * 100}%`,
            width: `${(464 / CONTAINER_WIDTH) * 100}%`, 
            height: `${(200 / CONTAINER_HEIGHT) * 100}%`,
            borderRadius: relBorderRadius(2)
          }}
        >
          {statsForFinishedScreen && (
            <div className="relative w-full h-full">
              <div className="game-finished-screen-bg absolute inset-0 z-0"></div>
              <div 
                className="absolute inset-0 z-10 flex flex-col justify-center font-ptclean"
                style={{ 
                  paddingLeft: `${(20 / CONTAINER_WIDTH) * 100}cqw`, 
                  paddingRight: `${(20 / CONTAINER_WIDTH) * 100}cqw`,
                  gap: `${(12 / CONTAINER_HEIGHT) * 100}cqh` 
                }}
              >
                <h2 
                  className="text-tpotracer-100"
                  style={{ 
                    fontSize: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
                    lineHeight: `${(36 / CONTAINER_HEIGHT) * 100}cqh`,
                    textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                  }}
                >
                  {(isScoreInvalid || FORCE_SHOW_INVALID)
                    ? `GAME ERRORED :( code ${invalidErrorCode ?? '?'}` 
                    : statsForFinishedScreen.isNewHighScore 
                      ? "NEW BEST WPM!" 
                      : "GAME COMPLETE!"}
                </h2>
                <div 
                  className="flex items-center"
                  style={{ gap: `${(20 / CONTAINER_WIDTH) * 100}cqw` }}
                >
                  <div 
                    className={`font-bold flex items-center justify-center ${isFlashing ? 'tr-flashing' : 'bg-tpotracer-300 text-tpotracer-100'}`}
                    style={{ 
                      width: `${(110 / CONTAINER_WIDTH) * 100}cqw`, 
                      paddingLeft: `${(18 / CONTAINER_WIDTH) * 100}cqw`, 
                      paddingRight: `${(18 / CONTAINER_WIDTH) * 100}cqw`,
                      paddingTop: `${(8 / CONTAINER_HEIGHT) * 100}cqh`,
                      paddingBottom: `${(8 / CONTAINER_HEIGHT) * 100}cqh`,
                      borderRadius: relBorderRadius(8),
                      ...(isFlashing ? {} : {
                        boxShadow: tpotracer300BoxShadow(2, 1, CONTAINER_HEIGHT),
                        textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                      })
                    }}
                  >
                    <span style={{ 
                      fontSize: `${(60 / CONTAINER_HEIGHT) * 100}cqh`,
                      lineHeight: '1'
                    }}>
                      {renderPaddedNumber(statsForFinishedScreen.wpm)}
                    </span>
                  </div>
                  <div 
                    className="flex flex-col"
                    style={{ 
                      fontSize: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
                      lineHeight: `${(36 / CONTAINER_HEIGHT) * 100}cqh`,
                      gap: `${(4 / CONTAINER_HEIGHT) * 100}cqh`
                    }}
                  >
                    <div 
                      className="flex items-center"
                      style={{ gap: `${(8 / CONTAINER_WIDTH) * 100}cqw` }}
                    >
                      <span 
                        className="text-tpotracer-100"
                        style={{ textShadow: glowTextShadow(2, CONTAINER_HEIGHT) }}
                      >RANK:</span>
                      <span 
                        className={`font-bold text-center text-tpotracer-100 ${getBadgeClass(statsForFinishedScreen.leaderboardPosition ?? 99)}`}
                        style={{ 
                          height: `${(28 / CONTAINER_HEIGHT) * 100}cqh`, 
                          lineHeight: `${(31 / CONTAINER_HEIGHT) * 100}cqh`,
                          paddingLeft: `${(10 / CONTAINER_WIDTH) * 100}cqw`, 
                          paddingRight: `${(10 / CONTAINER_WIDTH) * 100}cqw`,
                          borderRadius: relBorderRadius(4)
                        }}
                      >
                        {statsForFinishedScreen.leaderboardPosition ?? '99'}
                      </span>
                    </div>
                    {statsForFinishedScreen.wpmToBeat !== null && (
                      <div 
                        className="flex items-center"
                        style={{ gap: `${(8 / CONTAINER_WIDTH) * 100}cqw` }}
                      >
                        <span 
                          className="text-tpotracer-100"
                          style={{ textShadow: glowTextShadow(2, CONTAINER_HEIGHT) }}
                        >WPM TO BEAT:</span>
                        <span 
                          className="bg-tpotracer-300 text-tpotracer-100 font-bold text-center"
                          style={{ 
                            height: `${(28 / CONTAINER_HEIGHT) * 100}cqh`, 
                            lineHeight: `${(31 / CONTAINER_HEIGHT) * 100}cqh`,
                            paddingLeft: `${(10 / CONTAINER_WIDTH) * 100}cqw`, 
                            paddingRight: `${(10 / CONTAINER_WIDTH) * 100}cqw`,
                            borderRadius: relBorderRadius(4),
                            boxShadow: darkBoxShadow(2, 1, CONTAINER_HEIGHT),
                            textShadow: glowTextShadow(1, CONTAINER_HEIGHT)
                          }}
                        >
                          {renderPaddedNumber(statsForFinishedScreen.wpmToBeat)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p 
                  className="text-tpotracer-100"
                  style={{ 
                    fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                    lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                    marginTop: `${(10 / CONTAINER_HEIGHT) * 100}cqh`,
                    textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                  }}
                >
                  {isRetryingScore ? "Submitting score..." : "Press Tab, or click Retry, to try again."}
                </p>
              </div>
            </div>
          )}
        </div>
        <div 
          className="inner-screen absolute flex flex-col"
          style={{ 
            top: `${(212 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(241 / CONTAINER_WIDTH) * 100}%`,
            width: `${(471 / CONTAINER_WIDTH) * 100}%`, 
            height: `${(336 / CONTAINER_HEIGHT) * 100}%`,
            paddingTop: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
            paddingBottom: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
            paddingLeft: `${(30 / CONTAINER_WIDTH) * 100}cqw`,
            paddingRight: `${(30 / CONTAINER_WIDTH) * 100}cqw`,
            borderRadius: relBorderRadius(49)
          }}
        >
          <div className="badge-row">
            <ul 
              className="flex"
              style={{ gap: `${(20 / CONTAINER_WIDTH) * 100}cqw` }}
            >
              <li 
                className="font-ptclean text-tpotracer-100"
                style={{ 
                  fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                {"WPM: "}
                <span 
                  className="bg-tpotracer-100 text-tpotracer-400 font-bold"
                  style={{ 
                    paddingLeft: `${(10 / CONTAINER_WIDTH) * 100}cqw`, 
                    paddingRight: `${(10 / CONTAINER_WIDTH) * 100}cqw`,
                    paddingTop: `${(2 / CONTAINER_HEIGHT) * 100}cqh`,
                    borderRadius: relBorderRadius(4),
                    boxShadow: glowBoxShadow(2, 1, CONTAINER_HEIGHT),
                    textShadow: darkTextShadow(1, CONTAINER_HEIGHT)
                  }}
                >
                  {renderPaddedNumber(wpm)}
                </span>
              </li>
              <li 
                className="font-ptclean text-tpotracer-100"
                style={{ 
                  fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                {"RAW: "}
                <span 
                  className="bg-tpotracer-100 text-tpotracer-400 font-bold"
                  style={{ 
                    paddingLeft: `${(10 / CONTAINER_WIDTH) * 100}cqw`, 
                    paddingRight: `${(10 / CONTAINER_WIDTH) * 100}cqw`,
                    paddingTop: `${(2 / CONTAINER_HEIGHT) * 100}cqh`,
                    borderRadius: relBorderRadius(4),
                    boxShadow: glowBoxShadow(2, 1, CONTAINER_HEIGHT),
                    textShadow: darkTextShadow(1, CONTAINER_HEIGHT)
                  }}
                >
                  {renderPaddedNumber(rawWpm)}
                </span>
              </li>
              <li 
                className="font-ptclean text-tpotracer-100"
                style={{ 
                  fontSize: `${(24 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(32 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                {"ACC: "}
                <span 
                  className="bg-tpotracer-100 text-tpotracer-400 font-bold"
                  style={{ 
                    paddingLeft: `${(10 / CONTAINER_WIDTH) * 100}cqw`, 
                    paddingRight: `${(10 / CONTAINER_WIDTH) * 100}cqw`,
                    paddingTop: `${(2 / CONTAINER_HEIGHT) * 100}cqh`,
                    borderRadius: relBorderRadius(4),
                    boxShadow: glowBoxShadow(2, 1, CONTAINER_HEIGHT),
                    textShadow: darkTextShadow(1, CONTAINER_HEIGHT)
                  }}
                >
                  {Math.round(accuracy)}%
                </span>
              </li>
            </ul>
          </div>
          <div 
            className="grow flex justify-center"
            style={{ marginTop: `${(20 / CONTAINER_HEIGHT) * 100}cqh` }}
          >
            <div 
              className={`wordlist font-ptclean content-center text-tpotracer-100 flex flex-wrap items-start${gameState !== 'completed' ? ' tr-visible' : ''}`}
              style={{ 
                fontSize: `${(48 / CONTAINER_HEIGHT) * 100}cqh`,
                lineHeight: '1',
                marginTop: `${(20 / CONTAINER_HEIGHT) * 100}cqh`,
                columnGap: `${(20 / CONTAINER_WIDTH) * 100}cqw`,
                textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
              }}
            >
              {renderWordsWithProgress(words, currentWordIndex, typedText, typedHistory, cursorRef)}
            </div>
          </div>
        </div>
        <div 
          className="share-preview absolute overflow-hidden"
          style={{ 
            top: `${(592 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(155 / CONTAINER_WIDTH) * 100}%`,
            width: `${(277 / CONTAINER_WIDTH) * 100}%`, 
            height: `${(189 / CONTAINER_HEIGHT) * 100}%`,
            borderRadius: `${(29 / CONTAINER_HEIGHT) * 100}cqh`,
            backgroundImage: `url(${sharableBg})`,
            backgroundSize: '120%',
            backgroundPosition: 'center',
            boxShadow: `inset 0 0 ${(3 / CONTAINER_HEIGHT) * 100}cqh ${(1 / CONTAINER_HEIGHT) * 100}cqh #03223F, 0 0 ${(3 / CONTAINER_HEIGHT) * 100}cqh ${(2 / CONTAINER_HEIGHT) * 100}cqh #03223F`
          }}
        >
          {/* Live preview of share card */}
          {!HIDE_SHARE_PREVIEW_CONTENTS && (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-center"
              style={{ 
                paddingTop: `${(12 / CONTAINER_HEIGHT) * 100}cqh`,
                paddingBottom: `${(12 / CONTAINER_HEIGHT) * 100}cqh`,
                paddingLeft: `${(12 / CONTAINER_WIDTH) * 100}cqw`,
                paddingRight: `${(12 / CONTAINER_WIDTH) * 100}cqw`
              }}
            >
              <p 
                className="text-tpotracer-100 mb-1"
                style={{ 
                  fontSize: `${(8 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                tpotracer.com
              </p>
              <div 
                className="font-bold text-tpotracer-100 font-mono"
                style={{ 
                  fontSize: `${(30 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(36 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                {Math.round(wpm)} <span style={{ 
                  fontSize: `${(14 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(20 / CONTAINER_HEIGHT) * 100}cqh`
                }}>WPM</span>
              </div>
              <div 
                className="text-tpotracer-100 font-mono mt-1"
                style={{ 
                  fontSize: `${(14 / CONTAINER_HEIGHT) * 100}cqh`,
                  lineHeight: `${(20 / CONTAINER_HEIGHT) * 100}cqh`,
                  textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                }}
              >
                @{username}
              </div>
              {leaderboardPosition && (
                <div 
                  className="bg-tpotracer-300 text-tpotracer-100 mt-2"
                  style={{ 
                    paddingLeft: `${(8 / CONTAINER_WIDTH) * 100}cqw`,
                    paddingRight: `${(8 / CONTAINER_WIDTH) * 100}cqw`,
                    paddingTop: `${(4 / CONTAINER_HEIGHT) * 100}cqh`,
                    paddingBottom: `${(4 / CONTAINER_HEIGHT) * 100}cqh`,
                    fontSize: `${(10 / CONTAINER_HEIGHT) * 100}cqh`,
                    borderRadius: '9999px',
                    textShadow: glowTextShadow(2, CONTAINER_HEIGHT)
                  }}
                >
                  #{leaderboardPosition} on leaderboard
                </div>
              )}
            </div>
          )}
        </div>
        {/* Hidden share card for image generation */}
        <div 
          ref={shareCardRef}
          className={DEBUG_SHOW_SHARE_CARD 
            ? "fixed overflow-hidden z-[100000]" 
            : "absolute -left-[9999px] pointer-events-none overflow-hidden"
          }
          style={{ 
            width: '1035px',
            height: '754px',
            backgroundImage: `url(${sharableBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '29px',
            ...(DEBUG_SHOW_SHARE_CARD 
              ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
              : { opacity: 0, visibility: 'hidden' }
            )
          }}
        >
          <div 
            className="w-full h-full flex flex-col items-center justify-center text-center"
            style={{
              paddingTop: '0px',
              paddingBottom: '48px',
              paddingLeft: '45px',
              paddingRight: '45px'
            }}
          >
            <img 
              src={logo} 
              alt="TPO Tracer Logo" 
              style={{ width: '240px', height: 'auto', marginBottom: '16px' }}
            />
            <p 
              className="text-tpotracer-100 glow-text-shadow-sm font-ptclean"
              style={{ fontSize: '40px', marginTop: '-90px', marginRight: '-140px' }}
            >
              .com
            </p>
            <div 
              className="font-bold text-tpotracer-100 font-mono glow-text-shadow-sm"
              style={{ fontSize: '244px', lineHeight: '160px', marginTop: '0px' }}
            >
              {Math.round(wpm)}<span className="font-ptclean" style={{ fontSize: '108px', lineHeight: '90px' }}>WPM</span>
            </div>
            <div 
              className="flex items-center"
              style={{ fontSize: '88px', lineHeight: '90px', marginTop: '90px', gap: '24px' }}
            >
              {(leaderboardPosition || DEBUG_SHOW_SHARE_CARD) && (
                <div 
                  className={`font-bold font-ptclean relative glow-shadow-sm text-tpotracer-100 glow-text-shadow-sm flex items-start`}
                  style={{ 
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    borderRadius: '12px',
                    color: (leaderboardPosition ?? 999) <= 3 ? '#fff' : undefined
                  }}
                >
                  <div className={`absolute left-0 right-0 h-full top-[43px] z-[-44444] ${getBadgeClass(leaderboardPosition ?? 999)}`} style={{ borderRadius: '12px' }}></div>
                  <span className="inline-block" style={{ fontSize: '48px', lineHeight: '1', marginTop: '22px', marginRight: '3px' }}>#</span>
                  <span style={{ lineHeight: '1' }}>{leaderboardPosition || 999}</span>
                </div>
              )}
              <span className="text-tpotracer-100 font-ptclean glow-text-shadow-sm">
                @{username}
              </span>
            </div>
          </div>
        </div>
        <NewButton 
          className="absolute" 
          style={{ 
            top: `${(590 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(455 / CONTAINER_WIDTH) * 100}%`,
            width: `${(181 / CONTAINER_WIDTH) * 100}%`,
            height: `${(63 / CONTAINER_HEIGHT) * 100}%`,
            '--btn-font-size': `${(24 / CONTAINER_HEIGHT) * 100}cqh`
          } as React.CSSProperties}
          onClick={handleDownloadShareImage}
        >
          Share Image
        </NewButton>
        <NewButton 
          className="absolute" 
          style={{ 
            top: `${(590 / CONTAINER_HEIGHT) * 100}%`, 
            left: `${(624 / CONTAINER_WIDTH) * 100}%`,
            width: `${(181 / CONTAINER_WIDTH) * 100}%`,
            height: `${(63 / CONTAINER_HEIGHT) * 100}%`,
            '--btn-font-size': `${(24 / CONTAINER_HEIGHT) * 100}cqh`
          } as React.CSSProperties}
          onClick={handleShareToX}
        >
          Share on X
        </NewButton>
        
        {/* Custom Cursor Component */}
        <Cursor targetRef={cursorRef} isVisible={isCursorVisible} />
      </div>
    </div>
  );
};

export default NewGameScreen;