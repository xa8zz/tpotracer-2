import React from 'react';

interface ScoreDisplayProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  onRestart: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  wpm,
  rawWpm,
  accuracy,
  onRestart
}) => {
  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-mono text-gray-300 mb-2">Test Complete</h2>
        <div className="flex items-center justify-center">
          <span className="text-6xl font-bold font-mono text-blue-500">{Math.round(wpm)}</span>
          <span className="text-xl font-mono text-gray-400 ml-2">WPM</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 font-mono mb-1">RAW</span>
          <span className="text-3xl font-mono text-gray-200">{Math.round(rawWpm)}</span>
          <span className="text-sm font-mono text-gray-500">WPM</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-gray-400 font-mono mb-1">ACC</span>
          <span className="text-3xl font-mono text-gray-200">{Math.round(accuracy)}%</span>
          <span className="text-sm font-mono text-gray-500">accuracy</span>
        </div>
      </div>
      
      <p className="text-gray-400 font-mono text-center mb-6">
        Press Tab or type to start a new test
      </p>
      
      <button 
        onClick={onRestart}
        className="px-6 py-2 bg-blue-600 text-white font-mono rounded hover:bg-blue-700 transition-colors duration-200"
      >
        New Test (or press Tab)
      </button>
    </div>
  );
};

export default ScoreDisplay;