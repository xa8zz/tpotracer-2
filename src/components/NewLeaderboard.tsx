import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useGameContext } from '../contexts/GameContext';
import { getRemainingTimeUntilEnd } from '../utils/leaderboardUtils';

interface LeaderboardProps {
  currentUsername: string | null;
}

function getBadgeClass(place: number): string {
  if (place >= 4) {
    return "text-tpotracer-100 glow-text-shadow-sm leaderboard-badge-plain"
  }

  return `leaderboard-badge-${place}`;
}

const NewLeaderboard: React.FC<LeaderboardProps> = ({
  currentUsername
}) => {
  const { 
    leaderboardData, 
    userPosition 
  } = useLeaderboard({ username: currentUsername });

  const { wpm, leaderboardPosition } = useGameContext();

  // Use actual game data for current user
  const currentUserLeaderboardData = {
    username: currentUsername || "guest",
    wpm: wpm,
    place: leaderboardPosition || userPosition || 999
  };

  // Use actual leaderboard data or fallback to mock data
  const displayLeaderboardData = leaderboardData.length > 0 ? leaderboardData : [
    { username: "yacineMTB", wpm: 200 },
    { username: "speedster", wpm: 185 },
    { username: "typingpro", wpm: 172 },
    { username: "keymaster", wpm: 168 },
    { username: "wordsmith", wpm: 155 },
    { username: "swiftkeys", wpm: 149 },
    { username: "typewriter", wpm: 142 },
    { username: "quickfingers", wpm: 138 },
    { username: "keyboard_warriorzzzz", wpm: 132 },
    { username: "typing_novice", wpm: 125 },
  ];

  const [visible, setVisible] = useState(window.innerWidth >= 1600);
  const toggleSetVisible = () => setVisible(!visible);

  return (
    <div className={`leaderboard-container ${visible ? "tr-visible" : ""}`}>
      <div className="leaderboard">
        <button className="absolute small-button dark-text-shadow-sm font-ptclean text-2xl w-[50px] h-[50px] top-[36px] left-[34px]" onClick={toggleSetVisible}>
          &lt;
        </button>
        <span className="absolute font-ptclean dark-text-shadow-sm text-tpotracer-400 text-4xl top-[125px] left-[162px]">
          {getRemainingTimeUntilEnd()}
        </span>
        <table className="leaderboard-table text-center absolute top-[190px] left-[75px] w-[380px] rounded-[26px]">
          <thead>
            <tr className="font-ptclean h-[45px] glow-text-shadow-sm text-tpotracer-100 text-2xl">
              <th className="w-[75px]">#</th>
              <th className="text-left">USERNAME</th>
              <th className="w-[75px]">WPM</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="font-ptclean relative h-[45px] glow-text-shadow-sm text-tpotracer-100 text-2xl">
              <td className="">
                <span className={`inline-block text-tpotracer-100 font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(currentUserLeaderboardData.place)}`}>
                {currentUserLeaderboardData.place}
                </span>
              </td>
              <td className="text-left flex items-center gap-[6px]">
                <span 
                  className="user-avatar rounded-[400px] mt-[-3px] w-[32px] h-[32px]"
                  style={{ '--avatar-url': `url(https://unavatar.io/x/${currentUserLeaderboardData.username})` } as React.CSSProperties}
                ></span>
                <span className="">@{currentUserLeaderboardData.username}</span>
              </td>
              <td className="">{currentUserLeaderboardData.wpm}</td>
              <div className="current-user-background"></div>
            </tr>
            <tr>
              <td colSpan={3} className="flex justify-center items-center">
                <div className="h-[3px] bg-gradient-to-r from-[rgba(42,143,195,0)] via-[rgba(242,143,195,1)] to-[rgba(42,143,195,0)]"></div>
              </td>
            </tr>
            {displayLeaderboardData.map((entry, index) => (
              <tr key={index} className="font-ptclean h-[44px] text-tpotracer-100 text-2xl">
                <td className="">
                  <span className={`inline-block font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(index + 1)}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="text-left flex items-center gap-[6px] glow-text-shadow-sm">
                  <span 
                    className="user-avatar rounded-[400px] mt-[-3px] w-[32px] h-[32px]"
                    style={{ '--avatar-url': `url(https://unavatar.io/x/${entry.username})` } as React.CSSProperties}
                  ></span>
                  <span className="">@{entry.username}</span>
                </td>
                <td className="glow-text-shadow-sm">{entry.wpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="leaderboard-condensed">
        <button className="absolute small-button dark-text-shadow-sm font-ptclean text-2xl w-[50px] h-[50px] top-[29px] left-[29px]" onClick={toggleSetVisible}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default NewLeaderboard;
