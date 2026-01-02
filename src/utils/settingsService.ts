/**
 * Settings Service for app-wide settings
 * Uses localStorage for persistence
 */

// Storage keys
const ANIMATION_ENABLED_KEY = 'tpotracer_animation_enabled';
const CONFETTI_ENABLED_KEY = 'tpotracer_confetti_enabled';
const SFX_ENABLED_KEY = 'tpotracer_sfx_enabled';
const KEYPRESS_VOLUME_KEY = 'tpotracer_keypress_volume';
const GAME_COMPLETE_VOLUME_KEY = 'tpotracer_game_complete_volume';
const BUTTON_VOLUME_KEY = 'tpotracer_button_volume';

// Defaults
const DEFAULT_ANIMATION_ENABLED = true;
const DEFAULT_CONFETTI_ENABLED = true;
const DEFAULT_SFX_ENABLED = true;
const DEFAULT_KEYPRESS_VOLUME = 0.5;
const DEFAULT_GAME_COMPLETE_VOLUME = 0.1;
const DEFAULT_BUTTON_VOLUME = 0.5;

// In-memory cache
let animationEnabled = DEFAULT_ANIMATION_ENABLED;
let confettiEnabled = DEFAULT_CONFETTI_ENABLED;
let sfxEnabled = DEFAULT_SFX_ENABLED;
let keypressVolume = DEFAULT_KEYPRESS_VOLUME;
let gameCompleteVolume = DEFAULT_GAME_COMPLETE_VOLUME;
let buttonVolume = DEFAULT_BUTTON_VOLUME;

// Load settings from localStorage
const loadFromStorage = () => {
  const stored = {
    animation: localStorage.getItem(ANIMATION_ENABLED_KEY),
    confetti: localStorage.getItem(CONFETTI_ENABLED_KEY),
    sfx: localStorage.getItem(SFX_ENABLED_KEY),
    keypress: localStorage.getItem(KEYPRESS_VOLUME_KEY),
    gameComplete: localStorage.getItem(GAME_COMPLETE_VOLUME_KEY),
    button: localStorage.getItem(BUTTON_VOLUME_KEY),
  };

  if (stored.animation !== null) animationEnabled = stored.animation === 'true';
  if (stored.confetti !== null) confettiEnabled = stored.confetti === 'true';
  if (stored.sfx !== null) sfxEnabled = stored.sfx === 'true';
  if (stored.keypress !== null) keypressVolume = parseFloat(stored.keypress);
  if (stored.gameComplete !== null) gameCompleteVolume = parseFloat(stored.gameComplete);
  if (stored.button !== null) buttonVolume = parseFloat(stored.button);
};

// Initialize on module load
loadFromStorage();

// Animation
export const isAnimationEnabled = (): boolean => animationEnabled;
export const setAnimationEnabled = (enabled: boolean): void => {
  animationEnabled = enabled;
  localStorage.setItem(ANIMATION_ENABLED_KEY, enabled.toString());
};

// Confetti
export const isConfettiEnabled = (): boolean => confettiEnabled;
export const setConfettiEnabled = (enabled: boolean): void => {
  confettiEnabled = enabled;
  localStorage.setItem(CONFETTI_ENABLED_KEY, enabled.toString());
};

// SFX Master Toggle
export const isSfxEnabled = (): boolean => sfxEnabled;
export const setSfxEnabled = (enabled: boolean): void => {
  sfxEnabled = enabled;
  localStorage.setItem(SFX_ENABLED_KEY, enabled.toString());
};

// Keypress Volume
export const getKeypressVolume = (): number => keypressVolume;
export const setKeypressVolume = (volume: number): void => {
  keypressVolume = Math.max(0, Math.min(0.5, volume));
  localStorage.setItem(KEYPRESS_VOLUME_KEY, keypressVolume.toString());
};

// Game Complete Volume
export const getGameCompleteVolume = (): number => gameCompleteVolume;
export const setGameCompleteVolume = (volume: number): void => {
  gameCompleteVolume = Math.max(0, Math.min(0.1, volume));
  localStorage.setItem(GAME_COMPLETE_VOLUME_KEY, gameCompleteVolume.toString());
};

// Button Volume
export const getButtonVolume = (): number => buttonVolume;
export const setButtonVolume = (volume: number): void => {
  buttonVolume = Math.max(0, Math.min(0.5, volume));
  localStorage.setItem(BUTTON_VOLUME_KEY, buttonVolume.toString());
};

