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

const allMockUsers = Array.from({ length: 100 }, (_, i) => ({
  username: `user${i + 1}`,
  wpm: 200.0 - (i * (0.5 + Math.random() * 0.5)),
}));

const INITIAL_USER_COUNT = 12;
const USER_LOAD_INCREMENT = 12;

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

  // Use actual leaderboard data or fallback to mock data
  const displayLeaderboardData = leaderboardData.length > 0 ? leaderboardData : allMockUsers;
  const visibleUsers = displayLeaderboardData.slice(0, loadedUsersCount);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
    const totalUsers = leaderboardData.length > 0 ? leaderboardData.length : allMockUsers.length;

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
    <div className={`leaderboard-container ${visible ? "tr-visible" : ""}`}>
      <div className="leaderboard">
        <button className="absolute top-[203px] left-[62px]" onClick={handleRetry}>
          <img src={retryIcon} alt="Retry" className={`w-[13px] h-[13px] ${isSpinning ? 'spin-once' : ''}`} style={{ filter: 'drop-shadow(0 0 1px #A7F1FA)' }} />
        </button>
        <NewButton size="circle" className="absolute dark-text-shadow-sm top-[36px] left-[34px]" onClick={toggleSetVisible}>
          &lt;
        </NewButton>
        <span className="absolute font-ptclean dark-text-shadow-sm text-tpotracer-400 text-4xl top-[125px] left-[162px]">
          {getRemainingTimeUntilEnd()}
        </span>
        <div className="absolute top-[190px] left-[75px] w-[380px] h-[541px] flex flex-col text-center">
          {/* Header */}
          <div className="font-ptclean h-[42px] glow-text-shadow-sm text-tpotracer-100 text-2xl flex items-center shrink-0">
            <div className="w-[75px]">#</div>
            <div className="flex-1 text-left">USERNAME</div>
            <div className="w-[75px]">WPM</div>
          </div>
          
          {/* Current User */}
          <div className="font-ptclean relative h-[49px] glow-text-shadow-sm text-tpotracer-100 text-2xl flex items-center shrink-0 isolate">
            <div className="w-[75px]">
              <span className={`inline-block text-tpotracer-100 font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(currentUserLeaderboardData.place)}`}>
              {currentUserLeaderboardData.place}
              </span>
            </div>
            <div className="flex-1 text-left">
              <a
                href={`https://x.com/${currentUserLeaderboardData.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[6px] group"
              >
                <UserAvatar
                  username={currentUserLeaderboardData.username}
                  className="rounded-[400px] mt-[-3px] w-[32px] h-[32px]"
                />
                <span className="group-hover:underline">
                  @{currentUserLeaderboardData.username}
                </span>
              </a>
            </div>
            <div className="w-[75px]" title={currentUserLeaderboardData.wpm.toFixed(3)}>{Math.round(currentUserLeaderboardData.wpm)}</div>
            <div className="current-user-background"></div>
          </div>
          
          {/* Scrollable user list */}
          <div ref={scrollContainerRef} onScroll={handleScroll} className="overflow-y-auto flex-grow scrollable-leaderboard pt-[5px]">
            {visibleUsers.map((entry, index) => (
              <div key={index} className="font-ptclean h-[44px] text-tpotracer-100 text-2xl flex items-center">
                <div className="w-[75px]">
                  <span className={`inline-block font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(index + 1)}`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <a
                    href={`https://x.com/${entry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[6px] group"
                  >
                    <UserAvatar
                      username={entry.username}
                      className="rounded-[400px] mt-[-3px] w-[32px] h-[32px]"
                    />
                    <span className="glow-text-shadow-sm group-hover:underline">
                      @{entry.username}
                    </span>
                  </a>
                </div>
                <div className="w-[75px] glow-text-shadow-sm" title={entry.wpm.toFixed(3)}>{Math.round(entry.wpm)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="leaderboard-condensed">
        <NewButton size="circle" className="absolute dark-text-shadow-sm top-[29px] left-[29px]" onClick={toggleSetVisible}>
          &gt;
        </NewButton>
      </div>
    </div>
  );
};

export default NewLeaderboard;
