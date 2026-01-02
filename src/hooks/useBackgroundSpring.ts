import { useState } from 'react';
import { useSpring } from '@react-spring/web';

// Flag to enable early settling (showing cursor before animation fully finishes)
const USE_EARLY_SETTLE = false;

function getBackgroundFilter(isActive: boolean, intent: 'modal' | 'startup'): string {
  if (!isActive) return 'blur(0px)';
  
  if (intent === 'modal') {
    return 'blur(10px)';
  }
  
  return 'blur(20px)';
}

function getBackgroundTransform(isActive: boolean, intent: 'modal' | 'startup'): string {
  if (!isActive) return 'scale(1)';
  
  if (intent === 'modal') {
    return 'scale(0.90)';
  }
  
  return 'scale(0.80)';
}

function getSpringConfig(intent: 'modal' | 'startup') {
  if (intent === 'modal') {
    return {
      tension: 300,
      friction: 30,
    };
  }
  
  return {
    tension: 260,
    friction: 50,
  };
}

/**
 * Hook to create a spring animation for backgrounding content (blur + scale).
 * Used for the main game container when modals are open or during loading.
 * 
 * @param isActive - Whether the background effect should be active (blurred and scaled down)
 * @param intent - The intent of the backgrounding ('modal' or 'startup')
 * @returns Object containing the spring styles and the settled state
 */
export const useBackgroundSpring = (isActive: boolean, intent: 'modal' | 'startup' = 'startup') => {
  const [isSettled, setIsSettled] = useState(true);

  const styles = useSpring({
    to: {
      filter: getBackgroundFilter(isActive, intent),
      transform: getBackgroundTransform(isActive, intent),
    },
    onStart: () => setIsSettled(false),
    onRest: () => setIsSettled(true),
    onChange: (result) => {
      // If we are animating back to normal (isActive is false)
      if (USE_EARLY_SETTLE && !isActive) {
        // Check if we are "close enough" to the end state to show the cursor
        // Let's say if scale is > 0.98 we are good to go
        const transform = result.value.transform;
        if (typeof transform === 'string') {
          const match = transform.match(/scale\(([^)]+)\)/);
          if (match) {
            const currentScale = parseFloat(match[1]);
            if (currentScale > 0.98 && !isSettled) {
              setIsSettled(true);
            }
          }
        }
      }
    },
    config: getSpringConfig(intent),
  });

  return { styles, isSettled };
};


