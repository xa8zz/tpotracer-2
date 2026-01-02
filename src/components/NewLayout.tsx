import React, { useState, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import NewLeaderboard from './NewLeaderboard';
import NewGameScreen from './NewGameScreen';
import NewSettings from './NewSettings';
import AdvancedSettings from './AdvancedSettings';
import Credits from './Credits';
import UsernameModal from './UsernameModal';
import HelpModal from './HelpModal';
import { useGameContext } from '../contexts/GameContext';
import { useBackgroundSpring, getSpringConfig, BackgroundIntent } from '../hooks/useBackgroundSpring';

interface LayoutProps {
  onUsernameChange: (username: string) => void;
  currentUsername: string;
}

const Layout: React.FC<LayoutProps> = ({ onUsernameChange, currentUsername }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isHelpExpanded, toggleHelp } = useGameContext();

  // Track when loading screen is ready to fade out
  useEffect(() => {
    const checkLoader = () => {
      const loader = document.getElementById('loader');
      // If loader doesn't exist or has fade-out class, loading is complete
      if (!loader || loader.classList.contains('fade-out')) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkLoader()) {
      return;
    }

    // Listen for when fade-out class is added to the loader
    const loader = document.getElementById('loader');
    if (loader) {
      const observer = new MutationObserver(() => {
        if (checkLoader()) {
          observer.disconnect();
        }
      });
      observer.observe(loader, { attributes: true, attributeFilter: ['class'] });
      
      // Also check periodically as fallback (in case loader isn't in DOM yet)
      const interval = setInterval(() => {
        if (checkLoader()) {
          clearInterval(interval);
          observer.disconnect();
        }
      }, 50);

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    // Fallback: if loader doesn't exist yet, poll for it
    const pollInterval = setInterval(() => {
      if (checkLoader()) {
        clearInterval(pollInterval);
      }
    }, 50);

    return () => clearInterval(pollInterval);
  }, []);

  // useEffect(() => {
  //   const setInitialLeaderboardVisibility = () => {
  //     setIsLeaderboardVisible(window.innerWidth >= 1000);
  //     window.removeEventListener('resize', setInitialLeaderboardVisibility);
  //   };

  //   setInitialLeaderboardVisibility();

  //   // Update visibility on window resize
  //   window.addEventListener('resize', setInitialLeaderboardVisibility);
  // }, []);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const openAdvancedSettings = () => {
    setIsSettingsOpen(false);
    setIsAdvancedSettingsOpen(true);
  };

  const closeAdvancedSettings = () => {
    setIsAdvancedSettingsOpen(false);
  };

  const isUsernameModalVisible = !currentUsername || currentUsername === '';

  // Determine if container should be backgrounded
  const shouldBeBackgrounded = !isLoaded || isSettingsOpen || isAdvancedSettingsOpen || isUsernameModalVisible || isHelpExpanded;
  
  // Track if we're in first startup phase (no username AND not loaded yet)
  const isFirstStartup = isUsernameModalVisible && !isLoaded;
  // Track if we just exited first startup (for using slow transition config)
  const wasFirstStartupRef = React.useRef(isFirstStartup);
  const [transitioningFromFirstStartup, setTransitioningFromFirstStartup] = React.useState(false);
  
  React.useEffect(() => {
    if (wasFirstStartupRef.current && !isFirstStartup) {
      // We just transitioned out of firstStartup
      setTransitioningFromFirstStartup(true);
    }
    wasFirstStartupRef.current = isFirstStartup;
  }, [isFirstStartup]);
  
  let intent: BackgroundIntent = 'startup';
  if (isFirstStartup) {
    intent = 'firstStartup';
  } else if (isSettingsOpen || isAdvancedSettingsOpen || isUsernameModalVisible || isHelpExpanded) {
    intent = 'modal';
  }

  // Use firstStartup config when transitioning OUT of firstStartup for the slow entrance effect
  const springConfig = transitioningFromFirstStartup ? getSpringConfig('firstStartup') : getSpringConfig(intent);

  const { styles: springStyles, isSettled } = useBackgroundSpring(shouldBeBackgrounded, intent, transitioningFromFirstStartup);

  // Spring for the username modal entrance
  const modalSpring = useSpring({
    to: {
      transform: isFirstStartup ? 'translate(-50%, -50%) scale(0.85)' : 'translate(-50%, -50%) scale(1)',
      filter: isFirstStartup ? 'blur(10px)' : 'blur(0px)',
    },
    config: springConfig,
    onRest: () => {
      if (transitioningFromFirstStartup) {
        setTransitioningFromFirstStartup(false);
      }
    },
  });

  return (
    <>
      <div className="flex flex-row w-screen h-screen overflow-hidden items-center justify-center relative">
        <animated.div 
          className="stupid-big-ass-container flex flex-row relative max-h-screen"
          style={springStyles}
        >
          <NewGameScreen 
            username={currentUsername} 
            onSettingsClick={toggleSettings} 
            isBackgrounded={shouldBeBackgrounded}
            isSpringSettled={isSettled}
          />
          <NewLeaderboard currentUsername={currentUsername} />
        </animated.div>
      </div>
      <NewSettings
        onClose={toggleSettings} 
        visible={isSettingsOpen}
        onUsernameChange={onUsernameChange}
        currentUsername={currentUsername}
        onOpenAdvancedSettings={openAdvancedSettings}
      />
      <AdvancedSettings
        visible={isAdvancedSettingsOpen}
        onClose={closeAdvancedSettings}
      />
      <UsernameModal
        visible={isUsernameModalVisible}
        onUsernameChange={onUsernameChange}
        currentUsername={currentUsername}
        style={modalSpring}
      />
      <HelpModal
        visible={isHelpExpanded}
        onClose={toggleHelp}
      />
      <Credits usernameModalVisible={isUsernameModalVisible} />
    </>
  );
};

export default Layout;