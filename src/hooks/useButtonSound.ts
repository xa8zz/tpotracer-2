import { useCallback } from 'react';
import { Howl } from 'howler';
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

  // the larger buttons arent that much bigger, so make it 0.5 instead of 1
  const bruhSize: number = size === 1 ? 0.5 : size;

  return 1 + 0.07 * r - 0.11 * bruhSize;
};

// Create Howl instances once to ensure preloading
// Using Web Audio API (via Howler) provides much lower latency than HTML5 Audio
const audioDown = new Howl({
  src: [btnDownSound],
  preload: true,
  volume: 1.0,
});

const audioUp = new Howl({
  src: [btnUpSound],
  preload: true,
  volume: 1.0,
});

export const useButtonSound = () => {
  const playBtnDown = useCallback((size: ButtonSize = 0) => {
    if (!isSfxEnabled()) return;
    
    // Play immediately - Howler handles concurrency/overlap automatically
    const id = audioDown.play();
    audioDown.volume(getButtonVolume(), id);
    audioDown.rate(calculatePitch(size), id);
  }, []);

  const playBtnUp = useCallback((size: ButtonSize = 0) => {
    if (!isSfxEnabled()) return;
    
    const id = audioUp.play();
    audioUp.volume(getButtonVolume(), id);
    audioUp.rate(calculatePitch(size), id);
  }, []);

  return { playBtnDown, playBtnUp };
};

