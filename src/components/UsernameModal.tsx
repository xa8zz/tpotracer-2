import React, { useState, useEffect } from 'react';
import { animated } from '@react-spring/web';
import NewButton from './NewButton';
import logo from '../assets/logosm.png';
import { useBackgroundSpring } from '../hooks/useBackgroundSpring';

interface UsernameModalProps {
  currentUsername: string;
  visible: boolean;
  className?: string;
  style?: any;
  onUsernameChange: (username: string) => void;
}

// Dimensions constants
const MODAL_WIDTH = 628;
const MODAL_HEIGHT = 781;
const GAME_CONTAINER_HEIGHT = 806;
const GAME_CONTAINER_VH = 80;

// Helper to calculate percentage
const pct = (val: number, total: number) => `${(val / total) * 100}%`;
const pctW = (val: number) => pct(val, MODAL_WIDTH);
const pctH = (val: number) => pct(val, MODAL_HEIGHT);
const cqw = (val: number) => `${(val / MODAL_WIDTH) * 100}cqw`;

const UsernameModal: React.FC<UsernameModalProps> = ({
  currentUsername,
  visible,
  className,
  style,
  onUsernameChange
}) => {
  const [username, setUsername] = useState(currentUsername);
  // intent='modal', skipEnter=true, preserveCenter=true
  const { styles: modalStyles } = useBackgroundSpring(!visible, 'modal', false, true, true);

  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
    }
  }, [visible, currentUsername]);

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

  const handleSave = () => {
    // Ensure username is not empty
    if (username && username.length > 0) {
      onUsernameChange(username);
    }
  };

  return (
    <div
      className={`
        modal-overlay absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_70%)]"></div>
      <animated.div 
        className={`username-modal ${className}`}
        style={{
          height: `calc(${GAME_CONTAINER_VH}vh * ${MODAL_HEIGHT} / ${GAME_CONTAINER_HEIGHT})`,
          width: 'auto',
          aspectRatio: `${MODAL_WIDTH} / ${MODAL_HEIGHT}`,
          backgroundSize: '100% 100%',
          containerType: 'size',
          ...style,
          ...(visible ? {} : modalStyles)
        }}
      >
        <div className="relative w-full h-full">
          <img 
            src={logo} 
            alt="tpotracer logo"
            className="absolute"
            style={{
              top: pctH(-30),
              left: pctW(-25),
              height: pctH(120),
              width: 'auto',
            }}
          />
          <span
            className="absolute font-ptclean text-white"
            style={{ 
              top: pctH(121),
              left: pctW(40),
              fontSize: cqw(36), // text-4xl
              textShadow: '0 0 1px #fff',
              lineHeight: 1,
            }}
          >
            Instructions
          </span>
          <div 
            className="instructions-text absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(178),
              left: pctW(40),
              right: pctW(30),
              fontSize: cqw(24), // text-2xl
              lineHeight: 1,
            }}
          >
          <p>tpotracer is a 1-week speed typing competition for X (Twitter) users. Your goal is to climb to the top of the leaderboard.</p>
          <br />
          <p>Enter your X username, then type the 10 displayed words as quickly as possible.</p>
          <br />
          <p>Don't correct any errors; Accuracy (ACC) and Raw Speed (RAW) are factored into your final WPM (Words Per Minute) score.</p>
          <br />
          <p>Only your highest score is considered in the leaderboard.</p>
          </div>
          <span
            className="absolute font-ptclean text-white"
            style={{ 
              top: pctH(522),
              left: pctW(40),
              fontSize: cqw(36), // text-4xl
              textShadow: '0 0 1px #fff',
              lineHeight: 1,
            }}
          >
            Ready to play?
          </span>
          <span 
            className="absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(581),
              left: pctW(40),
              fontSize: cqw(24), // text-2xl
              lineHeight: 1,
            }}
          >
            Enter your X username below.
          </span>
          <span 
            className="absolute font-ptclean dark-text-shadow text-tpotracer-400 opacity-30"
            style={{
              top: pctH(642), // 635 + 7 offset as requested
              left: pctW(53),
              fontSize: cqw(30), // text-3xl
              lineHeight: 1,
            }}
          >
            @
          </span>
          <input 
            type="text"
            className="absolute p-0 rounded-[500px] font-ptclean dark-text-shadow bg-transparent text-tpotracer-400"
            value={username}
            onChange={(e) => sanitizedSetUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={15}
            style={{
              top: pctH(635),
              left: pctW(41),
              height: pctH(42),
              width: pctW(285),
              paddingLeft: pctW(30),
              fontSize: cqw(24),
              lineHeight: 1,
            }}
          />
          <NewButton 
            size="md" 
            className="absolute" 
            onClick={handleSave}
            style={{
              top: pctH(631),
              left: pctW(347),
              width: pctW(117), // Using pctW(117) to scale proportionally with container width
              height: pctH(49),
              '--btn-font-size': cqw(24),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            } as React.CSSProperties}
          >
            Save
          </NewButton>
        </div>
      </animated.div>
    </div>
  );
};

export default UsernameModal;
