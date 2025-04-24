import React, { useEffect, useState } from 'react';

interface CursorProps {
  targetRef: React.RefObject<HTMLSpanElement> | null;
  isVisible: boolean;
}

const Cursor: React.FC<CursorProps> = ({ targetRef, isVisible }) => {
  const [position, setPosition] = useState({ left: 0, top: 0, height: 0 });

  const updatePosition = () => {
    if (targetRef?.current && isVisible) {
      const rect = targetRef.current.getBoundingClientRect();
      // Check if this is a next character ref by checking if it's green
      // (if it's not green, it hasn't been typed yet, so it must be next)
      const isNextChar = !targetRef.current.className.includes('text-green-400');
      
      setPosition({
        left: isNextChar ? rect.left : rect.left + rect.width, // Position before or after based on ref type
        top: rect.top,
        height: rect.height
      });
    }
  };

  useEffect(() => {
    updatePosition();

    // Update position on window resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // true for capturing phase

    // Also update on animation frame to ensure smooth transitions
    let frameId: number;
    const updateOnFrame = () => {
      updatePosition();
      frameId = requestAnimationFrame(updateOnFrame);
    };
    frameId = requestAnimationFrame(updateOnFrame);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      cancelAnimationFrame(frameId);
    };
  }, [targetRef, isVisible]);

  // Also update position when target ref or visibility changes
  useEffect(() => {
    updatePosition();
  }, [targetRef?.current, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed w-0.5 bg-blue-500 transition-all duration-100 ease-out animate-blink"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        height: `${position.height}px`,
        transform: 'translateX(0)',
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
};

export default Cursor; 