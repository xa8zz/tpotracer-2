import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import { Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import NewLeaderboard from './NewLeaderboard';
import NewGameScreen from './NewGameScreen';
import NewSettings from './NewSettings';

interface LayoutProps {
  onUsernameChange: (username: string) => void;
  currentUsername: string;
}

const Layout: React.FC<LayoutProps> = ({ onUsernameChange, currentUsername }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);

  const defaultLeaderboardOpen = window.innerWidth >= 1000;

  // useEffect(() => {
  //   const setInitialLeaderboardVisibility = () => {
  //     setIsLeaderboardVisible(window.innerWidth >= 1000);
  //     window.removeEventListener('resize', setInitialLeaderboardVisibility);
  //   };

  //   setInitialLeaderboardVisibility();

  //   // Update visibility on window resize
  //   window.addEventListener('resize', setInitialLeaderboardVisibility);
  // }, []);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <div className={`flex flex-row w-screen h-screen overflow-hidden items-center justify-center relative ${isSettingsOpen ? 'blur-sm' : ''}`}>
        <div className="flex flex-row relative max-h-screen">
          <NewGameScreen username={currentUsername} onSettingsClick={toggleSettings} />
          <NewLeaderboard currentUsername={currentUsername} />
        </div>
      </div>
      {isSettingsOpen && (
        <div className="absolute inset-0 w-screen h-screen">
          <NewSettings
            // onClose={() => setIsSettingsOpen(false)} 
            // onUsernameChange={onUsernameChange}
            currentUsername={currentUsername}
          />
        </div>
      )}
    </>
  );
};

export default Layout;