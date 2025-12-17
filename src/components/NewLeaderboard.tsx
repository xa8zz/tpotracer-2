import React, { useState, useRef, useCallback } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useGameContext } from '../contexts/GameContext';
import { getRemainingTimeUntilEnd, getBadgeClass } from '../utils/leaderboardUtils';
import UserAvatar from './UserAvatar';
import retryIcon from '../assets/path291.png';
import NewButton from './NewButton';

interface LeaderboardProps {
  currentUsername: string | null;
}

const INITIAL_USER_COUNT = 12;
const USER_LOAD_INCREMENT = 12;

// Leaderboard dimensions constants
const LB_WIDTH = 500;
const LB_HEIGHT = 820;
const LB_CONTAINER_WIDTH = 474; // Match the original CSS width for layout
const CONTENT_WIDTH = 380;
const CONTENT_HEIGHT = 541;
const HEADER_HEIGHT = 42;
const CURRENT_USER_HEIGHT = 49;
const LIST_HEIGHT = CONTENT_HEIGHT - HEADER_HEIGHT - CURRENT_USER_HEIGHT; // 450
const COL_WIDTH = 75;
const FLEX_COL_WIDTH = 230; // 380 - 75 - 75
const CONDENSED_LB_WIDTH = 110;
const CONDENSED_LB_HEIGHT = 110;

// Helper to calculate percentage
const pct = (val: number, total: number) => `${(val / total) * 100}%`;

