import React from 'react';
import { useButtonSound, ButtonSize } from '../hooks/useButtonSound';

interface NewButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'circle';
  style?: React.CSSProperties;
}

// Map string size to numeric pitch size: -1 = small, 0 = medium, 1 = large
const sizeToButtonSize = (size?: 'sm' | 'md' | 'lg' | 'circle'): ButtonSize => {
  switch (size) {
    case 'sm':
    case 'circle':
      return -1;
    case 'lg':
      return 1;
    default:
      return 0;
  }
};

const NewButton: React.FC<NewButtonProps> = ({
  onClick,
  className = '',
  children,
  size,
  style
}) => {
  const { playBtnDown, playBtnUp } = useButtonSound();
  const pitchSize = sizeToButtonSize(size);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => playBtnDown(pitchSize)}
      onMouseUp={() => playBtnUp(pitchSize)}
      className={`font-ptclean text-2xl ${size ? `new-button-${size}` : 'new-button'} text-tpotracer-300 ${className}`}
      style={style}
    >
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default NewButton;
