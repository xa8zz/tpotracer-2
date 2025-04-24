import React from 'react';
import { GameState } from '../types';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  typedText: string;
  typedHistory: string[];
  gameState: GameState;
}

const WordDisplay: React.FC<WordDisplayProps> = ({
  words,
  currentWordIndex,
  typedText,
  typedHistory,
  gameState
}) => {
  // Function to highlight characters in a word
  const highlightWord = (word: string, index: number) => {
    const textToCompare = index === currentWordIndex ? typedText : typedHistory[index] || '';
    
    if (index > currentWordIndex || gameState === 'completed') {
      return <span key={index} className="text-gray-400">{word}</span>;
    }

    return (
      <span key={index}>
        {word.split('').map((char, charIndex) => {
          let className = 'text-gray-400'; // Default color
          
          if (charIndex < textToCompare.length) {
            // Character has been typed
            if (char === textToCompare[charIndex]) {
              className = 'text-green-400'; // Correct
            } else {
              className = 'text-red-500'; // Incorrect
            }
          } else if (index === currentWordIndex && charIndex === textToCompare.length) {
            className = 'text-gray-200 border-b-2 border-blue-500'; // Current character
          }
          
          return <span key={charIndex} className={className}>{char}</span>;
        })}
        
        {/* Show incorrect extra characters */}
        {textToCompare.length > word.length && (
          <span className="text-red-500">
            {textToCompare.slice(word.length)}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg font-mono">
      <div className="flex flex-wrap gap-4 text-2xl md:text-3xl leading-relaxed">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            {highlightWord(word, index)}
            {index < words.length - 1 && <span className="text-gray-600">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WordDisplay;