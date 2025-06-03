import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsProps {
  currentUsername: string;
  className?: string;
}

const Settings: React.FC<SettingsProps> = ({ 
  currentUsername,
  className
}) => {
  const [username, setUsername] = useState(currentUsername);

  return (
    <div className={`${className}`}>
      poop
    </div>
  );
};

export default Settings;