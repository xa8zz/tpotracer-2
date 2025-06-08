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

  return (
    <div className={`absolute inset-0 w-screen h-screen transition-all duration-200 ease ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_100%)]"></div>
      <div className={`new-settings-modal ${className}`}>
        <div className="relative w-full h-full rounded-[51px] p-[30px]">
          <button className="absolute small-button dark-text-shadow font-ptclean text-2xl w-[50px] h-[50px] top-[29px] left-[29px]" onClick={onClose}>
            x
          </button>
          <span className="absolute top-[100px] left-[50px] font-ptclean dark-text-shadow text-tpotracer-400 text-2xl">What is your X username?</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;