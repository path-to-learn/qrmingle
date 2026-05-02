import type { CapacitorConfig } from '@capacitor/cli';

// ─── Build modes ────────────────────────────────────────────────────────────
// DEV  (laptop connected): uncomment server.url block below
// DEMO / RELEASE: keep server.url block commented out
//   → runs npm run build + npx cap copy ios, then Xcode archive
// ────────────────────────────────────────────────────────────────────────────
const config: CapacitorConfig = {
  appId: 'com.qrmingle.app',
  appName: 'QrMingle',
  webDir: 'dist/public',
  // DEV ONLY — comment out for demo/release builds:
  // server: {
  //   url: 'http://10.0.0.179:5000',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
