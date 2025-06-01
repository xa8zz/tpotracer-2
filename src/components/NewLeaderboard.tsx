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

  return (
      visible ? (
      <div className="leaderboard-container relative">
        <button onClick={() => setVisible(!visible)}>
          Toggle Set Visible
        </button>
      </div>
    ) : (
      <div className="leaderboard-condensed">
        <button onClick={() => setVisible(!visible)}>
          Toggle Set Visible
        </button>
        bye
      </div>
    )
  );
};

export default NewLeaderboard;
