/**
 * Sound Service for keyboard click sounds
 * Uses Howler.js for audio playback with dual-instance approach
 * to prevent sounds from cutting off during rapid typing.
 */

import { Howl, Howler } from 'howler';

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
import error1 from '../assets/sound/error4_1.wav';
import error2 from '../assets/sound/error4_2.wav';

// Each variation has TWO Howl instances and its own counter for rapid fire handling
type SoundVariation = {
  sounds: [Howl, Howl];
  counter: number;
};

// Store all sound variations
let clickSounds: SoundVariation[] | null = null;
let errorSounds: SoundVariation[] | null = null;

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
    
    // Two variations, each with dual instances for rapid fire
    errorSounds = [
      {
        sounds: [createHowl(error1), createHowl(error1)],
        counter: 0,
      },
      {
        sounds: [createHowl(error2), createHowl(error2)],
        counter: 0,
      },
    ];
    
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
  if (!soundEnabled || clickSounds === null) return;
  
  try {
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
  if (!soundEnabled || errorSounds === null) return;
  
  try {
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

