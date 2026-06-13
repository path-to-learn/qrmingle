# iOS Release Tracker

Last updated: 2026-06-13 | Stable tag: `v1.1-stable`

## Completed ✅

| Item | Description |
|------|-------------|
| F1 | AI card builder — "Fill profile with AI" working on iOS standalone |
| F2 | FIFA World Cup 2026 fan cards |
| F3 | Forgot password — SendGrid reset emails (admin-triggered + self-serve) |
| F4 | Multilingual support (EN, ES, FR, PT, AR, JA) |
| F6 | Scan physical business card → AI extracts details → create QrMingle card — verified on iPhone (2026-05-18) |
| P1 | Premium pricing model + free limits — `$2.99` monthly, `$19.99` yearly, `$39.99` lifetime; free tier is 2 card profiles + 1 AI profile-builder use |
| T2 | Railway migration + Neon DB + DNS cutover |
| T3 | Universal Links — AASA served from Express, Associated Domains entitlement in Xcode |
| E1 | `ANTHROPIC_API_KEY` set in Railway prod env |
| iOS auth | X-Session-Id header auth bypasses WKWebView ITP on iOS standalone builds |

## Must Have During Launch / Before App Store Submission 🔲

| Order | Item | Owner | Description |
|-------|------|-------|-------------|
| 1 | A8 | Prashant + agents | TestFlight QR/share URL QA — verify inline QR, expanded QR, QR modal, share sheet, save contact, and QR widget all use `https://www.qrmingle.com/p/:slug` and open the correct public profile on another phone |
| 2 | A3 | Prashant | App Store Connect listing — screenshots, age rating questionnaire, app description, privacy policy URL |
| 3 | A4 | Prashant | App Store Connect monetization setup — create `QrMingle Pro` subscription group, add monthly/yearly/lifetime products with exact product IDs, complete Paid Apps Agreement, tax, and banking |
| 4 | A5 | Prashant + agents | StoreKit payment QA — verify `Products.storekit` prices, sandbox/TestFlight product loading, purchase Monthly/Yearly/Lifetime, cancel purchase sheet, and Restore Purchase |
| 5 | A6 | Agents | Subscription entitlement lifecycle hardening — add App Store Server Notifications or periodic entitlement refresh so expired/canceled/refunded subscriptions cannot remain Premium forever |
| 6 | A7 | Prashant + agents | Submit IAPs/subscriptions with app for App Review — products must be Ready to Submit/approved before paid launch |

## After Launch Backlog (sorted pickup order) 🗓️

| Order | Item | Description |
|-------|------|-------------|
| Done | ~~T1~~ | ~~Apple IAP / StoreKit 2~~ — **implemented** (IAPPlugin.swift + iap.ts + premium.tsx with getProducts/purchase/restore) |
| 1 | F7 | Apple Wallet offline contact pass — high-value differentiator. Add a signed `.pkpass` per profile with an offline vCard QR and QrMingle profile URL fallback, so users can share contact details from Apple Wallet when app login/internet is weak. Details below. |
| 2 | F5 | Voice-to-card — speak → AI fills profile form |
| 3 | T5 | Android port — backlog only; do not start Android implementation until Prashant explicitly reopens it. Planning reference: `ANDROID_PORT_PLAN.md` |
| 4 | T4 | Sign in with Apple — only required if Google/Facebook login is added |

### F7 — Apple Wallet Offline Contact Pass

**Why it matters**
- Solves the real networking failure case: user wants to share QrMingle but app login or internet is weak.
- Differentiates QrMingle as "always shareable, even with poor internet".
- Fits the iPhone mental model: open Apple Wallet, show pass, let the other person scan.

**Expected behavior**
- Each profile gets an `Add to Apple Wallet` action.
- QrMingle generates a signed `.pkpass` file for that profile.
- Apple Wallet pass displays QrMingle branding, profile name/title, and a scannable QR.
- QR payload should primarily be an offline vCard containing name, title, email, phone, website, and selected social links.
- QR payload should include the public QrMingle profile URL as fallback when internet is available.
- User can share from Wallet even if the QrMingle app cannot log in at that moment.

