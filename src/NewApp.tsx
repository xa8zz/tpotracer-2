import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UsernameForm from './components/UsernameForm';
import { getUsername, setUsername } from './utils/storageUtils';
import NewGameScreen from './components/NewGameScreen';
import NewLayout from './components/NewLayout';
import NewSettings from './components/NewSettings';

function NewApp() {
  const [username, setUsernameSt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load username from local storage
    const storedUsername = getUsername();
    setUsernameSt(storedUsername);
    setIsLoading(false);

    (window as any)._debugRemoveUsername = function() {
      setUsernameSt(null);
      setUsername(null);
    }
  }, []);

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    setUsernameSt(newUsername);
  };

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setUsernameSt(newUsername);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-300 font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <NewLayout onUsernameChange={handleUsernameChange} currentUsername={username || ''}>
        <NewGameScreen username={username} />
      </NewLayout>
      <NewSettings onClose={() => {}} onUsernameChange={handleUsernameChange} currentUsername={username || ''} />
    </div>
  );
}

export default NewApp;