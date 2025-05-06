import confetti from 'canvas-confetti';

/**
 * Trigger a celebratory confetti explosion
 * @param options Optional configuration for the confetti
 */
export function triggerConfetti(options?: {
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}) {
  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    duration: 3000
  };

  const mergedOptions = { ...defaultOptions, ...options };

  confetti({
    particleCount: mergedOptions.particleCount,
    spread: mergedOptions.spread,
    origin: mergedOptions.origin,
    colors: mergedOptions.colors,
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