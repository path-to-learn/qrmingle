import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qrmingle.app',
  appName: 'QrMingle',
  webDir: 'client/dist',
  server: {
    url: 'https://qrmingle.com',
    cleartext: false
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
