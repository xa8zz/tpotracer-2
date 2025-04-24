import React from 'react';
import { LeaderboardEntry } from '../types';
import { getProfilePicture } from '../utils/userUtils';

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  // Function to determine the styling for rank positions
  const getRankStyles = (index: number) => {
    if (index === 0) return "bg-amber-800 bg-opacity-30 border-l-4 border-amber-500";
    if (index === 1) return "bg-gray-700 bg-opacity-30 border-l-4 border-gray-400";
    if (index === 2) return "bg-amber-900 bg-opacity-30 border-l-4 border-amber-700";
    return "border-l-4 border-transparent";
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 text-xs text-gray-400 bg-gray-800 sticky top-0 font-mono uppercase flex items-center">
        <span className="w-8 text-center">#</span>
        <span className="w-10"></span>
        <span className="flex-1">User</span>
        <span className="w-20 text-right">WPM</span>
      </div>

      <ul className="divide-y divide-gray-700">
        {data.length === 0 ? (
          <li className="py-6 px-4 text-center text-gray-500 font-mono">
            No entries yet. Be the first!
          </li>
        ) : (
          data.map((entry, index) => (
            <li 
              key={entry.username} 
              className={`py-3 px-4 flex items-center ${getRankStyles(index)} transition-colors duration-200 hover:bg-gray-700`}
            >
              <span className="w-8 font-mono text-gray-500 text-center">{index + 1}</span>
              <span className="w-10">
                <img 
                  src={getProfilePicture(entry.username)} 
                  alt={entry.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </span>
              <span className="flex-1 font-mono text-gray-300">{entry.username}</span>
              <span className="w-20 font-mono text-right text-gray-200 font-bold">
                {Math.round(entry.wpm)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;