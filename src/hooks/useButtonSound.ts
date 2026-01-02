import { useCallback, useEffect, useRef } from 'react';
import btnDownSound from '../assets/sound/btndown.wav';
import btnUpSound from '../assets/sound/btnup.wav';
import { isSfxEnabled, getButtonVolume } from '../utils/settingsService';

export const useButtonSound = () => {
  const audioDownRef = useRef<HTMLAudioElement | null>(null);
  const audioUpRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioDownRef.current = new Audio(btnDownSound);
    audioUpRef.current = new Audio(btnUpSound);
  }, []);

  const playBtnDown = useCallback(() => {
    if (!isSfxEnabled() || !audioDownRef.current) return;
    audioDownRef.current.volume = getButtonVolume();
    audioDownRef.current.currentTime = 0;
    audioDownRef.current.play().catch(() => {
      // Ignore play errors (e.g. user hasn't interacted with document yet)
    });
  }, []);

  const playBtnUp = useCallback(() => {
    if (!isSfxEnabled() || !audioUpRef.current) return;
    audioUpRef.current.volume = getButtonVolume();
    audioUpRef.current.currentTime = 0;
    audioUpRef.current.play().catch(() => {
      // Ignore play errors
    });
  }, []);

  return { playBtnDown, playBtnUp };
};

