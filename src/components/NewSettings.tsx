import React, { useState } from 'react';
import { X } from 'lucide-react';
import NewButton from './NewButton';

interface SettingsProps {
  currentUsername: string;
  visible: boolean;
  className?: string;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  currentUsername,
  visible,
  className,
  onClose
}) => {
  const [username, setUsername] = useState(currentUsername);

  const sanitizedSetUsername = (input: string) => {
    const sanitized = input.trim().replace(/^@+/, '');
    setUsername(sanitized);
  };

  return (
    <div className={`absolute inset-0 w-screen h-screen transition-all duration-200 ease ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_100%)]"></div>
      <div className={`new-settings-modal ${className}`}>
        <div className="relative w-full h-full rounded-[51px] p-[30px]">
          <button 
            className="absolute small-button dark-text-shadow font-ptclean text-2xl w-[50px] h-[50px] top-[29px] left-[29px]"
            onClick={onClose}
          >
            x
          </button>
          <span 
            className="absolute top-[110px] left-[50px] font-ptclean dark-text-shadow text-tpotracer-400 text-2xl"
          >
            What is your X username?
          </span>
          <span 
            className="absolute top-[166px] left-[58px] font-ptclean dark-text-shadow text-tpotracer-400 text-3xl opacity-30"
          >
            @
          </span>
          <input 
            type="text"
            className="absolute top-[162px] left-[46px] h-[42px] w-[285px] p-0 pl-[30px] rounded-[500px] font-ptclean dark-text-shadow text-2xl bg-transparent text-tpotracer-400 text-2xl"
            value={username}
            onChange={(e) => sanitizedSetUsername(e.target.value)}
          />
          <NewButton size="md" className="absolute top-[158px] left-[353px]">Save</NewButton>
          <NewButton size="lg" className="absolute top-[258px] left-[353px]">Toggle Audio</NewButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;