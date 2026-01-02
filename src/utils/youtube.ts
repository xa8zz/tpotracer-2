// Get the currently active video element from the dual-video system
export function getPlayer(): HTMLVideoElement {
  const videoA = document.getElementById('video-a') as HTMLVideoElement;
  const videoB = document.getElementById('video-b') as HTMLVideoElement;
  
  // Return whichever one is currently visible (not hidden)
  if (videoA && !videoA.classList.contains('is-hidden')) {
    return videoA;
  }
  if (videoB && !videoB.classList.contains('is-hidden')) {
    return videoB;
  }
  return videoA;
}

export async function whenVideoPlaying(): Promise<void> {
  const video = getPlayer();
  if (!video) return;

  // If video is already playing/ready
  if (!video.paused && video.readyState >= 3) {
    return;
  }

  return new Promise((resolve) => {
    const checkPlaying = () => {
      const active = getPlayer();
      if (!active.paused && active.readyState >= 3) {
        resolve();
      } else {
        setTimeout(checkPlaying, 100);
      }
    };
    
    setTimeout(checkPlaying, 100);
  });
}
