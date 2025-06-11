import React, { useState, useEffect } from 'react';
import NewButton from './NewButton';

interface UsernameModalProps {
  currentUsername: string;
  visible: boolean;
  className?: string;
  onUsernameChange: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({
  currentUsername,
  visible,
  className,
  onUsernameChange
}) => {
  const [username, setUsername] = useState(currentUsername);

  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
    }
  }, [visible, currentUsername]);

  const sanitizedSetUsername = (input: string) => {
    // Remove @ symbols and trim, then filter to only alphanumeric and underscore
    const cleaned = input.replace(/^@+/, '').trim();
    const filtered = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
    // Limit to 20 characters max
    const limited = filtered.slice(0, 20);
    setUsername(limited);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const newValue = currentValue.slice(0, -1);
      sanitizedSetUsername(newValue);
    }
  };

  const handleSave = () => {
    // Ensure username is not empty
    if (username && username.length > 0) {
      onUsernameChange(username);
    }
  };

  return (
    <div
      className={`
        absolute inset-0 w-screen h-screen
        transition-all duration-[0.2s] ease-out
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    >
      <div className="absolute inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_40%)]"></div>
      <div className={`username-modal ${className}`}>
        <div className="relative w-full h-full rounded-[51px] p-[30px]">
          <span 
            className="absolute top-[110px] left-[50px] font-ptclean dark-text-shadow text-tpotracer-400 text-2xl"
          >
            What is your X username?
          </span>
          <span 
            className="absolute top-[166px] left-[58px] font-ptclean dark-text-shadow text-tpotracer-400 text-3xl opacity-30"
          >
            @
          </span>
          <input 
            type="text"
            className="absolute top-[162px] left-[46px] h-[42px] w-[285px] p-0 pl-[30px] rounded-[500px] font-ptclean dark-text-shadow text-2xl bg-transparent text-tpotracer-400 text-2xl"
            value={username}
            onChange={(e) => sanitizedSetUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <NewButton size="md" className="absolute top-[158px] left-[353px]" onClick={handleSave}>Save</NewButton>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
