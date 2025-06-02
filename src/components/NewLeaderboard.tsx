import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface LeaderboardProps {
  currentUsername: string | null;
}

const NewLeaderboard: React.FC<LeaderboardProps> = ({
  currentUsername
}) => {
  const { 
    leaderboardData, 
    isLoading, 
    refreshTime, 
    userPosition, 
    forceRefresh 
  } = useLeaderboard({ username: currentUsername });

  const [visible, setVisible] = useState(window.innerWidth >= 1600);
  const toggleSetVisible = () => setVisible(!visible);

  return (
    <div className={`leaderboard-container ${visible ? "tr-visible" : ""}`}>
      <div className="leaderboard">
        <button className="absolute dark-text-shadow font-ptclean text-2xl pt-[10px] w-[50px] h-[50px] top-[34px] left-[34px]" onClick={toggleSetVisible}>
          ^
        </button>
      </div>
      <div className="leaderboard-condensed">
        <button className="absolute dark-text-shadow font-ptclean text-2xl w-[50px] h-[50px] top-[29px] left-[29px]" onClick={toggleSetVisible}>
          v
        </button>
      </div>
    </div>
  );
};

export default NewLeaderboard;
