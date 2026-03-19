declare module 'canvas-confetti' {
  type ConfettiOptions = {
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
    particleRatio?: number;
  };

  export default function confetti(options?: ConfettiOptions): Promise<null>;
  
  export function create(
    canvas: HTMLCanvasElement,
    options?: { resize?: boolean; useWorker?: boolean }
  ): (options?: ConfettiOptions) => Promise<null>;
  
  export function reset(): void;
}