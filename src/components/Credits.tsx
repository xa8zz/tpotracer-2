import React from 'react';
import logo from '../assets/logosm.png';

const Credits: React.FC = () => {
  return (
    <>
      <div className="absolute bottom-0 w-[300px] h-[300px] right-0 font-ptclean text-right text-lg text-white leading-[14px] p-2 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0)_50%)] flex flex-col justify-end items-end">
        <img src={logo} alt="tpotracer logo" className="w-[200px] inline mb-[4px]" />
        <div className="opacity-80 hover:opacity-100 transition-opacity duration-200">
        <p>by <a href="https://x.com/marcusquest" target="_blank" rel="noopener noreferrer" className="underline">@marcusquest</a> & <a href="https://x.com/valofpszz" target="_blank" rel="noopener noreferrer" className="underline">@valofpszz</a></p>
        <p>bg: <a href="https://www.youtube.com/watch?v=zyRSaVtEzZ4" target="_blank" rel="noopener noreferrer" className="underline">integra - 2alora</a></p>
        <p>font: <a href="https://github.com/bluescan/proggyfonts" target="_blank" rel="noopener noreferrer" className="underline">proggy clean</a></p>
        </div>
      </div>
    </>
  );
};

export default Credits;
