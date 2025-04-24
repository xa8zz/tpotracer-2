import React from 'react';

const HelpSection: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 mt-2 text-gray-300 font-mono">
      <div className="mb-4">
        <h4 className="text-blue-400 text-lg mb-2">What is tpotracer?</h4>
        <p className="text-sm mb-2">
          tpotracer is a speed typing test site designed for X (Twitter) users. Enter your X username and test your typing speed to be placed on the global leaderboard.
        </p>
      </div>

      <div className="mb-4">
        <h4 className="text-blue-400 text-lg mb-2">How to use:</h4>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Enter your X username to get started</li>
          <li>Type the displayed words as quickly and accurately as possible</li>
          <li>Press Space to advance to the next word</li>
          <li>Press Tab at any time to restart the test</li>
          <li>Complete all words to see your results</li>
        </ol>
      </div>

      <div className="mb-4">
        <h4 className="text-blue-400 text-lg mb-2">Leaderboard:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>The leaderboard shows the top 20 typists globally</li>
          <li>Your position is displayed at the top if you're not in the top 20</li>
          <li>Leaderboard refreshes every 5 minutes</li>
          <li>Click any username to visit their X profile</li>
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-blue-400 text-lg mb-2">Scoring:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>WPM (Words Per Minute) measures your typing speed</li>
          <li>Only your highest score is submitted to the leaderboard</li>
          <li>Accuracy affects your final WPM score</li>
        </ul>
      </div>

      <div>
        <h4 className="text-blue-400 text-lg mb-2">Sharing:</h4>
        <p className="text-sm">
          Use the Share Card to download an image of your score and share it on X or other social platforms.
        </p>
      </div>
    </div>
  );
};

export default HelpSection; 