# Xcode Setup for QrMingle iOS App

## Opening Your Project

1. **Navigate to project folder:**
   ```bash
   cd ios/App
   ```

2. **Open in Xcode:**
   ```bash
   open App.xcworkspace
   ```
   ⚠️ Important: Open `.xcworkspace` NOT `.xcodeproj`

## First-Time Configuration

### 1. Project Settings
- Select "App" project in navigator (top item)
- Under "General" tab:
  - Display Name: `QrMingle`
  - Bundle Identifier: `com.qrmingle.app`
  - Version: `1.0`
  - Build: `1`

### 2. Team & Signing
- Still in "General" tab, scroll to "Signing & Capabilities"
- Select your Apple Developer Team (if you have one)
- Check "Automatically manage signing"
- If no team: You can still run in simulator without Apple Developer Account

### 3. Target Device Selection
- Top toolbar: Select target device
- For simulator: Choose any iPhone model (iPhone 15, iPhone 14 Pro, etc.)
- For physical device: Connect iPhone via cable and select it

## Building and Running

### Simulator (No Apple Developer Account needed)
1. Select iPhone simulator from device menu
2. Press play button (▶️) or `Cmd+R`
3. App will build and launch in simulator

### Physical iPhone (Requires Apple Developer Account)
1. Connect iPhone via USB cable
2. Trust computer when prompted on iPhone
3. Select your iPhone from device menu
4. Press play button (▶️) or `Cmd+R`

## What You'll See

Your QrMingle web application running in a native iOS container with:
- Native iOS navigation
- Camera access for QR scanning
- Haptic feedback
- Status bar integration
- App icon and launch screen

## Troubleshooting

### Build Errors
- **Code signing error:** Need Apple Developer Account for device testing
- **Bundle ID conflict:** Change bundle identifier to something unique
- **Missing simulator:** Install additional simulators in Xcode preferences

### App Not Loading
- Check that your web server is running at localhost:5000
- Verify Capacitor configuration in `capacitor.config.ts`
- Check browser console in Xcode for JavaScript errors

### Performance
- Simulator may be slower than physical device
- Web content loads from your local development server
- Native features (camera, haptics) work better on physical device

Your QrMingle app is ready to run!