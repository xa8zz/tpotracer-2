import { useCallback, useEffect, useRef } from 'react';
import btnDownSound from '../assets/sound/btndown.wav';
import btnUpSound from '../assets/sound/btnup.wav';

export const useButtonSound = () => {
  const audioDownRef = useRef<HTMLAudioElement | null>(null);
  const audioUpRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioDownRef.current = new Audio(btnDownSound);
    audioUpRef.current = new Audio(btnUpSound);
    audioDownRef.current.volume = 0.5; // Adjust volume if needed, usually 0.5-1.0
    audioUpRef.current.volume = 0.5;
  }, []);

  const playBtnDown = useCallback(() => {
    if (audioDownRef.current) {
      audioDownRef.current.currentTime = 0;
      audioDownRef.current.play().catch(() => {
        // Ignore play errors (e.g. user hasn't interacted with document yet)
      });
    }
  }, []);

  const playBtnUp = useCallback(() => {
    if (audioUpRef.current) {
      audioUpRef.current.currentTime = 0;
      audioUpRef.current.play().catch(() => {
        // Ignore play errors
      });
    }
  }, []);

  return { playBtnDown, playBtnUp };
};

