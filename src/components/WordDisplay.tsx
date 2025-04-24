import React, { useRef } from 'react';
import { GameState } from '../types';
import Cursor from './Cursor';

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
  // Create refs for cursor positioning
  const lastTypedCharRef = useRef<HTMLSpanElement>(null);
  const nextCharRef = useRef<HTMLSpanElement>(null);

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
          let ref = null;
          
          if (charIndex < textToCompare.length) {
            // Character has been typed
            if (char === textToCompare[charIndex]) {
              className = 'text-green-400'; // Correct
              // Reference the last typed character
              if (index === currentWordIndex && charIndex === textToCompare.length - 1) {
                ref = lastTypedCharRef;
              }
            } else {
              className = 'text-red-500'; // Incorrect
            }
          } else if (index === currentWordIndex && charIndex === textToCompare.length) {
            // This is the next character to be typed - no special highlighting
            ref = nextCharRef;
          }
          
          return (
            <span 
              key={charIndex} 
              ref={ref} 
              className={className}
            >
              {char}
            </span>
          );
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

  // Determine which ref to use for the cursor
  const cursorRef = (() => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return null;

    // If we haven't typed anything in the current word yet,
    // or if we just pressed space (typedText is empty),
    // show cursor before the first character
    if (typedText.length === 0) {
      return nextCharRef;
    }

    // Otherwise show cursor after the last typed character
    return lastTypedCharRef;
  })();

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg font-mono relative">
      <div className="flex flex-wrap gap-4 text-2xl md:text-3xl leading-relaxed">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            {highlightWord(word, index)}
            {index < words.length - 1 && <span className="text-gray-600">·</span>}
          </React.Fragment>
        ))}
      </div>
      <Cursor 
        targetRef={cursorRef}
        isVisible={gameState === 'playing' || gameState === 'waiting'} 
      />
    </div>
  );
};

export default WordDisplay;