import { useState, useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/web';

// Flag to enable early settling (showing cursor before animation fully finishes)
const USE_EARLY_SETTLE = false;

export type BackgroundIntent = 'modal' | 'startup' | 'firstStartup';

function getBackgroundFilter(isActive: boolean, intent: BackgroundIntent): string {
  if (!isActive) return 'blur(0px)';
  
  if (intent === 'firstStartup') {
    return 'blur(20px)';
  }

  if (intent === 'modal') {
    return 'blur(5px)';
  }
  
  return 'blur(20px)';
}

function getBackgroundTransform(isActive: boolean, intent: BackgroundIntent): string {
  if (!isActive) return 'scale(1)';
  
  if (intent === 'firstStartup') {
    return 'scale(0.70)';
  }

  if (intent === 'modal') {
    return 'scale(0.95)';
  }
  
  return 'scale(0.80)';
}

export function getSpringConfig(intent: BackgroundIntent) {
  if (intent === 'modal') {
    return {
      tension: 500,
      friction: 50,
    };
  }

  if (intent === 'firstStartup') {
    return {
      tension: 260,
      friction: 50,
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
 * @param intent - The intent of the backgrounding ('modal', 'startup', or 'firstStartup')
 * @param useFirstStartupConfig - Override to use firstStartup config (for slow transition out of firstStartup)
 * @returns Object containing the spring styles and the settled state
 */
export const useBackgroundSpring = (isActive: boolean, intent: BackgroundIntent = 'startup', useFirstStartupConfig = false) => {
  const [isSettled, setIsSettled] = useState(true);

  // Keep track of the last intent when active to use for exit animations
  // This ensures that when closing a modal, we use the 'modal' spring config
  // instead of falling back to the slower 'startup' config
  const activeIntentRef = useRef(intent);

  useEffect(() => {
    if (isActive) {
      activeIntentRef.current = intent;
    }
  }, [isActive, intent]);

  // If we are active, use current intent. If not active (exiting), use the last active intent.
  const configIntent = isActive ? intent : activeIntentRef.current;

  const config = useFirstStartupConfig ? getSpringConfig('firstStartup') : getSpringConfig(configIntent);

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
    config,
  });

  return { styles, isSettled };
};
