import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getRemainingTimeUntilEnd } from '../utils/leaderboardUtils';

interface LeaderboardProps {
  currentUsername: string | null;
}

function getBadgeClass(place: number): string {
  if (place >= 4) {
    return "text-tpotracer-100 glow-text-shadow leaderboard-badge-plain"
  }

  return `leaderboard-badge-${place}`;
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

  const mockCurrentUserLeaderboardData =
    { username: "@marcusquest", wpm: 100, place: 13 };

  const mockLeaderboardData = [
    { username: "@yacineMTB", wpm: 200 },
    { username: "@speedster", wpm: 185 },
    { username: "@typingpro", wpm: 172 },
    { username: "@keymaster", wpm: 168 },
    { username: "@wordsmith", wpm: 155 },
    { username: "@swiftkeys", wpm: 149 },
    { username: "@typewriter", wpm: 142 },
    { username: "@quickfingers", wpm: 138 },
    { username: "@keyboard_warriorzzzz", wpm: 132 },
    { username: "@typing_novice", wpm: 125 },
  ]

  const [visible, setVisible] = useState(window.innerWidth >= 1600);
  const toggleSetVisible = () => setVisible(!visible);

  return (
    <div className={`leaderboard-container ${visible ? "tr-visible" : ""}`}>
      <div className="leaderboard">
        <button className="absolute small-button dark-text-shadow font-ptclean text-2xl pt-[10px] w-[50px] h-[50px] top-[36px] left-[34px]" onClick={toggleSetVisible}>
          ^
        </button>
        <span className="absolute font-ptclean dark-text-shadow text-tpotracer-400 text-4xl font-bold top-[125px] left-[162px]">
          {getRemainingTimeUntilEnd()}
        </span>
        <table className="leaderboard-table text-center absolute top-[190px] left-[75px] w-[380px] rounded-[26px]">
          <thead>
            <tr className="font-ptclean h-[45px] glow-text-shadow text-tpotracer-100 text-2xl">
              <th className="w-[75px]">#</th>
              <th className="text-left">USERNAME</th>
              <th className="w-[75px]">WPM</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="font-ptclean relative h-[45px] glow-text-shadow text-tpotracer-100 text-2xl">
              <td className="">
                <span className={`inline-block text-tpotracer-100 font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(mockCurrentUserLeaderboardData.place)}`}>
                {mockCurrentUserLeaderboardData.place}
                </span>
              </td>
              <td className="text-left flex items-center gap-[6px]">
                <span className="user-avatar bg-tpotracer-100 mt-[-3px] rounded-[400px] w-[32px] h-[32px]"></span>
                <span className="">{mockCurrentUserLeaderboardData.username}</span>
              </td>
              <td className="">{mockCurrentUserLeaderboardData.wpm}</td>
              <div className="current-user-background"></div>
            </tr>
            <tr>
              <td colSpan={3} className="flex justify-center items-center">
                <div className="h-[3px] bg-gradient-to-r from-[rgba(42,143,195,0)] via-[rgba(42,143,195,1)] to-[rgba(42,143,195,0)]"></div>
              </td>
            </tr>
            {mockLeaderboardData.map((entry, index) => (
              <tr key={index} className="font-ptclean h-[44px] text-tpotracer-100 text-2xl">
                <td className="">
                  <span className={`inline-block font-bold w-[30px] h-[25px] leading-[28px] rounded-[4px] ${getBadgeClass(index + 1)}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="text-left flex items-center gap-[6px] glow-text-shadow">
                  <span className="user-avatar bg-tpotracer-100 mt-[-3px] rounded-[400px] w-[32px] h-[32px]"></span>
                  <span className="">{entry.username}</span>
                </td>
                <td className="glow-text-shadow">{entry.wpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
