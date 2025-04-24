import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { getProfilePicture } from '../utils/userUtils';
import { Clock, User } from 'lucide-react';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  refreshTime: number;
  isLoading: boolean;
  userPosition?: {
    position: number;
    entry: LeaderboardEntry;
  };
  currentUsername?: string;
  onRefresh?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  data, 
  refreshTime, 
  isLoading,
  userPosition,
  currentUsername,
  onRefresh
}) => {
  // Local state for testing without backend
  const [localUserPosition, setLocalUserPosition] = useState<{
    position: number;
    entry: LeaderboardEntry;
  } | undefined>(userPosition);

  // Create fallback user position for local testing if needed
  useEffect(() => {
    if (!userPosition && currentUsername && !data.some(entry => entry.username === currentUsername)) {
      // Create a fallback user position for testing without backend
      setLocalUserPosition({
        position: data.length > 0 ? data.length + 1 : 1,
        entry: {
          username: currentUsername,
          wpm: 0,
          timestamp: Date.now()
        }
      });
    } else {
      setLocalUserPosition(userPosition);
    }
  }, [userPosition, currentUsername, data]);

  // Function to determine the styling for rank positions
  const getRankStyles = (index: number) => {
    if (index === 0) return "bg-amber-800 bg-opacity-30 border-l-4 border-amber-500";
    if (index === 1) return "bg-gray-700 bg-opacity-30 border-l-4 border-gray-400";
    if (index === 2) return "bg-amber-900 bg-opacity-30 border-l-4 border-amber-700";
    return "border-l-4 border-transparent";
  };

  // Format the refresh time (convert seconds to minutes:seconds)
  const formatRefreshTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to open X profile in new tab
  const openXProfile = (username: string) => {
    window.open(`https://x.com/${username}`, '_blank');
  };

  // Render a leaderboard entry
  const renderEntry = (entry: LeaderboardEntry, index: number, isUserEntry = false) => {
    return (
      <li 
        key={isUserEntry ? `user-${entry.username}` : entry.username} 
        className={`py-3 px-4 flex items-center ${
          isUserEntry 
            ? "bg-blue-900 bg-opacity-30 border-l-4 border-blue-500" 
            : getRankStyles(index)
        } transition-colors duration-200 hover:bg-gray-700`}
      >
        <span className="w-8 font-mono text-gray-500 text-center">
          {isUserEntry ? "You" : index + 1}
        </span>
        <span className="w-10">
          {isUserEntry && !entry.wpm ? (
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center">
              <User size={16} className="text-blue-400" />
            </div>
          ) : (
            <img 
              src={getProfilePicture(entry.username)} 
              alt={entry.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </span>
        <span 
          className="flex-1 font-mono text-gray-300 hover:text-blue-400 cursor-pointer"
          onClick={() => openXProfile(entry.username)}
          title={`View ${entry.username}'s X profile`}
        >
          @{entry.username}
        </span>
        <span className="w-20 font-mono text-right text-gray-200 font-bold">
          {Math.round(entry.wpm)}
        </span>
      </li>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Refresh timer */}
      <div className="px-4 py-2 text-xs text-gray-400 bg-gray-800 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          <span>Refresh in {formatRefreshTime(refreshTime)}</span>
        </span>
        <button 
          onClick={onRefresh}
          className="text-blue-400 hover:text-blue-300"
          disabled={isLoading}
        >
          Refresh Now
        </button>
      </div>

      <div className="px-4 py-2 text-xs text-gray-400 bg-gray-800 sticky top-0 font-mono uppercase flex items-center">
        <span className="w-8 text-center">#</span>
        <span className="w-10"></span>
        <span className="flex-1">User</span>
        <span className="w-20 text-right">WPM</span>
      </div>

      <ul className="divide-y divide-gray-700">
        {/* Show user position if available and not in top list */}
        {localUserPosition && currentUsername && 
         !data.some(entry => entry.username === currentUsername) && (
          renderEntry(localUserPosition.entry, localUserPosition.position, true)
        )}

        {data.length === 0 ? (
          <li className="py-6 px-4 text-center text-gray-500 font-mono">
            {isLoading ? 'Loading...' : 'No entries yet. Be the first!'}
          </li>
        ) : (
          data.map((entry, index) => {
            const isCurrentUser = entry.username === currentUsername;
            return renderEntry(entry, index, isCurrentUser);
          })
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;