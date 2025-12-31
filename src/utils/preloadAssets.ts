
const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(); // Resolve even if an image fails to load, to not block the app
      };
    });
};
  
const preloadFont = (fontName: string, fontUrl: string): Promise<void> => {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    return font.load().then((loadedFont) => {
        (document.fonts as any).add(loadedFont);
    }).catch(err => {
        console.warn(`Failed to load font: ${fontName} from ${fontUrl}`, err);
        return Promise.resolve(); // Don't block app for a font
    });
};

const preloadVideo = (src: string): Promise<void> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'auto';
        video.muted = true; // Autoplay policy
        
        // We consider it "preloaded" when we have enough data to start playing
        const onLoaded = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            console.warn(`Failed to preload video: ${src}`);
            cleanup();
            resolve();
        };

        const cleanup = () => {
            video.removeEventListener('canplay', onLoaded);
            video.removeEventListener('error', onError);
        };

        video.addEventListener('canplay', onLoaded);
        video.addEventListener('error', onError);
        
        video.load();
    });
};

// Import all assets using Vite's import.meta.glob
// This ensures they are processed by the bundler and have correct paths in production
const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,svg}', { 
    eager: true, 
    query: '?url', 
    import: 'default' 
});

const fontModules = import.meta.glob('../assets/*.{ttf,otf,woff,woff2}', { 
    eager: true, 
    query: '?url', 
    import: 'default' 
});

export const preloadGameAssets = async (): Promise<void> => {
    const imageUrls = Object.values(imageModules) as string[];
    
    // Find ProggyClean font
    // The key in fontModules will be like '../assets/ProggyClean.ttf'
    const proggyKey = Object.keys(fontModules).find(k => k.includes('ProggyClean'));
    const proggyUrl = proggyKey ? (fontModules[proggyKey] as string) : null;

    const fontDetails = [];
    if (proggyUrl) {
        fontDetails.push({ name: 'ProggyCleanTT', url: proggyUrl });
    }

    const videoUrls = [
        '/tr2.mp4'
    ];

    const imagePromises = imageUrls.map(preloadImage);
    const fontPromises = fontDetails.map(f => preloadFont(f.name, f.url));
    const videoPromises = videoUrls.map(preloadVideo);

    await Promise.all([...imagePromises, ...fontPromises, ...videoPromises]);
};
