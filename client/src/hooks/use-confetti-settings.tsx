import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { ConfettiOptions } from '@/lib/confetti';

type ConfettiSettingsContextType = {
  settings: ConfettiOptions;
  updateSettings: (settings: ConfettiOptions) => void;
};

const defaultSettings: ConfettiOptions = {
  particleCount: 80,
  spread: 70,
  startVelocity: 30,
  gravity: 1,
  style: 'basic',
  colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  shapes: ['square', 'circle'],
};

const ConfettiSettingsContext = createContext<ConfettiSettingsContextType | null>(null);

export function ConfettiSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConfettiOptions>(defaultSettings);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('confettiSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading confetti settings:', error);
    }
  }, []);

  const updateSettings = (newSettings: ConfettiOptions) => {
    setSettings(newSettings);
    
    // Save to localStorage
    try {
      localStorage.setItem('confettiSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving confetti settings:', error);
    }
  };

  return (
    <ConfettiSettingsContext.Provider
      value={{
        settings,
        updateSettings,
      }}
    >
      {children}
    </ConfettiSettingsContext.Provider>
  );
}

export function useConfettiSettings() {
  const context = useContext(ConfettiSettingsContext);
  if (!context) {
    throw new Error('useConfettiSettings must be used within a ConfettiSettingsProvider');
  }
  return context;
}