import { registerPlugin, Capacitor } from '@capacitor/core';

export type BiometryType = 'faceId' | 'touchId' | 'none';

interface BiometricNativePlugin {
  isAvailable(): Promise<{ isAvailable: boolean; biometryType: BiometryType }>;
  setCredentials(options: { username: string; password: string }): Promise<void>;
  getCredentials(): Promise<{ username: string; password: string }>;
  deleteCredentials(): Promise<void>;
}

const Biometric = registerPlugin<BiometricNativePlugin>('Biometric');

const FACE_ID_ENABLED_KEY = 'faceid-login-enabled';

export function isFaceIdLoginEnabled(): boolean {
  return Capacitor.isNativePlatform() && localStorage.getItem(FACE_ID_ENABLED_KEY) === 'true';
}

export async function checkBiometricAvailability() {
  if (!Capacitor.isNativePlatform()) return { isAvailable: false, biometryType: 'none' as BiometryType };
  try {
    return await Biometric.isAvailable();
  } catch {
    return { isAvailable: false, biometryType: 'none' as BiometryType };
  }
}

export async function enableFaceIdLogin(username: string, password: string): Promise<void> {
  await Biometric.setCredentials({ username, password });
  localStorage.setItem(FACE_ID_ENABLED_KEY, 'true');
}

export async function disableFaceIdLogin(): Promise<void> {
  localStorage.removeItem(FACE_ID_ENABLED_KEY);
  try {
    await Biometric.deleteCredentials();
  } catch {
    // best-effort — the local flag is the source of truth for whether we show the UI
  }
}

export async function getFaceIdCredentials(): Promise<{ username: string; password: string }> {
  return Biometric.getCredentials();
}
