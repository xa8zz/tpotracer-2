export function getPlayer() {
  return document.getElementById('video') as HTMLVideoElement;
}

export async function whenVideoPlaying(): Promise<void> {
  const video = document.getElementById('video') as HTMLVideoElement;
  const fallback = document.getElementById('video-fallback');
  
  if (!video) return;

  const DEBUG_FORCE_BG = false; // Set to true to force background for first 3s
  let debugForcedBgActive = DEBUG_FORCE_BG;

  const showVideo = () => {
    if (debugForcedBgActive) return; // Don't show video if debug force is active
    
    // We only need to hide the fallback; the video is always opaque behind it
    if (fallback) fallback.classList.add('is-hidden');
  };

  // Attach listeners for state changes
  video.addEventListener('playing', showVideo);
  
  video.addEventListener('waiting', () => {
      if (fallback) fallback.classList.remove('is-hidden');
  });
  
  video.addEventListener('stalled', () => {
      if (fallback) fallback.classList.remove('is-hidden');
  });
  
  video.addEventListener('error', () => {
      if (fallback) fallback.classList.remove('is-hidden');
  });

  video.addEventListener('pause', () => {
      if (fallback) fallback.classList.remove('is-hidden');
  });

  if (DEBUG_FORCE_BG) {
      if (fallback) fallback.classList.remove('is-hidden');
      setTimeout(() => {
          debugForcedBgActive = false;
          // After timeout, check if we should be showing video
          if (!video.paused && video.readyState >= 3) {
              showVideo();
          }
      }, 3000);
  }

  // If video is already playing/ready
  if (!video.paused && video.readyState >= 3) {
    showVideo();
    return;
  }

  return new Promise((resolve) => {
    const onPlay = () => {
      showVideo();
      resolve();
    };

    // Attempt to play if not already
    video.play().then(() => {
      onPlay();
    }).catch((e) => {
      console.warn("Autoplay prevented:", e);
      // If autoplay fails, we show fallback and still resolve so app loads
      if (fallback) fallback.classList.remove('is-hidden');
      resolve();
    });
  });
}
