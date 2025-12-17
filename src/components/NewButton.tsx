import React from 'react';

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
  return (
    <button
      onClick={onClick}
      className={`font-ptclean text-2xl ${size ? `new-button-${size}` : 'new-button'} text-tpotracer-300 ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default NewButton;
