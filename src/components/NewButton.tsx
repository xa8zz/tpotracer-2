import React from 'react';

interface NewButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const NewButton: React.FC<NewButtonProps> = ({
  onClick,
  className = '',
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-[167px] h-[49px] font-ptclean text-2xl new-button text-tpotracer-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default NewButton;
