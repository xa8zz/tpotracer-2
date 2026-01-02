import React, { useState, useEffect } from 'react';
import NewButton from './NewButton';
import { 
  isMusicMuted, 
  setMusicMuted, 
  isVideoPlaying as isVideoPlayingService, 
  setVideoPlaying 
} from '../utils/settingsService';

interface SettingsProps {
  currentUsername: string;
  visible: boolean;
  className?: string;
  onClose: () => void;
  onUsernameChange: (username: string) => void;
  onOpenAdvancedSettings: () => void;
}

// Dimensions constants
const MODAL_WIDTH = 509;
const MODAL_HEIGHT = 403;
const GAME_CONTAINER_HEIGHT = 806;
const GAME_CONTAINER_VH = 80;

// Helper to calculate percentage
const pct = (val: number, total: number) => `${(val / total) * 100}%`;
const pctW = (val: number) => pct(val, MODAL_WIDTH);
const pctH = (val: number) => pct(val, MODAL_HEIGHT);
const cqw = (val: number) => `${(val / MODAL_WIDTH) * 100}cqw`;

// Shadow helper functions for text (matching NewGameScreen.tsx)
const darkTextShadow = (size: number, height: number) => 
  `0 0 ${(size * 0.8 / height) * 100}cqh #02182D`;
const darkTextShadowLight = (size: number, height: number) => 
  `0 0 ${(size * 0.5 / height) * 100}cqh #02182D`;

const Settings: React.FC<SettingsProps> = ({
  currentUsername,
  visible,
  className,
  onClose,
  onUsernameChange,
  onOpenAdvancedSettings
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isVideoPlaying, setIsVideoPlaying] = useState(isVideoPlayingService());
  const [isMuted, setIsMuted] = useState(isMusicMuted());

  // Reset username to current when modal opens and sync video state
  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
      setIsMuted(isMusicMuted());
      setIsVideoPlaying(isVideoPlayingService());
    }
  }, [visible, currentUsername]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
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
    // Limit to 15 characters max
    const limited = filtered.slice(0, 15);
    setUsername(limited);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const newValue = currentValue.slice(0, -1);
      sanitizedSetUsername(newValue);
    }
  };

  const toggleVideo = () => {
    const newState = !isVideoPlaying;
    setVideoPlaying(newState);
    setIsVideoPlaying(newState);
  };

  const toggleMusic = () => {
    const newState = !isMuted;
    setMusicMuted(newState);
    setIsMuted(newState);
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
        modal-overlay absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={onClose}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_20%)]"></div>
      <div
        className={`new-settings-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          // Calculate height proportional to the game container's 80vh
          height: `calc(${GAME_CONTAINER_VH}vh * ${MODAL_HEIGHT} / ${GAME_CONTAINER_HEIGHT})`,
          width: 'auto',
          aspectRatio: `${MODAL_WIDTH} / ${MODAL_HEIGHT}`,
          backgroundSize: '100% 100%',
          containerType: 'size',
        }}
      >
        <div className="relative w-full h-full">
          <NewButton
            size="circle"
            className="absolute"
            onClick={onClose}
            style={{
              top: pctH(30),
              left: pctW(29),
              width: pctW(49),
              height: pctH(49),
              '--btn-font-size': cqw(24),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              textShadow: darkTextShadow(2, MODAL_HEIGHT),
            } as React.CSSProperties}
          >
            x
          </NewButton>
          <span 
            className="absolute font-ptclean text-tpotracer-400 underline cursor-pointer hover:opacity-80"
            onClick={onOpenAdvancedSettings}
            style={{
              top: pctH(110),
              left: pctW(50),
              fontSize: cqw(24),
              lineHeight: 1,
              textShadow: darkTextShadowLight(2, MODAL_HEIGHT),
            }}
          >
            Advanced Settings &gt;
          </span>
          <span 
            className="absolute font-ptclean text-tpotracer-400 opacity-30"
            style={{
              top: pctH(169),
              left: pctW(58),
              fontSize: cqw(30),
              lineHeight: 1,
              textShadow: darkTextShadowLight(2, MODAL_HEIGHT),
            }}
          >
            @
          </span>
          <input 
            type="text"
            className="absolute p-0 rounded-[500px] font-ptclean bg-transparent text-tpotracer-400"
            maxLength={15}
            value={username}
            onChange={(e) => sanitizedSetUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              top: pctH(162),
              left: pctW(46),
              height: pctH(42),
              width: pctW(285),
              paddingLeft: pctW(30),
              fontSize: cqw(24),
              lineHeight: 1,
              textShadow: darkTextShadowLight(2, MODAL_HEIGHT),
            }}
          />
          <NewButton 
            size="md" 
            className="absolute" 
            onClick={handleSave}
            style={{
              top: pctH(158),
              left: pctW(353),
              width: pctW(117),
              height: pctH(49),
              '--btn-font-size': cqw(24),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              textShadow: darkTextShadow(2, MODAL_HEIGHT),
            } as React.CSSProperties}
          >
            Save
          </NewButton>
          <NewButton 
            size="lg" 
            className="absolute"
            onClick={toggleMusic}
            style={{
              top: pctH(253),
              left: pctW(270),
              width: pctW(199),
              height: pctH(49),
              '--btn-font-size': cqw(24),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              textShadow: darkTextShadow(2, MODAL_HEIGHT),
            } as React.CSSProperties}
          >
            {isMuted ? 'Unmute Music' : 'Mute Music'}
          </NewButton>
          <NewButton 
            size="lg" 
            className="absolute"
            onClick={toggleVideo}
            style={{
              top: pctH(253),
              left: pctW(43),
              width: pctW(199),
              height: pctH(49),
              '--btn-font-size': cqw(24),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              textShadow: darkTextShadow(2, MODAL_HEIGHT),
            } as React.CSSProperties}
          >
            {isVideoPlaying ? 'Pause Video' : 'Play Video'}
          </NewButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;
