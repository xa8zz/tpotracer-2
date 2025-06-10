import React from 'react';
import logo from '../assets/logosm.png';

const Credits: React.FC = () => {
  return (
    <>
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[100px] font-ptclean text-lg text-white leading-[14px] p-2"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)'
        }}
      >
        <div className="relative w-full h-full flex flex-col justify-end items-start">
          <img src={logo} alt="tpotracer logo" className="w-[200px]" />
          <div className="special-p-container">
            <p className="absolute left-[190px] bottom-[34px] special-p">by <a href="https://x.com/marcusquest" target="_blank" rel="noopener noreferrer" className="underline">@marcusquest</a> & <a href="https://x.com/valofpszz" target="_blank" rel="noopener noreferrer" className="underline">@valofpszz</a></p>
            <p className="absolute left-[155px] bottom-[18px] special-p">bg: <a href="https://www.youtube.com/watch?v=zyRSaVtEzZ4" target="_blank" rel="noopener noreferrer" className="underline">integra - 2alora</a></p>
            <p className="absolute left-[120px] bottom-[2px] special-p">font: <a href="https://github.com/bluescan/proggyfonts" target="_blank" rel="noopener noreferrer" className="underline">proggy clean</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Credits;
