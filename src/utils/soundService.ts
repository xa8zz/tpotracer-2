/**
 * Sound Service for keyboard click sounds
 * Uses Howler.js for audio playback with dual-instance approach
 * to prevent sounds from cutting off during rapid typing.
 */

import { Howl, Howler } from 'howler';
import { isSfxEnabled, getKeypressVolume, getGameCompleteVolume } from './settingsService';

// Import all click sound files
import click1 from '../assets/sound/click4_1.wav';
import click1b from '../assets/sound/click4_11.wav';
import click2 from '../assets/sound/click4_2.wav';
import click2b from '../assets/sound/click4_22.wav';
import click3 from '../assets/sound/click4_3.wav';
import click3b from '../assets/sound/click4_33.wav';
import click4 from '../assets/sound/click4_4.wav';
import click4b from '../assets/sound/click4_44.wav';
import click5 from '../assets/sound/click4_5.wav';
import click5b from '../assets/sound/click4_55.wav';
import click6 from '../assets/sound/click4_6.wav';
import click6b from '../assets/sound/click4_66.wav';

// Import error sound files
import error1 from '../assets/sound/error2_1.wav';

// Import game complete sound
import gamecomplete from '../assets/sound/gamecomplete.wav';
import newBestWpm from '../assets/sound/newbestwpm.mp3';
import almostThere from '../assets/sound/almostthere.mp3';

// Each variation has TWO Howl instances and its own counter for rapid fire handling
type SoundVariation = {
  sounds: [Howl, Howl];
  counter: number;
};

// Store all sound variations
let clickSounds: SoundVariation[] | null = null;
let errorSounds: SoundVariation[] | null = null;
let gameCompleteSound: Howl | null = null;
let newBestWpmSound: Howl | null = null;
let almostThereSound: Howl | null = null;

// Track initialization state
let isInitialized = false;
let isInitializing = false;

// Sound enabled state (persisted to localStorage)
const SOUND_ENABLED_KEY = 'tpotracer_sound_enabled';
const SOUND_VOLUME_KEY = 'tpotracer_sound_volume';

let soundEnabled = true;
let soundVolume = 0.5;

/**
 * Load sound enabled state from localStorage
 */
const loadSoundSettings = () => {
  const storedEnabled = localStorage.getItem(SOUND_ENABLED_KEY);
  if (storedEnabled !== null) {
    soundEnabled = storedEnabled === 'true';
  }
  
  const storedVolume = localStorage.getItem(SOUND_VOLUME_KEY);
  if (storedVolume !== null) {
    soundVolume = parseFloat(storedVolume);
  }
  
  // Apply volume to Howler
  Howler.volume(soundVolume);
};

/**
 * Create a Howl instance for a sound file
 */
const createHowl = (src: string): Howl => {
  return new Howl({
    src: [src],
    preload: true,
    volume: 1.0, // Volume is controlled globally via Howler.volume()
  });
};

/**
 * Initialize the sound service - loads all sound files
 * Should be called early in app lifecycle (e.g., after user interaction)
 */
export const initSoundService = async (): Promise<void> => {
  if (isInitialized || isInitializing) return;
  
  isInitializing = true;
  
  try {
    // Load settings from localStorage
    loadSoundSettings();
    
    // Each variation has TWO Howl instances and its own counter
    clickSounds = [
      {
        sounds: [createHowl(click1), createHowl(click1b)],
        counter: 0,
      },
      {
        sounds: [createHowl(click2), createHowl(click2b)],
        counter: 0,
      },
      {
        sounds: [createHowl(click3), createHowl(click3b)],
        counter: 0,
      },
      {
        sounds: [createHowl(click4), createHowl(click4b)],
        counter: 0,
      },
      {
        sounds: [createHowl(click5), createHowl(click5b)],
        counter: 0,
      },
      {
        sounds: [createHowl(click6), createHowl(click6b)],
        counter: 0,
      },
    ];
    
    // One variation with dual instances for rapid fire
    errorSounds = [
      {
        sounds: [createHowl(error1), createHowl(error1)],
        counter: 0,
      },
    ];

    // Game complete sounds (single instances are fine as they're not rapid fire)
    gameCompleteSound = createHowl(gamecomplete);
    newBestWpmSound = createHowl(newBestWpm);
    almostThereSound = createHowl(almostThere);
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize sound service:', error);
  } finally {
    isInitializing = false;
  }
};

