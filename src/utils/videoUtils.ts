// Get the currently active video element from the dual-video system
export function getPlayer(): HTMLVideoElement {
  // Try video-a first (it's the default active one)
  const videoA = document.getElementById('video-a') as HTMLVideoElement;
  const videoB = document.getElementById('video-b') as HTMLVideoElement;
  
  // Return whichever one is currently visible (not hidden)
  if (videoA && !videoA.classList.contains('is-hidden')) {
    return videoA;
  }
  if (videoB && !videoB.classList.contains('is-hidden')) {
    return videoB;
  }
  // Fallback to video-a
  return videoA;
}

export async function whenVideoPlaying(): Promise<void> {
  const videoA = document.getElementById('video-a') as HTMLVideoElement;
  const videoB = document.getElementById('video-b') as HTMLVideoElement;
  const fallback = document.getElementById('video-fallback');
  
  if (!videoA || !videoB) return;

  const DEBUG_FORCE_BG = false; // Set to true to force background for first 3s
  let debugForcedBgActive = DEBUG_FORCE_BG;

  const showVideo = () => {
    if (debugForcedBgActive) return; // Don't show video if debug force is active
    
    // We only need to hide the fallback; the videos are always opaque behind it
    if (fallback) fallback.classList.add('is-hidden');
  };

  // Attach listeners for state changes on both videos
  [videoA, videoB].forEach(video => {
    video.addEventListener('playing', showVideo);
    
    video.addEventListener('waiting', () => {
      // Only show fallback if the currently active video is waiting
      if (!video.classList.contains('is-hidden')) {
        if (fallback) fallback.classList.remove('is-hidden');
      }
    });
    
    video.addEventListener('stalled', () => {
      if (!video.classList.contains('is-hidden')) {
        if (fallback) fallback.classList.remove('is-hidden');
      }
    });
    
    video.addEventListener('error', () => {
      if (!video.classList.contains('is-hidden')) {
        if (fallback) fallback.classList.remove('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (!video.classList.contains('is-hidden')) {
        if (fallback) fallback.classList.remove('is-hidden');
      }
    });
  });

  if (DEBUG_FORCE_BG) {
    if (fallback) fallback.classList.remove('is-hidden');
    setTimeout(() => {
      debugForcedBgActive = false;
      // After timeout, check if we should be showing video
      const activeVideo = getPlayer();
      if (!activeVideo.paused && activeVideo.readyState >= 3) {
        showVideo();
      }
    }, 3000);
  }

  // If active video is already playing/ready
  const activeVideo = getPlayer();
  if (!activeVideo.paused && activeVideo.readyState >= 3) {
    showVideo();
    return;
  }

  return new Promise((resolve) => {
    const onPlay = () => {
      showVideo();
      resolve();
    };

    // The dual-video system is started by index.html on user click
    // We just need to wait for it to start playing
    const checkPlaying = () => {
      const active = getPlayer();
      if (!active.paused && active.readyState >= 3) {
        onPlay();
      } else {
        // Video not ready yet, wait a bit and check again
        setTimeout(checkPlaying, 100);
      }
    };
    
    // Give the video system a chance to start
    setTimeout(checkPlaying, 100);
  });
}
