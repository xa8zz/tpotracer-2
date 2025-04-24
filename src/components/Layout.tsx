import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import { Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface LayoutProps {
  children: React.ReactNode;
  onUsernameChange: (username: string) => void;
  currentUsername: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onUsernameChange, currentUsername }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(true);
  const { leaderboardData } = useLeaderboard();

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleLeaderboard = () => {
    setIsLeaderboardVisible(!isLeaderboardVisible);
  };

  return (
    <div className="flex flex-row h-screen bg-gray-900 text-gray-200 overflow-hidden">
      {/* Left side - Leaderboard */}
      <div className={`${isLeaderboardVisible ? 'w-80' : 'w-auto'} transition-all duration-300 border-r border-gray-700 bg-gray-800 flex flex-col`}>
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          {isLeaderboardVisible && (
            <h1 className="text-xl font-mono font-bold text-gray-100">tpotracer</h1>
          )}
          <div className={`flex items-center gap-2 ${!isLeaderboardVisible ? 'w-full justify-center' : ''}`}>
            {isLeaderboardVisible && (
              <button 
                onClick={toggleSettings}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                aria-label="Settings"
              >
                <SettingsIcon size={20} className="text-gray-300" />
              </button>
            )}
            <button 
              onClick={toggleLeaderboard}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
              aria-label={isLeaderboardVisible ? 'Hide Leaderboard' : 'Show Leaderboard'}
            >
              {isLeaderboardVisible ? <ChevronLeft size={20} className="text-gray-300" /> : <ChevronRight size={20} className="text-gray-300" />}
            </button>
          </div>
        </div>
        {isLeaderboardVisible && (
          <>
            <h2 className="text-xl font-mono font-bold text-gray-100 p-4 border-b border-gray-700">Leaderboard</h2>
            <div className="flex-1 overflow-y-auto">
              <Leaderboard data={leaderboardData} />
            </div>
          </>
        )}
      </div>

      {/* Right side - Main Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {children}
          
          {/* Settings overlay */}
          {isSettingsOpen && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
              <Settings 
                onClose={() => setIsSettingsOpen(false)} 
                onUsernameChange={onUsernameChange}
                currentUsername={currentUsername}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;