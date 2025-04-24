import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsProps {
  onClose: () => void;
  onUsernameChange: (username: string) => void;
  currentUsername: string;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClose, 
  onUsernameChange,
  currentUsername 
}) => {
  const [username, setUsername] = useState(currentUsername);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onUsernameChange(username.trim());
      onClose();
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-mono font-bold text-gray-100">Settings</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="username" className="block mb-2 text-sm font-mono text-gray-400">
            Change Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:border-blue-500 outline-none font-mono text-white transition-colors duration-200"
            placeholder="Enter new username"
          />
          <p className="mt-2 text-xs font-mono text-gray-500">
            Note: Changing your username only affects new games
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors duration-200 font-mono"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-mono"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;