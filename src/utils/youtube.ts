export function getPlayer() {
  return document.getElementById('video') as HTMLVideoElement;
}

export async function whenVideoPlaying(): Promise<void> {
  const video = document.getElementById('video') as HTMLVideoElement;
  if (!video) return;

  // If video is already playing/ready
  if (!video.paused && video.readyState >= 3) {
    video.classList.add('is-visible');
    return;
  }

  return new Promise((resolve) => {
    const onPlay = () => {
      video.classList.add('is-visible');
      resolve();
    };

    // Attempt to play if not already
    video.play().then(() => {
      onPlay();
    }).catch((e) => {
      console.warn("Autoplay prevented:", e);
      // If autoplay fails, we still resolve so the app loads, 
      // but the user might need to interact to start the video later.
      video.classList.add('is-visible'); 
      resolve();
    });
  });
}
