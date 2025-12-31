import React, { useState, useEffect } from 'react';
import { getUsername, setUsername } from './utils/storageUtils';
import NewLayout from './components/NewLayout';
import { GameContextProvider } from './contexts/GameContext';

interface NewAppProps {
  onReady: () => void;
}

function NewApp({ onReady }: NewAppProps) {
  const [username, setUsernameSt] = useState<string | null>(() => getUsername());

  useEffect(() => {
    // Signal that the app is mounted and ready
    onReady();

    (window as any)._debugRemoveUsername = function() {
      setUsernameSt(null);
      setUsername(null);
    }
  }, [onReady]);

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setUsernameSt(newUsername);
  };

  return (
    <div className="relative">
      <GameContextProvider username={username || ''}>
        <NewLayout onUsernameChange={handleUsernameChange} currentUsername={username || ''} />
      </GameContextProvider>
    </div>
  );
}

export default NewApp;