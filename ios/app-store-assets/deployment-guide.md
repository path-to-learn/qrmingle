# QrMingle iOS App Deployment Guide

## Prerequisites

### 1. Apple Developer Account ($99/year)
- Sign up at [developer.apple.com](https://developer.apple.com)
- Required for TestFlight beta testing and App Store distribution
- Provides access to certificates, provisioning profiles, and App Store Connect

### 2. macOS Computer with Xcode
- Xcode 14.0 or later required
- Available free from Mac App Store
- Used to build, sign, and upload the iOS app

### 3. App Store Connect Access
- Automatically included with Apple Developer Account
- Portal for managing app submissions, TestFlight, and App Store listings

## Step-by-Step Deployment Process

### Phase 1: Xcode Project Setup (15 minutes)

1. **Open Project in Xcode**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Configure App Identity**
   - Select "App" project in navigator
   - Under "General" tab:
     - Display Name: "QrMingle"
     - Bundle Identifier: "com.qrmingle.app"
     - Version: "1.0"
     - Build: "1"

3. **Setup Signing & Capabilities**
   - Select your Apple Developer Team
   - Enable "Automatically manage signing"
   - Verify provisioning profile is generated

### Phase 2: App Icons & Assets (30 minutes)

1. **Convert SVG Icons to PNG**
   - Use online converter or design tool
   - Convert all icons in `/ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Replace .svg files with .png files maintaining exact filenames

2. **Create Splash Screen Image**
   - Design 1366x1366px splash screen with QrMingle branding
   - Add to `/ios/App/App/Assets.xcassets/Splash.imageset/`

### Phase 3: Build & Test (20 minutes)

1. **Build for Simulator**
   - Select iPhone simulator
   - Press Cmd+R to build and run
   - Test core functionality

2. **Build for Device Testing**
   - Connect physical iPhone via USB
   - Select your device as build target
   - Build and install for testing

### Phase 4: TestFlight Upload (45 minutes)

1. **Archive Build**
   - Select "Any iOS Device" as target
   - Product → Archive
   - Wait for archive completion

2. **Upload to App Store Connect**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Choose "Upload" option
   - Follow upload wizard

3. **Configure TestFlight**
   - Log into App Store Connect
   - Navigate to TestFlight section
   - Add test information and beta app description
   - Submit for beta app review (2-24 hours)

### Phase 5: App Store Connect Configuration (60 minutes)

1. **Create App Store Listing**
   - Go to "App Store" tab in App Store Connect
   - Add app information:
     - Name: QrMingle
     - Subtitle: Digital Contact Card Sharing
     - Description: (see README.md template)
     - Keywords: qr code, digital business card, networking
     - Category: Business
     - Age Rating: 4+

2. **Add Screenshots**
   - Capture screenshots on various iPhone sizes
   - Required sizes: 6.7", 6.5", 5.5" displays
   - iPad screenshots (optional but recommended)

3. **Pricing & Availability**
   - Set as "Free" app
   - Configure availability regions
   - Set release date

### Phase 6: App Review Submission (15 minutes)

1. **Final Review**
   - Check all required fields are completed
   - Verify app description and screenshots
   - Confirm age rating and content warnings

2. **Submit for Review**
   - Click "Submit for Review"
   - App review typically takes 7-14 days
   - Monitor status in App Store Connect

## Expected Timeline

- **Setup & Configuration:** 2 hours
- **TestFlight Beta Ready:** 2-3 days
- **App Store Review:** 7-14 days
- **Public Release:** 2-3 weeks total

## TestFlight Beta Testing

### Benefits
- Up to 10,000 external testers
- Real device testing across iOS versions
- Crash reporting and feedback collection
- 90-day testing periods

### Best Practices
- Start with small group of trusted testers
- Gather feedback on user experience
- Test on various device sizes and iOS versions
- Fix critical bugs before App Store submission

## Post-Launch Considerations

### App Updates
- Version increments for new features
- Build number increments for bug fixes
- Expedited review available for critical fixes

### Analytics & Performance
- App Store Connect provides download metrics
- Crash reporting through Xcode Organizer
- User reviews and ratings monitoring

### Marketing & Promotion
- App Store Optimization (ASO)
- Social media announcements
- Press release for launch
- User acquisition campaigns

## Support & Resources

- **Apple Developer Documentation:** developer.apple.com/documentation
- **App Store Connect Help:** help.apple.com/app-store-connect
- **Xcode Help:** developer.apple.com/xcode
- **TestFlight Guide:** developer.apple.com/testflight

## Troubleshooting Common Issues

### Build Errors
- Check certificate expiration
- Verify bundle identifier uniqueness
- Update Xcode to latest version

### Upload Failures
- Ensure app complies with App Store guidelines
- Check for missing required icons
- Verify app description meets content policies

### Review Rejections
- Common issues: crashes, incomplete functionality
- Respond promptly to reviewer feedback
- Resubmit with fixes within 7 days