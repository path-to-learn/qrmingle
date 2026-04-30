# QrMingle Release Notes

---

## [Unreleased] — 2026-04-30

### Card Redesign (HiHello-inspired portrait layout)
- Full redesign of profile card to portrait-style layout with a photo hero section (230px), SVG wave separator, and white info section below
- Profile photo now shown as a circular avatar inside the card's photo section
- Inline QR code (58×58px, accent-colored) added to the info section — lets people share/scan offline without internet
- Card accent color derived from card type name ("professional" → indigo, "social" → green, "personal" → purple) or user-chosen `cardColor`

### Public Profile Page Redesign (`/p/:slug`)
- Full redesign to match the card's visual language: same hero gradient, wave separator, and accent color
- Avatar size is now driven by the `photoSize` slider (60–240px) set in the profile editor
- Background opacity slider in editor now controls the hero section tint on the public page
- All social links (email, phone, website, etc.) are fully clickable with correct `mailto:`, `tel:`, and `https://` prefixes
- Vertical scrolling supported for profiles with many links/bio text

### "Preview as others see it" Fix
- Replaced broken iframe modal approach with direct navigation to `/p/:slug?preview=1`
- Public profile page detects `?preview=1` and shows a floating back button — no app download required to view via QR scan

### Dynamic Accent Color Theming
- Active card's accent color is applied globally via CSS custom property `--app-accent` on `document.documentElement`
- Bottom tab bar active icon now uses accent color instead of hardcoded blue
- Header logo circle, "QrMingle" wordmark, and avatar background now all use accent color
- Settings page header gradient replaced with accent color
- Scan page icon background uses accent color
- Analytics page chart colors (area, bar, progress bar, info banner) now use accent color

### Profile Editor Slider Fix (iOS)
- Replaced Radix UI `Slider` components for "Photo Size" and "Background Opacity" with native `<input type="range">` — fixes frozen/unresponsive sliders in iOS WKWebView (Capacitor)
- Both sliders now labeled "(profile view)" to clarify they only affect the public profile page, not the card

### Share / Copy Fix (iOS)
- Fixed silent failure when tapping Share on iOS WKWebView where `navigator.clipboard` is unavailable
- Added `document.execCommand("copy")` fallback via a temporary off-screen textarea element

### Standalone Demo Build (iPhone without laptop)
- Added Capacitor bundled mode detection: `window.location.protocol === "capacitor:"`
- All API calls now prefixed with `https://qrmingle.com` when running as a bundled Capacitor app (no dev server)
- `capacitor.config.ts` `server.url` block is commented out for demo/release builds, uncommented for local dev

### Layout Fixes
- Fixed white space gap between card and bottom tab bar
- Fixed horizontal scroll reappearing after card redesign (avatar kept inside photo section using `position: absolute` instead of negative margin)
- `CLAUDE.md` added to repo with architecture docs, commands, and iOS build notes

---

## Earlier releases

See git log for prior fixes: z-index on bottom bar, social links, safe-area overflow, profile editor overlay.
