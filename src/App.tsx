import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UsernameForm from './components/UsernameForm';
import GameScreen from './components/GameScreen';
import { getUsername, setUsername } from './utils/storageUtils';
import NewGameScreen from './components/NewGameScreen';

function App() {
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
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-300 font-mono">Loading...</p>
    </div>;
  }

  return (
    <Layout onUsernameChange={handleUsernameChange} currentUsername={username || ''}>
      {!username ? (
        <UsernameForm onSubmit={handleUsernameSubmit} />
      ) : (
        <NewGameScreen username={username} />
        // <GameScreen username={username} />
      )}
    </Layout>
  );
}

export default App;