**Implementation tasks**
- Add Apple Wallet Pass Type ID in Apple Developer.
- Generate/download Pass Type certificate and store certificate/private key securely outside git.
- Add pass assets: icon, logo, pass colors, and optional strip image.
- Add backend route to generate a signed `.pkpass` for an authenticated user's profile.
- Use existing `passkit-generator` dependency if it fits current needs.
- Add profile action in iOS app: `Add to Apple Wallet`.
- Map profile fields to a safe vCard payload.
- Add fallback public URL to pass fields or QR payload.
- Test pass generation, add-to-wallet flow, QR scan, and offline behavior on a real iPhone.

**Security/permissions**
- Requires Prashant involvement for Pass Type ID and certificate/private-key handling.
- Do not commit certificates, private keys, passwords, or generated sensitive signing files.
- Store pass signing material in secure local storage or Railway/environment secrets if server-generated.

**Acceptance criteria**
- A user can add a profile pass to Apple Wallet.
- The pass remains usable after logout, app restart, or weak/no internet.
- Scanning the Wallet QR can save/import basic contact details without loading QrMingle.
- When internet is available, the QrMingle public profile URL remains reachable as the richer fallback.
- Profile edits have a clear behavior: either regenerate pass manually or support pass update flow in a later phase.

**Estimated effort**
- Static Wallet pass with offline vCard QR: 1-2 working days.
- Polished production version with UI, field mapping, error handling, and device QA: 2-4 working days.
- Auto-updating Wallet passes after profile edits: 4-7 working days and should be a later phase unless required.

## Known Issues / Tech Debt

| ID | Description |
|----|-------------|
| ~~B1~~ | ~~Horizontal scroll in ProfileEditor on iOS~~ — **fixed and verified on device (2026-05-09)** |
| — | AI assist count shown to user is from cached auth object — requires logout/login to refresh after admin reset |

## Local Development Checklist

### Every dev session (live-reload on device)
1. Start Docker → `qrmingle-local` container
2. Uncomment `server.url` in `capacitor.config.ts` — set IP to your Mac's current local IP (check with `ipconfig getifaddr en0`)
3. `npm run dev` — Express + Vite on port 5000
4. Xcode → select your iPhone → Run

### Every time you update web assets for device testing
```bash
npm run build        # build frontend
npm run cap:copy     # cap copy ios + auto-patches IAPPlugin (replaces bare `npx cap copy ios`)
# then Xcode → Run
```
> **Use `npm run cap:copy` instead of `npx cap copy ios` directly.**  
> The script runs the patch that adds IAPPlugin back to `packageClassList` — bare `cap copy` wipes it.

### Before App Store / TestFlight build
- Comment out `server.url` in `capacitor.config.ts`
- `npm run build && npm run cap:copy`
- Xcode → Product → Archive

### Why each step matters
| Step | Why |
|------|-----|
| `server.url` uncommented | Without it, Capacitor uses the bundled `dist/public` assets (stale). With it, the app live-reloads from your local Express server. |
| `server.url` commented out for release | Standalone app uses `capacitor://localhost` origin; `API_BASE` switches to `https://www.qrmingle.com` automatically. |
| `npm run cap:copy` not `npx cap copy ios` | Capacitor auto-generates `packageClassList` from npm plugins; IAPPlugin is a custom Swift plugin unknown to Capacitor, so bare `cap copy` drops it. The patch script adds it back. |
| Local IP must match Mac's actual IP | DHCP can reassign your IP. Run `ipconfig getifaddr en0` to check. |

## Key Architecture Notes (iOS-specific)

- **Capacitor standalone**: `window.location.protocol === "capacitor:"` — all fetch calls need `API_BASE = "https://www.qrmingle.com"` prefix
- **Auth**: Session ID saved to localStorage on login, sent as `X-Session-Id` header; `capacitorAuthMiddleware` in Express resolves it
- **AI assist count**: Cached in the auth context — requires logout/login to refresh after an admin reset
