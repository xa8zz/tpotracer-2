import React, { useState, useRef, useEffect } from 'react';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-mono font-bold mb-8 text-gray-100">
          tpotracer
        </h1>
        <p className="text-xl md:text-2xl font-mono mb-8 text-gray-300">
          Enter your Twitter handle
        </p>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 text-2xl md:text-3xl bg-transparent border-b-2 border-gray-700 focus:border-blue-500 outline-none font-mono text-center text-white transition-colors duration-200"
              placeholder="@username"
              aria-label="Twitter handle"
            />
          </div>
          <button
            type="submit"
            className="mt-6 px-8 py-3 text-lg font-mono bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Start Typing
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameForm;