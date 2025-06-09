import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NewApp from './NewApp.tsx';
import './index.css';
import { preloadGameAssets } from './utils/preloadAssets.ts';
import { whenVideoPlaying } from './utils/youtube.ts';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

async function main() {
  // Concurrently load assets and wait for the video to start playing
  await Promise.all([
    preloadGameAssets(),
    whenVideoPlaying()
  ]);

  const onAppReady = () => {
    const loader = document.getElementById('loader');
    if (loader) {
      // Set up the listener to remove the loader once the transition is complete.
      loader.addEventListener('transitionend', () => {
        loader.remove();
      }, { once: true });

      // Use requestAnimationFrame to ensure the browser has time to
      // process the initial state before we trigger the fade-out transition.
      requestAnimationFrame(() => {
        loader.classList.add('fade-out');
      });
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
