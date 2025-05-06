import confetti from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  drift?: number;
  gravity?: number;
  ticks?: number;
  decay?: number;
  scalar?: number;
  shapes?: Array<'square' | 'circle'>;
  style?: 'basic' | 'fireworks' | 'snow' | 'stars' | 'school';
}

/**
 * Trigger a celebratory confetti explosion with customizable options
 * @param options Optional configuration for the confetti
 */
export function triggerConfetti(options?: ConfettiOptions) {
  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    startVelocity: 30,
    origin: { y: 0.6, x: 0.5 },
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    style: 'basic' as const
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Special effects based on style
  if (mergedOptions.style === 'fireworks') {
    triggerFireworks();
    return Promise.resolve();
  } else if (mergedOptions.style === 'snow') {
    triggerSnow();
    return Promise.resolve();
  } else if (mergedOptions.style === 'stars') {
    triggerStars();
    return Promise.resolve();
  } else if (mergedOptions.style === 'school') {
    triggerSchoolPrideConfetti();
    return Promise.resolve();
  }

  // Basic confetti
  confetti({
    particleCount: mergedOptions.particleCount,
    spread: mergedOptions.spread,
    startVelocity: mergedOptions.startVelocity,
    origin: mergedOptions.origin,
    colors: mergedOptions.colors,
    drift: mergedOptions.drift,
    gravity: mergedOptions.gravity,
    ticks: mergedOptions.ticks,
    decay: mergedOptions.decay,
    scalar: mergedOptions.scalar,
    shapes: mergedOptions.shapes,
    disableForReducedMotion: true, // Accessibility feature
    zIndex: 9999,
  });

  // For a one-shot confetti explosion
  return Promise.resolve();
}

/**
 * Trigger a school-pride themed confetti explosion
 */
export function triggerSchoolPrideConfetti() {
  const end = Date.now() + 1500;

  // Go Buckeyes!
  const colors = ['#ff0000', '#ffffff', '#0000ff', '#ffff00'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Trigger a realistic fireworks display of confetti
 */
export function triggerFireworks() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    }));
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    }));
  }, 250);
}

/**
 * Trigger a gentle snow effect with confetti
 */
export function triggerSnow() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const skew = 1;

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  (function frame() {
    const timeLeft = animationEnd - Date.now();
    const ticks = Math.max(200, 500 * (timeLeft / duration));
    
    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: ticks,
      origin: {
        x: Math.random(),
        // since particles fall down, start a bit higher than random
        y: (Math.random() * skew) - 0.2
      },
      colors: ['#ffffff'],
      shapes: ['circle'],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.4, 1),
      drift: randomInRange(-0.4, 0.4)
    });
    
    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Trigger a star-like confetti effect
 */
export function triggerStars() {
  const defaults = { 
    spread: 360, 
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star']
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle']
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
  setTimeout(shoot, 300);
  setTimeout(shoot, 400);
}