import React, { useEffect } from 'react';
import NewButton from './NewButton';
import logo from '../assets/logosm.png';

interface HelpModalProps {
  visible: boolean;
  className?: string;
  onClose: () => void;
}

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
        absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={onClose}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_70%)]"></div>
      <div
        className={`help-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full rounded-[51px] p-[30px]">
          <NewButton
            size="circle"
            className="absolute top-[30px] left-[29px] dark-text-shadow-sm"
            onClick={onClose}
          >
            x
          </NewButton>
          <span
            className="absolute top-[121px] left-[40px] text-4xl font-ptclean text-white"
            style={{ textShadow: '0 0 1px #fff' }}
          >
            Instructions
          </span>
          <div className="instructions-text absolute font-ptclean text-2xl dark-text-shadow text-tpotracer-400 left-[40px] right-[30px] top-[184px] leading-[1]">
            <p>tpotracer is a 1-week speed typing challenge for X (Twitter) users. Your goal is to climb to the top of the leaderboard.</p>
            <br />
            <p>Enter your X username, then type the 10 displayed words as quickly as possible.</p>
            <br />
            <p>Don't correct any errors; Accuracy (ACC) and Raw Speed (RAW) are factored into your final WPM (Words Per Minute) score.</p>
            <br />
            <p>Only your highest score is considered in the leaderboard.</p>
          </div>
          <span
            className="absolute top-[558px] left-[40px] text-4xl font-ptclean text-white"
            style={{ textShadow: '0 0 1px #fff' }}
          >
          Found a bug?
          </span>
          <div className="instructions-text absolute font-ptclean text-2xl dark-text-shadow text-tpotracer-400 left-[40px] right-[30px] top-[620px] leading-[1]">
            Reach out to <a
              href="https://x.com/marcusquest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >@marcusquest</a> or <a
              href="https://x.com/valofpszz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >@valofpszz</a> on X!
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 