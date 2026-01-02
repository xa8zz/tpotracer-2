import React from 'react';
import { useButtonSound } from '../hooks/useButtonSound';

interface NewButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  size?: 'md' | 'lg' | 'circle';
  style?: React.CSSProperties;
}

const NewButton: React.FC<NewButtonProps> = ({
  onClick,
  className = '',
  children,
  size,
  style
}) => {
  const { playBtnDown, playBtnUp } = useButtonSound();

  return (
    <button
      onClick={onClick}
      onMouseDown={playBtnDown}
      onMouseUp={playBtnUp}
      className={`font-ptclean text-2xl ${size ? `new-button-${size}` : 'new-button'} text-tpotracer-300 ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default NewButton;
