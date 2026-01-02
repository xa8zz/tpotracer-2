import { useEffect, RefObject } from 'react';
import { useButtonSound, ButtonSize } from './useButtonSound';

/**
 * Hook to attach low-latency native event listeners for button sounds
 * Bypasses React's synthetic event system for immediate feedback
 */
export const useClickSound = (
  ref: RefObject<HTMLElement>,
  size: ButtonSize = 0,
  enabled: boolean = true
) => {
  const { playBtnDown, playBtnUp } = useButtonSound();

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const handleMouseDown = () => playBtnDown(size);
    const handleMouseUp = () => playBtnUp(size);

    // Use native event listeners for lower latency
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    
    // Also handle touch for mobile responsiveness (optional but good practice)
    // We use passive: true for better scrolling performance
    // const handleTouchStart = () => playBtnDown(size);
    // const handleTouchEnd = () => playBtnUp(size);
    
    // element.addEventListener('touchstart', handleTouchStart, { passive: true });
    // element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      // element.removeEventListener('touchstart', handleTouchStart);
      // element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, playBtnDown, playBtnUp, size, enabled]);
};

