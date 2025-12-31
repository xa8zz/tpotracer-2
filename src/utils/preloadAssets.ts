
// Keep a reference to loaded images so they aren't garbage collected
// losing the decoded data.
const imageCache: HTMLImageElement[] = [];

const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      
      // Keep in cache
      imageCache.push(img);

      // Cast to any to prevent TypeScript from narrowing the else branch to 'never'
      // if it thinks decode is always present on HTMLImageElement.
      if ('decode' in (img as any)) {
        // img.decode() waits for the image to be downloaded AND decoded into a bitmap.
        // This prevents the "first-paint flicker" and is the modern idiomatic solution.
        img.decode()
            .then(() => resolve())
            .catch((err) => {
                console.warn(`Failed to decode image: ${src}`, err);
                // Resolve anyway to not block the app (it might just be a decoding error or format issue)
                resolve();
            });
      } else {
        // Fallback for older browsers
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
          resolve(); 
        };
      }
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
