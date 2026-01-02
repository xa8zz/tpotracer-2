import { useCallback, useEffect, useRef } from 'react';
import btnDownSound from '../assets/sound/btndown.wav';
import btnUpSound from '../assets/sound/btnup.wav';
import { isSfxEnabled, getButtonVolume } from '../utils/settingsService';

// Button size type: -1 = small, 0 = medium, 1 = large
export type ButtonSize = -1 | 0 | 1;

/**
 * Calculate pitch based on button size and random factor
 * pitch = 1 + 0.02r + 0.06s
 * where s is size (-1, 0, 1) and r is random [0, 1]
 */
const calculatePitch = (size: ButtonSize): number => {
  const r = Math.random();
  return 1 + 0.07 * r - 0.06 * size;
};

export const useButtonSound = () => {
  const audioDownRef = useRef<HTMLAudioElement | null>(null);
  const audioUpRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioDownRef.current = new Audio(btnDownSound);
    audioDownRef.current.preservesPitch = false; // Allow pitch to change with playbackRate
    
    audioUpRef.current = new Audio(btnUpSound);
    audioUpRef.current.preservesPitch = false;
  }, []);

  const playBtnDown = useCallback((size: ButtonSize = 0) => {
    if (!isSfxEnabled() || !audioDownRef.current) return;
    audioDownRef.current.volume = getButtonVolume();
    audioDownRef.current.playbackRate = calculatePitch(size);
    audioDownRef.current.currentTime = 0;
    audioDownRef.current.play().catch(() => {
      // Ignore play errors (e.g. user hasn't interacted with document yet)
    });
  }, []);

  const playBtnUp = useCallback((size: ButtonSize = 0) => {
    if (!isSfxEnabled() || !audioUpRef.current) return;
    audioUpRef.current.volume = getButtonVolume();
    audioUpRef.current.playbackRate = calculatePitch(size);
    audioUpRef.current.currentTime = 0;
    audioUpRef.current.play().catch(() => {
      // Ignore play errors
    });
  }, []);

  return { playBtnDown, playBtnUp };
};

