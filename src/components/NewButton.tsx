import React, { useRef } from 'react';
import { ButtonSize } from '../hooks/useButtonSound';
import { useClickSound } from '../hooks/useClickSound';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pitchSize = sizeToButtonSize(size);

  // Attach low-latency sound listeners
  useClickSound(buttonRef, pitchSize);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`font-ptclean text-2xl ${size ? `new-button-${size}` : 'new-button'} text-tpotracer-300 ${className}`}
      style={style}
    >
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default NewButton;
