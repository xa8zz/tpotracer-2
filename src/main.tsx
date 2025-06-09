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
      loader.classList.add('fade-out');
      // Remove the loader from the DOM after the transition
      loader.addEventListener('transitionend', () => {
        loader.remove();
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