/**
 * Pick a random element from an array
 */
const randomElementFromArray = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Play a click sound
 * Randomly selects a sound variation and toggles between duplicate instances
 * to prevent sounds from cutting off during rapid typing.
 * 
 * Matches MonkeyType's playClick logic exactly:
 * 1. Pick random sound variation
 * 2. Get sound at variation's counter index
 * 3. Increment counter (wrap at 2)
 * 4. Seek to 0 and play
 */
export const playClick = (): void => {
  if (!soundEnabled || !isSfxEnabled() || clickSounds === null) return;
  
  try {
    // Apply current volume from settings
    Howler.volume(getKeypressVolume());
    
    // Pick a random sound variation
    const randomSound = randomElementFromArray(clickSounds);
    
    // Get the sound at current counter position
    const soundToPlay = randomSound.sounds[randomSound.counter];
    
    // Increment counter and wrap at 2 (toggle between 0 and 1)
    randomSound.counter++;
    if (randomSound.counter === 2) randomSound.counter = 0;
    
    // Reset position and play
    soundToPlay.seek(0);
    soundToPlay.play();
  } catch (error) {
    console.error('Failed to play click sound:', error);
  }
};

/**
 * Play an error sound (for incorrect keystrokes)
 * Same logic as playClick but uses error sounds.
 */
export const playError = (): void => {
  if (!soundEnabled || !isSfxEnabled() || errorSounds === null) return;
  
  try {
    // Apply current volume from settings
    Howler.volume(getKeypressVolume());
    
    // Pick a random error sound variation
    const randomSound = randomElementFromArray(errorSounds);
    
    // Get the sound at current counter position
    const soundToPlay = randomSound.sounds[randomSound.counter];
    
    // Increment counter and wrap at 2 (toggle between 0 and 1)
    randomSound.counter++;
    if (randomSound.counter === 2) randomSound.counter = 0;
    
    // Reset position and play
    soundToPlay.seek(0);
    soundToPlay.play();
  } catch (error) {
    console.error('Failed to play error sound:', error);
  }
};

/**
 * Play game complete sound
 * Only plays if sound is enabled
 */
export const playGameComplete = (): void => {
  if (!soundEnabled || !isSfxEnabled() || gameCompleteSound === null) return;
  
  try {
    // Apply volume from settings
    Howler.volume(getGameCompleteVolume());
    
    // Reset position and play
    gameCompleteSound.seek(0);
    gameCompleteSound.play();
  } catch (error) {
    console.error('Failed to play game complete sound:', error);
  }
};

/**
 * Play new best WPM sound
 * Only plays if sound is enabled
 */
export const playNewBestWpm = (): void => {
  if (!soundEnabled || !isSfxEnabled() || newBestWpmSound === null) return;
  
  try {
    // Apply volume from settings
    Howler.volume(getGameCompleteVolume());
    
    // Reset position and play
    newBestWpmSound.seek(0);
    newBestWpmSound.play();
  } catch (error) {
    console.error('Failed to play new best wpm sound:', error);
  }
};

/**
 * Play almost there sound
 * Only plays if sound is enabled
 */
export const playAlmostThere = (): void => {
  if (!soundEnabled || !isSfxEnabled() || almostThereSound === null) return;
  
  try {
    // Apply volume from settings
    Howler.volume(getGameCompleteVolume());
    
    // Reset position and play
    almostThereSound.seek(0);
    almostThereSound.play();
  } catch (error) {
    console.error('Failed to play almost there sound:', error);
  }
};

/**
 * Check if sound is enabled
 */
export const isSoundEnabled = (): boolean => {
  return soundEnabled;
};

/**
 * Enable or disable sound
 */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
};

/**
 * Toggle sound on/off
 */
export const toggleSound = (): boolean => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_ENABLED_KEY, soundEnabled.toString());
  return soundEnabled;
};

/**
 * Get current volume (0.0 to 1.0)
 */
export const getSoundVolume = (): number => {
  return soundVolume;
};

/**
 * Set sound volume (0.0 to 1.0)
 */
export const setSoundVolume = (volume: number): void => {
  soundVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem(SOUND_VOLUME_KEY, soundVolume.toString());
  Howler.volume(soundVolume);
};

/**
 * Check if sound service is initialized
 */
export const isSoundInitialized = (): boolean => {
  return isInitialized;
};

