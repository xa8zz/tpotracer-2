import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import { Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import NewLeaderboard from './NewLeaderboard';

interface LayoutProps {
  children: React.ReactNode;
  onUsernameChange: (username: string) => void;
  currentUsername: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onUsernameChange, currentUsername }) => {
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
    <div className="flex flex-row w-screen h-screen overflow-hidden items-center justify-center relative">
      <div className="flex flex-row relative max-h-screen">
      {children}
      <NewLeaderboard currentUsername={currentUsername} />
      {isSettingsOpen && (
        <div className="absolute w-screen h-screen">
          <Settings 
            onClose={() => setIsSettingsOpen(false)} 
            onUsernameChange={onUsernameChange}
            currentUsername={currentUsername}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default Layout;