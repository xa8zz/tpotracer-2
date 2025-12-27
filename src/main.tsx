import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NewApp from './NewApp.tsx';
import './index.css';
import { preloadGameAssets } from './utils/preloadAssets.ts';
import { whenVideoPlaying } from './utils/videoUtils.ts';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

async function main() {
  const skipLoadingPromise = new Promise(resolve => {
    const checkSkip = () => {
      if ((window as any)._skipLoading === true) {
        resolve('skipped');
      } else {
        setTimeout(checkSkip, 100);
      }
    };
    checkSkip();
  });
  // Preload assets + video (with 2s timeout)
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 2000));
  await Promise.race([
    Promise.all([preloadGameAssets(), whenVideoPlaying()]),
    skipLoadingPromise,
    timeoutPromise
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
        if ((window as any).dotInterval) {
          clearInterval((window as any).dotInterval);
        }
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
