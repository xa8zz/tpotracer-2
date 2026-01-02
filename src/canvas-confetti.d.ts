declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface CreateOptions {
    resize?: boolean;
    useWorker?: boolean;
  }

  type ConfettiFunction = (options?: Options) => Promise<null> | null;

  interface ConfettiModule {
    (options?: Options): Promise<null> | null;
    create(canvas: HTMLCanvasElement, options?: CreateOptions): ConfettiFunction;
    reset(): void;
  }

  const confetti: ConfettiModule;

  export default confetti;
}

