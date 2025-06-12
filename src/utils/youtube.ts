let player: any;
let playerReadyPromise: Promise<void> | null = null;
let apiScriptRequested = false;

function setupVideoResizing(videoElement: HTMLElement) {
    function resizeVideoToFitScreen() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const videoAspectRatio = 16 / 9;
        const windowAspectRatio = windowWidth / windowHeight;
        let newWidth, newHeight;

        if (windowAspectRatio > videoAspectRatio) {
            newWidth = windowWidth * 1.5;
            newHeight = newWidth / videoAspectRatio;
        } else {
            newHeight = windowHeight * 1.5;
            newWidth = newHeight * videoAspectRatio;
        }

        videoElement.style.position = 'fixed';
        videoElement.style.top = `${(windowHeight - newHeight) / 2}px`;
        videoElement.style.left = `${(windowWidth - newWidth) / 2}px`;
        videoElement.style.width = `${newWidth}px`;
        videoElement.style.height = `${newHeight}px`;
        videoElement.style.zIndex = '-2';
        videoElement.style.opacity = '1.0';
        videoElement.style.pointerEvents = 'none';
        videoElement.style.filter = 'blur(10px) brightness(1.25) contrast(1.25)';
    }

    resizeVideoToFitScreen();
    window.addEventListener('resize', resizeVideoToFitScreen);
}

function ensurePlayerReady(): Promise<void> {
    if (!playerReadyPromise) {
        playerReadyPromise = new Promise((resolve) => {
            (window as any).onYouTubeIframeAPIReady = () => {
                const videoElement = document.getElementById('video');
                if (!videoElement) {
                    console.error('Video element not found');
                    return;
                }

                setupVideoResizing(videoElement);

                player = new (window as any).YT.Player('video', {
                    events: {
                        'onReady': () => {
                            player.mute();
                            setInterval(() => {
                                player.seekTo(74, true);
                            }, 67000);
                            
                            player.addEventListener('onStateChange', (event: any) => {
                                const videoElement = document.getElementById('video');
                                const videoContainer = document.getElementById('video-container');
                                if (event.data === 1) { // YT.PlayerState.PLAYING
                                    videoElement?.classList.remove('is-hidden');
                                    videoContainer?.classList.remove('is-loading');
                                } else {
                                    videoElement?.classList.add('is-hidden');
                                    videoContainer?.classList.add('is-loading');
                                }
                            });

                            resolve();
                        },
                    },
                });
            };

            if (!apiScriptRequested) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
                apiScriptRequested = true;
            }
        });
    }
    return playerReadyPromise;
}

export function getPlayer() {
    return player;
}

export async function whenVideoPlaying(): Promise<void> {
    await ensurePlayerReady();

    return new Promise((resolve) => {
        const checkInitialState = () => {
            if (player.getPlayerState() === 1) { // YT.PlayerState.PLAYING
                resolve();
                return;
            }

            const stateChangeListener = (event: any) => {
                if (event.data === 1) { // YT.PlayerState.PLAYING
                    player.removeEventListener('onStateChange', stateChangeListener);
                    resolve();
                }
            };
            player.addEventListener('onStateChange', stateChangeListener);
        };

        if (player.getPlayerState) {
            checkInitialState();
        } else {
            player.addEventListener('onReady', checkInitialState);
        }
    });
}

export async function initializeAndWhenVideoPlaying(appRoot: HTMLElement) {
    // First, preload assets
    // We can move the preloadGameAssets logic here to centralize preloading
    // For now, let's assume assets are preloaded or loading in parallel

    (window as any).onYouTubeIframeAPIReady = () => {
        const videoElement = document.getElementById('video');
        if (!videoElement) {
            console.error('Video element not found');
            return;
        }

        setupVideoResizing(videoElement);

        player = new (window as any).YT.Player('video', {
            events: {
                'onReady': () => {
                    // Ensure video starts muted
                    player.mute();
                    setInterval(() => player.seekTo(74, true), 67000);

                    const stateChangePromise = new Promise<void>(resolve => {
                        const listener = (event: any) => {
                            if (event.data === 1) { // PLAYING
                                player.removeEventListener('onStateChange', listener);
                                resolve();
                            }
                        };
                        player.addEventListener('onStateChange', listener);
                    });

                    stateChangePromise.then(() => {
                        // Now that video is playing, render the React app
                        const ReactDOM = (window as any).ReactDOM; // Assume ReactDOM is global or passed in
                        const React = (window as any).React;
                        const App = (window as any).App; // Assume App is global or passed in
                        
                        // This part is tricky as we are outside React's context.
                        // The logic will be in main.tsx
                    });
                },
            },
        });
    };

    // Trigger the API load
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
} 