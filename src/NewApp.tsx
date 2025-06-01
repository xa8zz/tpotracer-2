import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UsernameForm from './components/UsernameForm';
import { getUsername, setUsername } from './utils/storageUtils';
import NewGameScreen from './components/NewGameScreen';
import NewLayout from './components/NewLayout';

function NewApp() {
  const [username, setUsernameSt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load username from local storage
    const storedUsername = getUsername();
    setUsernameSt(storedUsername);
    setIsLoading(false);
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
    <NewLayout onUsernameChange={handleUsernameChange} currentUsername={username || ''}>
      <NewGameScreen username={username} />
      {!username && (
        <UsernameForm onSubmit={handleUsernameSubmit} />
      )}
    </NewLayout>
  );
}

export default NewApp;