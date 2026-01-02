import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CursorProps {
  targetRef: React.RefObject<HTMLSpanElement> | null;
  isVisible: boolean;
}

const Cursor: React.FC<CursorProps> = ({ targetRef, isVisible }) => {
  const [position, setPosition] = useState({ left: 0, top: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  const updatePosition = () => {
    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();

      // Don't position until we have a valid rect
      if (rect.top === 0 && rect.left === 0 && rect.height === 0) {
        return;
      }
      
      const isNextChar = !targetRef.current.className.includes('text-green-400');
      
      setPosition({
        left: isNextChar ? rect.left : rect.left + rect.width, // Position before or after based on ref type
        top: rect.top,
        height: rect.height
      });

      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setIsInitialized(false);
    }
  }, [isVisible]);

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

  if (!isVisible || !isInitialized) return null;

  return createPortal(
    <div
      className="fixed w-[2px] bg-tpotracer-100 transition-all duration-100 ease-out animate-blink glow-shadow-sm"
      style={{
        left: `${position.left - 1}px`,
        top: `${position.top}px`,
        height: `${position.height}px`,
        transform: 'translateX(0)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />,
    document.body
  );
};

export default Cursor; 