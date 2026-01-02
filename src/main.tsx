import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NewApp from './NewApp.tsx';
import './index.css';
import { preloadGameAssets } from './utils/preloadAssets.ts';
import { whenVideoPlaying } from './utils/videoUtils.ts';
import { initMusicVolume } from './utils/settingsService.ts';

// Import intro sound for preloading (Vite will bundle this)
import introSoundUrl from './assets/sound/intro.wav';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Preload intro sound and expose to window for index.html to use
const INTRO_SOUND_VOLUME = 0.01;
const introSound = new Audio(introSoundUrl);
introSound.preload = 'auto';
introSound.volume = INTRO_SOUND_VOLUME;
introSound.load();
(window as any)._introSound = introSound;

async function main() {
  // Preload assets + video (with 2s timeout)
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 2000));
  await Promise.race([
    Promise.all([preloadGameAssets(), whenVideoPlaying()]),
    timeoutPromise
  ]);

  // Initialize music volume from saved settings
  initMusicVolume();

  const onAppReady = () => {
    // Signal to index.html that loading is complete
    // The Play button will handle hiding the loader
    if ((window as any)._signalLoadingComplete) {
      (window as any)._signalLoadingComplete();
    }
  };

  // Render the React app
  root.render(
    <StrictMode>
      <NewApp onReady={onAppReady} />
    </StrictMode>
  );
}

main();
