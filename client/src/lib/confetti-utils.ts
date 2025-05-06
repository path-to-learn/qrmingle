import { ConfettiOptions, triggerConfetti } from './confetti';

const CONFETTI_SETTINGS_KEY = 'confettiSettings';

const defaultSettings: ConfettiOptions = {
  particleCount: 80,
  spread: 70,
  startVelocity: 30,
  gravity: 1,
  style: 'basic',
  colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  shapes: ['square', 'circle'],
};

/**
 * Get saved confetti settings from localStorage or return default settings
 */
export function getConfettiSettings(): ConfettiOptions {
  try {
    const savedSettings = localStorage.getItem(CONFETTI_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading confetti settings:', error);
  }
  return defaultSettings;
}

/**
 * Save confetti settings to localStorage
 */
export function saveConfettiSettings(settings: ConfettiOptions): void {
  try {
    localStorage.setItem(CONFETTI_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving confetti settings:', error);
  }
}

/**
 * Trigger confetti with user's saved settings
 * @param overrideOptions Optional settings to override saved settings
 */
export function triggerUserConfetti(overrideOptions?: Partial<ConfettiOptions>): void {
  const userSettings = getConfettiSettings();
  const mergedSettings = { ...userSettings, ...overrideOptions };
  triggerConfetti(mergedSettings);
}