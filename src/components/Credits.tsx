import React from 'react';
import logo from '../assets/logosm.png';

interface CreditsProps {
  usernameModalVisible?: boolean;
}

// Since Credits is overlaid on the screen but anchored to bottom-left,
// we'll use viewport units directly but scale proportional to the game container reference.
// Reference game container height: 806px -> 80vh
const REF_HEIGHT = 806;
const VH_SCALE = 80; // 80vh

// Helper to convert px to vh based on reference height
const vh = (px: number) => `calc(${px} / ${REF_HEIGHT} * ${VH_SCALE}vh)`;
// Helper to convert px to proportional width based on aspect ratio of container if needed,
// but here we might want to scale purely by height to keep aspect ratios of images/text consistent.
// Let's use vh for font sizes and dimensions to keep everything proportional to height.

const Credits: React.FC<CreditsProps> = ({ usernameModalVisible }) => {
  return (
    <>
      <div
        className={`absolute bottom-0 left-0 font-ptclean text-white p-2 ${usernameModalVisible ? 'hide-logo' : ''}`}
        style={{
          width: vh(600), // Scaled proportionally
          height: vh(100),
          fontSize: vh(18), // text-lg approx 18px
          lineHeight: vh(14),
          background: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)'
        }}
      >
        <div className="relative w-full h-full flex flex-col justify-end items-start">
          <img 
            src={logo} 
            alt="tpotracer logo" 
            className={`transition-opacity duration-300 ease-in-out ${usernameModalVisible ? 'opacity-0' : 'opacity-100'}`} 
            style={{ width: vh(200) }}
          />
          <div className="special-p-container">
            <p 
              className={`absolute special-p transition-all duration-300 ease-in-out`}
              style={{
                bottom: vh(2),
                left: usernameModalVisible ? vh(4) : vh(120)
              }}
            >
              v1.1 - by <a href="https://x.com/marcusquest" target="_blank" rel="noopener noreferrer" className="underline">@marcusquest</a>, <a href="https://x.com/sensho" target="_blank" rel="noopener noreferrer" className="underline">@sensho</a> - <a href="/leaderboard.html" target="_blank" rel="noopener noreferrer" className="underline">leaderboard</a> - <a href="/credits.html" target="_blank" rel="noopener noreferrer" className="underline">credits</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Credits;
