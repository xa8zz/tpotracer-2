import React, { useEffect } from 'react';
import NewButton from './NewButton';

interface HelpModalProps {
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

const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  className,
  onClose
}) => {
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
        modal-overlay absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={onClose}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_70%)]"></div>
      <div
        className={`help-modal ${className}`}
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
          <span
            className="absolute font-ptclean text-white"
            style={{ 
              top: pctH(121),
              left: pctW(40),
              fontSize: cqw(36), // text-4xl approx 36px
              textShadow: '0 0 1px #fff',
              lineHeight: 1,
            }}
          >
            Instructions
          </span>
          <div 
            className="instructions-text absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(184),
              left: pctW(40),
              right: pctW(30),
              fontSize: cqw(24), // text-2xl approx 24px
              lineHeight: 1.1,
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
              top: pctH(558),
              left: pctW(40),
              fontSize: cqw(36), // text-4xl
              textShadow: '0 0 1px #fff',
              lineHeight: 1,
            }}
          >
          Found a bug?
          </span>
          <div 
            className="instructions-text absolute font-ptclean dark-text-shadow text-tpotracer-400"
            style={{
              top: pctH(620),
              left: pctW(40),
              right: pctW(30),
              fontSize: cqw(24), // text-2xl
              lineHeight: 1.1,
            }}
          >
            Reach out to <a
              href="https://x.com/marcusquest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >@marcusquest</a> or <a
              href="https://x.com/sensho"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >@sensho</a> on X!
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
