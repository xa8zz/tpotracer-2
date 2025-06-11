import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  username: string | null;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username, className }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (username) {
      setLoaded(false);
      const img = new Image();
      img.src = `https://unavatar.io/x/${username}`;
      img.onload = () => {
        setLoaded(true);
      };
    }
  }, [username]);

  const avatarUrl = username ? `url(https://unavatar.io/x/${username})` : 'none';

  return (
    <span
      className={`user-avatar ${className || ''} ${loaded ? 'avatar-loaded' : ''}`}
      style={{ '--avatar-url': avatarUrl } as React.CSSProperties}
    ></span>
  );
};

export default UserAvatar; 