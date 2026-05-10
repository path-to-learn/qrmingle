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
| B1 | Horizontal scroll in ProfileEditor on iOS — fix applied by Codex (v2026.05.09.1), needs device verification |
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
