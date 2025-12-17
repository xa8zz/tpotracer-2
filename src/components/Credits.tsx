import React from 'react';
import logo from '../assets/logosm.png';

interface CreditsProps {
  usernameModalVisible?: boolean;
}

const Credits: React.FC<CreditsProps> = ({ usernameModalVisible }) => {
  return (
    <>
      <div
        className={`absolute bottom-0 left-0 w-[600px] h-[100px] font-ptclean text-lg text-white leading-[14px] p-2 ${usernameModalVisible ? 'hide-logo' : ''}`}
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)'
        }}
      >
        <div className="relative w-full h-full flex flex-col justify-end items-start">
          <img src={logo} alt="tpotracer logo" className={`w-[200px] transition-opacity duration-300 ease-in-out ${usernameModalVisible ? 'opacity-0' : 'opacity-100'}`} />
          <div className="special-p-container">
            <p className={`absolute bottom-[34px] special-p transition-all duration-300 ease-in-out ${usernameModalVisible ? 'left-[4px]' : 'left-[190px]'}`}>by <a href="https://x.com/marcusquest" target="_blank" rel="noopener noreferrer" className="underline">@marcusquest</a> & <a href="https://x.com/sensho" target="_blank" rel="noopener noreferrer" className="underline">@sensho</a></p>
            <p className={`absolute bottom-[18px] special-p transition-all duration-300 ease-in-out ${usernameModalVisible ? 'left-[4px]' : 'left-[155px]'}`}>bg: <a href="https://www.youtube.com/watch?v=zyRSaVtEzZ4" target="_blank" rel="noopener noreferrer" className="underline">integra - 2alora</a></p>
            <p className={`absolute bottom-[2px] special-p transition-all duration-300 ease-in-out ${usernameModalVisible ? 'left-[4px]' : 'left-[120px]'}`}>font: <a href="https://github.com/bluescan/proggyfonts" target="_blank" rel="noopener noreferrer" className="underline">proggy clean</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Credits;
