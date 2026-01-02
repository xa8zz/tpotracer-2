import React, { useEffect, useState } from 'react';
import NewButton from './NewButton';
import {
  isAnimationEnabled,
  setAnimationEnabled,
  isConfettiEnabled,
  setConfettiEnabled,
  isSfxEnabled,
  setSfxEnabled,
  getKeypressVolume,
  setKeypressVolume,
  getGameCompleteVolume,
  setGameCompleteVolume,
  getButtonVolume,
  setButtonVolume,
  getMusicVolume,
  setMusicVolume,
} from '../utils/settingsService';

interface AdvancedSettingsProps {
  visible: boolean;
  className?: string;
  onClose: () => void;
}

// Dimensions constants
const MODAL_WIDTH = 628;
const MODAL_HEIGHT = 769;
const GAME_CONTAINER_HEIGHT = 806;
const GAME_CONTAINER_VH = 80;

// Helper to calculate percentage
const pct = (val: number, total: number) => `${(val / total) * 100}%`;
const pctW = (val: number) => pct(val, MODAL_WIDTH);
const pctH = (val: number) => pct(val, MODAL_HEIGHT);
const cqw = (val: number) => `${(val / MODAL_WIDTH) * 100}cqw`;

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  visible,
  className,
  onClose
}) => {
  // Settings state
  const [animationOn, setAnimationOn] = useState(isAnimationEnabled);
  const [confettiOn, setConfettiOn] = useState(isConfettiEnabled);
  const [sfxOn, setSfxOn] = useState(isSfxEnabled);
  const [keypressVol, setKeypressVol] = useState(getKeypressVolume);
  const [gameCompleteVol, setGameCompleteVol] = useState(getGameCompleteVolume);
  const [buttonVol, setButtonVol] = useState(getButtonVolume);
  const [musicVol, setMusicVol] = useState(getMusicVolume);

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

  return (
    <div
      className={`
        absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={onClose}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_40%)]"></div>
      <div
        className={`advanced-settings-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
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
            className="absolute dark-text-shadow-sm"
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
            } as React.CSSProperties}
          >
            x
          </NewButton>
          <div 
            className="absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(114),
              left: pctW(40),
              right: pctW(32),
              fontSize: cqw(24),
              lineHeight: 1.1
            }}
          >
            <p>This modal is still under development.</p>
            <br />
            <p>Note: to disable the ghost, use the ghost icon in the game screen.</p>
          </div>
          <div 
            className="absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(234),
              left: pctW(40),
              right: pctW(32),
              fontSize: cqw(24),
              lineHeight: 1.1
            }}
          >
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={animationOn}
                  onChange={(e) => {
                    setAnimationOn(e.target.checked);
                    setAnimationEnabled(e.target.checked);
                  }}
                />
                {' '}Animation Enabled
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={confettiOn}
                  onChange={(e) => {
                    setConfettiOn(e.target.checked);
                    setConfettiEnabled(e.target.checked);
                  }}
                />
                {' '}Confetti Enabled
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={sfxOn}
                  onChange={(e) => {
                    setSfxOn(e.target.checked);
                    setSfxEnabled(e.target.checked);
                  }}
                />
                {' '}SFX Enabled
              </label>
            </div>
            <div style={{ marginLeft: 20, opacity: sfxOn ? 1 : 0.5, pointerEvents: sfxOn ? 'auto' : 'none' }}>
              <div>
                <label>
                  Keypress Volume: {keypressVol.toFixed(2)}
                  <br />
                  <input
                    type="range"
                    min={0}
                    max={0.5}
                    step={0.01}
                    value={keypressVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setKeypressVol(val);
                      setKeypressVolume(val);
                    }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Game Complete Volume: {gameCompleteVol.toFixed(2)}
                  <br />
                  <input
                    type="range"
                    min={0}
                    max={0.1}
                    step={0.01}
                    value={gameCompleteVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGameCompleteVol(val);
                      setGameCompleteVolume(val);
                    }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Button Click Volume: {buttonVol.toFixed(2)}
                  <br />
                  <input
                    type="range"
                    min={0}
                    max={0.5}
                    step={0.01}
                    value={buttonVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setButtonVol(val);
                      setButtonVolume(val);
                    }}
                  />
                </label>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label>
                Music Volume: {musicVol.toFixed(2)}
                <br />
                <input
                  type="range"
                  min={0}
                  max={0.13}
                  step={0.01}
                  value={musicVol}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMusicVol(val);
                    setMusicVolume(val);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;

