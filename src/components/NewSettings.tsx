import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import NewButton from './NewButton';

interface SettingsProps {
  currentUsername: string;
  visible: boolean;
  className?: string;
  onClose: () => void;
  onUsernameChange: (username: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  currentUsername,
  visible,
  className,
  onClose,
  onUsernameChange
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Video starts muted by default

  // Reset username to current when modal opens
  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
    }
  }, [visible, currentUsername]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        visible &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  const sanitizedSetUsername = (input: string) => {
    // Remove @ symbols and trim, then filter to only alphanumeric and underscore
    const cleaned = input.replace(/^@+/, '').trim();
    const filtered = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
    // Limit to 20 characters max
    const limited = filtered.slice(0, 20);
    setUsername(limited);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const newValue = currentValue.slice(0, -1);
      sanitizedSetUsername(newValue);
    }
  };

  const toggleVideo = () => {
    const videoIframe = document.getElementById('video') as HTMLIFrameElement;
    if (videoIframe && videoIframe.contentWindow) {
      if (isVideoPlaying) {
        videoIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        videoIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleAudio = () => {
    const videoIframe = document.getElementById('video') as HTMLIFrameElement;
    if (videoIframe && videoIframe.contentWindow) {
      if (isAudioMuted) {
        videoIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      } else {
        videoIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleSave = () => {
    // Ensure username is not empty and different from current
    if (username && username.length > 0 && username !== currentUsername) {
      onUsernameChange(username);
    }
    onClose();
  };

  return (
    <div
      className={`
        absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_40%)]"></div>
      <div className={`new-settings-modal ${className}`}>
        <div className="relative w-full h-full rounded-[51px] p-[30px]">
          <button 
            className="absolute small-button dark-text-shadow-sm font-ptclean text-2xl w-[50px] h-[50px] top-[29px] left-[29px]"
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
            onKeyDown={handleKeyDown}
          />
          <NewButton size="md" className="absolute top-[158px] left-[353px]" onClick={handleSave}>Save</NewButton>
          <NewButton 
            size="lg" 
            className="absolute top-[253px] left-[270px]"
            onClick={toggleAudio}
          >
            {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          </NewButton>
          <NewButton 
            size="lg" 
            className="absolute top-[253px] left-[43px]"
            onClick={toggleVideo}
          >
            {isVideoPlaying ? 'Pause Video' : 'Play Video'}
          </NewButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;