const NewLeaderboard: React.FC<LeaderboardProps> = ({
  currentUsername
}) => {
  const { 
    leaderboardData, 
    userPosition 
  } = useLeaderboard({ username: currentUsername });

  const { highScore, leaderboardPosition } = useGameContext();
  const [loadedUsersCount, setLoadedUsersCount] = useState(INITIAL_USER_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const placeholderAPICall = () => {
    // This is a placeholder for a future API call.
  };

  const handleRetry = () => {
    if (isSpinning) return;

    placeholderAPICall();
    setIsSpinning(true);

    setLoadedUsersCount(INITIAL_USER_COUNT);
    setIsLoadingMore(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsSpinning(false);
    }, 200);
  };

  // Use actual game data for current user
  const currentUserLeaderboardData = {
    username: currentUsername || "guest",
    wpm: highScore,
    place: leaderboardPosition || userPosition || 999
  };

  // Use actual leaderboard data
  const visibleUsers = leaderboardData.slice(0, loadedUsersCount);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
    const totalUsers = leaderboardData.length;

    if (isAtBottom && !isLoadingMore && loadedUsersCount < totalUsers) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setLoadedUsersCount(prev => {
            const newCount = prev + USER_LOAD_INCREMENT;
            return newCount > totalUsers ? totalUsers : newCount;
        });
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, loadedUsersCount, leaderboardData.length]);

  const [visible, setVisible] = useState(window.innerWidth >= 1600);
  const toggleSetVisible = () => setVisible(!visible);

  return (
    <div 
      className={`leaderboard-container ${visible ? "tr-visible" : ""}`}
      style={{
        width: visible ? LB_CONTAINER_WIDTH : CONDENSED_LB_WIDTH,
      }}
    >
      <div 
        className="leaderboard" 
        style={{ 
            width: `${(LB_WIDTH / LB_CONTAINER_WIDTH) * 100}%`,
            height: 'auto',
            aspectRatio: `${LB_WIDTH} / ${LB_HEIGHT}`,
            backgroundSize: '100% 100%',
            containerType: 'size',
            marginLeft: 24,
            marginTop: -6,
            pointerEvents: visible ? 'auto' : 'none',
            zIndex: 1,
        }}
      >
        <button 
            className="absolute" 
            onClick={handleRetry}
            style={{
                top: pct(203, LB_HEIGHT),
                left: pct(62, LB_WIDTH),
                width: pct(13, LB_WIDTH),
            }}
        >
          <img 
            src={retryIcon} 
            alt="Retry" 
            className={`${isSpinning ? 'spin-once' : ''}`} 
            style={{ 
                filter: 'drop-shadow(0 0 1px #A7F1FA)',
                width: '100%',
                height: 'auto',
                display: 'block'
            }} 
          />
        </button>
        <NewButton 
            size="circle" 
            className="absolute dark-text-shadow-sm" 
            onClick={toggleSetVisible}
            style={{
                top: pct(36, LB_HEIGHT),
                left: pct(34, LB_WIDTH),
                width: pct(49, LB_WIDTH),
                height: pct(49, LB_HEIGHT),
                fontSize: `${(24 / LB_WIDTH) * 100}cqw`
            }}
        >
          ✕
        </NewButton>
        <span 
            className="absolute font-ptclean dark-text-shadow-sm text-tpotracer-400"
            style={{
                top: pct(125, LB_HEIGHT),
                left: pct(162, LB_WIDTH),
                fontSize: `${(36 / LB_WIDTH) * 100}cqw`,
                lineHeight: 1.11, // Matching text-4xl leading
            }}
        >
          {getRemainingTimeUntilEnd()}
        </span>
        <div 
            className="absolute flex flex-col text-center"
            style={{
                top: pct(190, LB_HEIGHT),
                left: pct(75, LB_WIDTH),
                width: pct(CONTENT_WIDTH, LB_WIDTH),
                height: pct(CONTENT_HEIGHT, LB_HEIGHT)
            }}
        >
          {/* Header */}
          <div 
            className="font-ptclean glow-text-shadow-sm text-tpotracer-100 flex items-center shrink-0"
            style={{
                height: pct(HEADER_HEIGHT, CONTENT_HEIGHT),
                fontSize: `${(24 / LB_WIDTH) * 100}cqw`,
                lineHeight: 1.33, // Matching text-2xl leading
            }}
          >
            <div style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }}>#</div>
            <div className="flex-1 text-left">USERNAME</div>
            <div style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }}>WPM</div>
          </div>
          
          {/* Current User */}
          <div 
            className="font-ptclean relative glow-text-shadow-sm text-tpotracer-100 flex items-center shrink-0 isolate"
            style={{
                height: pct(CURRENT_USER_HEIGHT, CONTENT_HEIGHT),
                fontSize: `${(24 / LB_WIDTH) * 100}cqw`,
                lineHeight: 1.33,
            }}
          >
            <div style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }}>
              <span 
                className={`inline-block text-tpotracer-100 font-bold rounded-[4px] ${getBadgeClass(currentUserLeaderboardData.place)}`}
                style={{
                    width: `${(30 / LB_WIDTH) * 100}cqw`,
                    height: `${(25 / LB_WIDTH) * 100}cqw`,
                    lineHeight: `${(28 / LB_WIDTH) * 100}cqw`,
                }}
              >
              {currentUserLeaderboardData.place}
              </span>
            </div>
            <div className="flex-1 text-left">
              <a
                href={`https://x.com/${currentUserLeaderboardData.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
                style={{ gap: pct(6, FLEX_COL_WIDTH) }}
              >
                <UserAvatar
                  username={currentUserLeaderboardData.username}
                  className="rounded-[400px] mt-[-3px]"
                  style={{
                      width: pct(32, FLEX_COL_WIDTH),
                      height: 'auto', 
                      aspectRatio: '1/1'
                  }}
                />
                <span className="group-hover:underline">
                  @{currentUserLeaderboardData.username}
                </span>
              </a>
            </div>
            <div style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }} title={currentUserLeaderboardData.wpm.toFixed(3)}>{Math.round(currentUserLeaderboardData.wpm)}</div>
            <div className="current-user-background" style={{ left: pct(-35, CONTENT_WIDTH) }}></div>
          </div>
          
          {/* Scrollable user list */}
          <div 
            ref={scrollContainerRef} 
            onScroll={handleScroll} 
            className="overflow-y-auto flex-grow scrollable-leaderboard"
            style={{ paddingTop: pct(5, LIST_HEIGHT) }}
          >
            {visibleUsers.map((entry, index) => (
              <div 
                key={index} 
                className="font-ptclean text-tpotracer-100 flex items-center"
                style={{
                    height: pct(44, LIST_HEIGHT),
                    fontSize: `${(24 / LB_WIDTH) * 100}cqw`,
                    lineHeight: 1.33,
                }}
              >
                <div style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }}>
                  <span 
                    className={`inline-block font-bold rounded-[4px] ${getBadgeClass(index + 1)}`}
                    style={{
                        width: `${(30 / LB_WIDTH) * 100}cqw`,
                        height: `${(25 / LB_WIDTH) * 100}cqw`,
                        lineHeight: `${(28 / LB_WIDTH) * 100}cqw`,
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <a
                    href={`https://x.com/${entry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center group"
                    style={{ gap: pct(6, FLEX_COL_WIDTH) }}
                  >
                    <UserAvatar
                      username={entry.username}
                      className="rounded-[400px] mt-[-3px]"
                      style={{
                          width: pct(32, FLEX_COL_WIDTH),
                          height: 'auto',
                          aspectRatio: '1/1'
                      }}
                    />
                    <span className="glow-text-shadow-sm group-hover:underline">
                      @{entry.username}
                    </span>
                  </a>
                </div>
                <div className="glow-text-shadow-sm" style={{ width: pct(COL_WIDTH, CONTENT_WIDTH) }} title={entry.wpm.toFixed(3)}>{Math.round(entry.wpm)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div 
        className="leaderboard-condensed"
        style={{ 
            width: visible ? pct(CONDENSED_LB_WIDTH, LB_CONTAINER_WIDTH) : '100%',
            height: 'auto',
            aspectRatio: `${CONDENSED_LB_WIDTH} / ${CONDENSED_LB_HEIGHT}`,
            backgroundSize: '100% 100%',
            containerType: 'size',
            marginLeft: 24,
            marginTop: -6,
            pointerEvents: visible ? 'none' : 'auto',
            opacity: visible ? 0 : 1,
        }}
      >
        <NewButton 
            size="circle" 
            className="absolute dark-text-shadow-sm flex items-center justify-center" 
            onClick={toggleSetVisible}
            style={{
                top: pct(29, CONDENSED_LB_HEIGHT),
                left: pct(29, CONDENSED_LB_WIDTH),
                width: pct(49, CONDENSED_LB_WIDTH),
                height: pct(49, CONDENSED_LB_HEIGHT),
            }}
        >
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="6" width="5" height="16" rx="1" />
            <rect x="10" y="10" width="5" height="12" rx="1" />
            <rect x="17" y="14" width="5" height="8" rx="1" />
          </svg>
        </NewButton>
      </div>
    </div>
  );
};

export default NewLeaderboard;
