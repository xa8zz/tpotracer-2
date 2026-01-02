import confetti from 'canvas-confetti';

// TPOTracer brand colors
const TPOTRACER_COLORS = ['#A7F1FA', '#77DFF6', '#2A8FC3', '#0d3f62', '#03223F', '#02182D'];

// Random number in range helper
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

type ConfettiFunction = ReturnType<typeof confetti.create>;

/**
 * Fire initial celebration burst from bottom middle
 */
export const fireInitialBursts = (myConfetti: ConfettiFunction, duration: number = 500) => {
  const end = Date.now() + duration;
  
  const frame = () => {
    if (Date.now() > end) return;
    
    // Fire from bottom middle
    myConfetti({
      particleCount: 12,
      angle: 90, // Up
      spread: 160, // Wide spread to cover screen
      startVelocity: 40,
      origin: { x: 0.5, y: 1 },
      colors: TPOTRACER_COLORS,
      ticks: 80,
      gravity: 0.8,
      scalar: 0.15,
      drift: 0
    });
    
    requestAnimationFrame(frame);
  };
  
  requestAnimationFrame(frame);
};

/**
 * Start continuous confetti rain from the top
 * Returns a stop function to cancel the animation
 */
export const startConfettiRain = (myConfetti: ConfettiFunction): (() => void) => {
  let animationId: number;
  let running = true;
  
  const frame = () => {
    if (!running) return;
    
    // Gentle rain from the top
    myConfetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: 150,
      origin: {
        x: Math.random(),
        y: -0.1 // Start just above the canvas
      },
      colors: TPOTRACER_COLORS,
      gravity: randomInRange(0.3, 0.5),
      scalar: randomInRange(0.1, 0.2),
      drift: randomInRange(-0.2, 0.2)
    });
    
    animationId = requestAnimationFrame(frame);
  };
  
  animationId = requestAnimationFrame(frame);
  
  // Return stop function
  return () => {
    running = false;
    cancelAnimationFrame(animationId);
  };
};

/**
 * Initialize confetti on a canvas element
 */
export const createConfetti = (canvas: HTMLCanvasElement) => {
  return confetti.create(canvas, {
    resize: false,
    useWorker: false
  });
};

