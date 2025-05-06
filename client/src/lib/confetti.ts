import confetti from 'canvas-confetti';

// Basic confetti celebration function
export function celebrateSuccess() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 2000,
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Confetti celebration with specific colors
export function celebrateWithColors(colors: string[]) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    zIndex: 2000,
  });
}

// Confetti celebration when a QR code is generated
export function celebrateQrGenerated() {
  const end = Date.now() + 2000;

  // Launch fireworks every 50ms
  const interval = setInterval(() => {
    if (Date.now() > end) {
      return clearInterval(interval);
    }

    confetti({
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
      shapes: ['square', 'circle'] as string[],
      zIndex: 2000,
    });
  }, 50);
}

// Confetti for saving a contact
export function celebrateSaveContact() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['circle', 'square'] as string[],
    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
    zIndex: 2000,
  };

  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 1.2,
    shapes: ['star'] as string[],
    origin: { x: 0.5, y: 0.7 },
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 75,
      origin: { x: 0.4, y: 0.7 },
    });
  }, 250);

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 75,
      origin: { x: 0.6, y: 0.7 },
    });
  }, 400);
}

// Confetti for account/profile creation
export function celebrateCreation() {
  const duration = 3000;
  const end = Date.now() + duration;

  // Loop for 2 seconds with different burst patterns
  const interval = setInterval(() => {
    if (Date.now() > end) {
      return clearInterval(interval);
    }

    const particleCount = 50;
    // Random location for bursts
    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e'],
      zIndex: 2000,
    });
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#88ff5a', '#fcff42', '#ffa62d'],
      zIndex: 2000,
    });
  }, 150);
}