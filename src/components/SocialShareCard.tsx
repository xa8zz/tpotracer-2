import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SocialShareCardProps {
  username: string;
  wpm: number;
  position: number | null;
}

const SocialShareCard: React.FC<SocialShareCardProps> = ({ username, wpm, position }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      // First ensure all content is properly rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#1f2937',
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow images from different domains
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        // Capture the exact dimensions of the element
        onclone: (document, element) => {
          // Force fixed dimensions to ensure consistency
          const clone = element as HTMLElement;
          clone.style.width = `${cardRef.current!.offsetWidth}px`;
          clone.style.height = `${cardRef.current!.offsetHeight}px`;
          clone.style.overflow = 'hidden';
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tpotracer-${username}-${Math.round(wpm)}wpm.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="p-4 bg-gray-700 flex justify-between items-center">
        <h3 className="text-gray-200 font-mono font-bold">Share Your Score</h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Download as image"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>
      
      {/* Social share card content - this is the part that gets captured */}
      <div 
        ref={cardRef}
        className="p-6 flex flex-col items-center"
        style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: '#1f2937' }}
      >
        {/* Card header with attribution */}
        <div className="w-full text-center mb-6">
          <p className="text-gray-400 text-sm">
            tpotracer.com made by{' '}
            <a 
              href="https://x.com/marcusquest" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              @marcusquest
            </a>
            {' '}and{' '}
            <a 
              href="https://x.com/valofpszz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              @valofpszz
            </a>
          </p>
        </div>
        
        {/* Card logo/placeholder - fixed dimensions */}
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6">
          <span className="text-xl font-bold text-gray-300">TPO</span>
        </div>
        
        {/* User stats - with fixed spacing */}
        <div className="flex flex-col items-center mb-6">
          <div className="text-6xl font-bold text-blue-500 font-mono leading-none">
            {Math.round(wpm)}
          </div>
          <div className="text-gray-400 text-sm mt-2">WPM</div>
        </div>
        
        {/* Username and position - with fixed spacing */}
        <div className="flex flex-col items-center mt-2 w-full">
          <div className="text-xl font-bold text-gray-200 font-mono mb-3">@{username}</div>
          {position && (
            <div className="px-4 py-2 bg-gray-700 rounded-full text-sm text-gray-300 inline-block">
              #{position} on leaderboard
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialShareCard; 