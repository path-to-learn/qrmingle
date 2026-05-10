# iOS Release Tracker

Last updated: 2026-05-09 | Stable tag: `v1.1-stable`

## Completed ✅

| Item | Description |
|------|-------------|
| F1 | AI card builder — "Fill profile with AI" working on iOS standalone |
| F2 | FIFA World Cup 2026 fan cards |
| F3 | Forgot password — SendGrid reset emails (admin-triggered + self-serve) |
| F4 | Multilingual support (EN, ES, FR, PT, AR, JA) |
| T2 | Railway migration + Neon DB + DNS cutover |
| T3 | Universal Links — AASA served from Express, Associated Domains entitlement in Xcode |
| E1 | `ANTHROPIC_API_KEY` set in Railway prod env |
| iOS auth | X-Session-Id header auth bypasses WKWebView ITP on iOS standalone builds |

## Before App Store Submission 🔲

| Item | Owner | Description |
|------|-------|-------------|
| A3 | Prashant | App Store Connect — screenshots, age rating questionnaire, app description, pricing, privacy policy URL |

## Post-Launch (not blockers) 🗓️

| Item | Description |
|------|-------------|
| T1 | Apple IAP / StoreKit 2 — needed before charging money; premium currently open to all |
| T4 | Sign in with Apple — only required if Google/Facebook login is added |
| F5 | Voice-to-card — speak → AI fills profile form |
| F6 | Scan physical business card → OCR → AI imports contacts |

## Known Issues / Tech Debt

| ID | Description |
|----|-------------|
| B1 | Horizontal scroll in ProfileEditor on iOS (native WKWebView UIScrollView — CSS fixes exhausted) |
| — | `npx cap copy ios` wipes IAPPlugin from `ios/App/App/capacitor.config.json` — re-add manually after each run |
| — | AI assist count shown to user is from cached auth object — requires logout/login to refresh after admin reset |

## Key Architecture Notes (iOS-specific)

- **Capacitor standalone**: `window.location.protocol === "capacitor:"` — all fetch calls need `API_BASE = "https://www.qrmingle.com"` prefix
- **Auth**: Session ID saved to localStorage on login, sent as `X-Session-Id` header; `capacitorAuthMiddleware` in Express resolves it
- **After `npx cap copy ios`**: Always re-add `IAPPlugin` to `ios/App/App/capacitor.config.json` under `packageClassList`
- **iOS dev**: Uncomment `server.url` in `capacitor.config.ts` for live-reload; comment out before building for App Store / TestFlight
