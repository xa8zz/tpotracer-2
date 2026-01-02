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
const MUSIC_VOLUME_KEY = 'tpotracer_music_volume';
const MUSIC_MUTED_KEY = 'tpotracer_music_muted';
const VIDEO_PLAYING_KEY = 'tpotracer_video_playing';

// Defaults
export const DEFAULT_ANIMATION_ENABLED = true;
export const DEFAULT_CONFETTI_ENABLED = true;
export const DEFAULT_SFX_ENABLED = true;
export const DEFAULT_KEYPRESS_VOLUME = 0.5;
export const DEFAULT_GAME_COMPLETE_VOLUME = 0.1;
export const DEFAULT_BUTTON_VOLUME = 0.6;
export const DEFAULT_MUSIC_VOLUME = 0.01;
export const MAX_MUSIC_VOLUME = 0.13;
export const DEFAULT_MUSIC_MUTED = false;
export const DEFAULT_VIDEO_PLAYING = true;

// In-memory cache
let animationEnabled = DEFAULT_ANIMATION_ENABLED;
let confettiEnabled = DEFAULT_CONFETTI_ENABLED;
let sfxEnabled = DEFAULT_SFX_ENABLED;
let keypressVolume = DEFAULT_KEYPRESS_VOLUME;
let gameCompleteVolume = DEFAULT_GAME_COMPLETE_VOLUME;
let buttonVolume = DEFAULT_BUTTON_VOLUME;
let musicVolume = DEFAULT_MUSIC_VOLUME;
let musicMuted = DEFAULT_MUSIC_MUTED;
let videoPlaying = DEFAULT_VIDEO_PLAYING;

// Load settings from localStorage
const loadFromStorage = () => {
  const stored = {
    animation: localStorage.getItem(ANIMATION_ENABLED_KEY),
    confetti: localStorage.getItem(CONFETTI_ENABLED_KEY),
    sfx: localStorage.getItem(SFX_ENABLED_KEY),
    keypress: localStorage.getItem(KEYPRESS_VOLUME_KEY),
    gameComplete: localStorage.getItem(GAME_COMPLETE_VOLUME_KEY),
    button: localStorage.getItem(BUTTON_VOLUME_KEY),
    music: localStorage.getItem(MUSIC_VOLUME_KEY),
    musicMuted: localStorage.getItem(MUSIC_MUTED_KEY),
    videoPlaying: localStorage.getItem(VIDEO_PLAYING_KEY),
  };

  if (stored.animation !== null) animationEnabled = stored.animation === 'true';
  if (stored.confetti !== null) confettiEnabled = stored.confetti === 'true';
  if (stored.sfx !== null) sfxEnabled = stored.sfx === 'true';
  if (stored.keypress !== null) keypressVolume = parseFloat(stored.keypress);
  if (stored.gameComplete !== null) gameCompleteVolume = parseFloat(stored.gameComplete);
  if (stored.button !== null) buttonVolume = parseFloat(stored.button);
  if (stored.music !== null) musicVolume = parseFloat(stored.music);
  if (stored.musicMuted !== null) musicMuted = stored.musicMuted === 'true';
  if (stored.videoPlaying !== null) videoPlaying = stored.videoPlaying === 'true';
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
  keypressVolume = Math.max(0, Math.min(DEFAULT_KEYPRESS_VOLUME, volume));
  localStorage.setItem(KEYPRESS_VOLUME_KEY, keypressVolume.toString());
};

// Game Complete Volume
export const getGameCompleteVolume = (): number => gameCompleteVolume;
export const setGameCompleteVolume = (volume: number): void => {
  gameCompleteVolume = Math.max(0, Math.min(DEFAULT_GAME_COMPLETE_VOLUME, volume));
  localStorage.setItem(GAME_COMPLETE_VOLUME_KEY, gameCompleteVolume.toString());
};

// Button Volume
export const getButtonVolume = (): number => buttonVolume;
export const setButtonVolume = (volume: number): void => {
  buttonVolume = Math.max(0, Math.min(DEFAULT_BUTTON_VOLUME, volume));
  localStorage.setItem(BUTTON_VOLUME_KEY, buttonVolume.toString());
};

// Music Volume (background video)
// Note: Only sets volume level, never touches muted state.
// User controls muting via Settings modal - video must stay muted on startup for autoplay.
export const getMusicVolume = (): number => musicVolume;
export const setMusicVolume = (volume: number): void => {
  musicVolume = Math.max(0, Math.min(MAX_MUSIC_VOLUME, volume));
  localStorage.setItem(MUSIC_VOLUME_KEY, musicVolume.toString());
  // Update volume only, don't touch muted state
  const videoEl = document.getElementById('video') as HTMLVideoElement | null;
  if (videoEl) {
    videoEl.volume = musicVolume;
  }
};

// Music Muted
export const isMusicMuted = (): boolean => musicMuted;
export const setMusicMuted = (muted: boolean): void => {
  musicMuted = muted;
  localStorage.setItem(MUSIC_MUTED_KEY, muted.toString());
  const videoEl = document.getElementById('video') as HTMLVideoElement | null;
  if (videoEl) {
    videoEl.muted = muted;
  }
};

// Video Playing
export const isVideoPlaying = (): boolean => videoPlaying;
export const setVideoPlaying = (playing: boolean): void => {
  videoPlaying = playing;
  localStorage.setItem(VIDEO_PLAYING_KEY, playing.toString());
  const videoEl = document.getElementById('video') as HTMLVideoElement | null;
  if (videoEl) {
    if (playing) {
      videoEl.play().catch(console.error);
    } else {
      videoEl.pause();
    }
  }
};

// Initialize music volume on the video element (volume only, keeps muted for autoplay)
export const initMusicVolume = (): void => {
  const videoEl = document.getElementById('video') as HTMLVideoElement | null;
  if (videoEl) {
    videoEl.volume = musicVolume;
    // We don't force muted/playing here because index.html handles the startup flow
    // which includes unmuting and playing on user interaction.
    // However, if we wanted to sync state after that interaction, we might need more logic.
  }
};
