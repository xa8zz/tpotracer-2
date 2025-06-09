import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NewApp from './NewApp.tsx';
import './index.css';
import { preloadGameAssets } from './utils/preloadAssets.ts';
import { whenVideoPlaying } from './utils/youtube.ts';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Initial loading state in the DOM
rootElement.innerHTML = `
  <div class="fixed inset-0 bg-tpotracer-400 flex flex-col items-center justify-center z-50" style="font-family: 'ProggyCleanTT', monospace;">
    <div class="text-center">
        <h1 class="text-6xl font-bold text-tpotracer-100 glow-text-shadow mb-4">
            tpotracer
        </h1>
        <p class="text-2xl text-tpotracer-100 glow-text-shadow">
            Loading...
        </p>
    </div>
  </div>
`;

async function main() {
  // Concurrently load assets and wait for the video to start playing
  await Promise.all([
    preloadGameAssets(),
    whenVideoPlaying()
  ]);

  // Clear the static loading screen
  rootElement.innerHTML = '';

  // Render the React app
  root.render(
    <StrictMode>
      <NewApp />
    </StrictMode>
  );
}

main();
