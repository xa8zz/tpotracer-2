// src/utils/preloadAssets.ts

const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
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

export const preloadGameAssets = async (): Promise<void> => {
    const imageUrls = [
        '/src/assets/mainbodyscanlines.png',
        '/src/assets/leaderboardfinal.png',
        '/src/assets/leaderboardcondensednobuttonfull.png',
        '/src/assets/trbg3.png',
        '/src/assets/button.png',
        '/src/assets/buttondepressedalt.png',
        '/src/assets/mdbutton.png',
        '/src/assets/mdbuttonpressed.png',
        '/src/assets/lgbutton.png',
        '/src/assets/lgbuttonpressed.png',
        '/src/assets/smallbutton.png',
        '/src/assets/smallbuttonpressed.png',
        '/src/assets/settingsmodalcropped.png',
        '/src/assets/gamescreencropped.png',
        '/src/assets/welcomemodal2cropped.png',
        '/src/assets/helpmodalcropped.png',
        '/src/assets/background.png',
        '/src/assets/logosm.png'
    ];

    const fontDetails = [
        { name: 'ProggyCleanTT', url: '/src/assets/ProggyClean.ttf' }
    ];

    const imagePromises = imageUrls.map(preloadImage);
    const fontPromises = fontDetails.map(f => preloadFont(f.name, f.url));

    await Promise.all([...imagePromises, ...fontPromises]);
}; 