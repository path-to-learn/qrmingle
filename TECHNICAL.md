# QrMingle — Technical Architecture

> This document is written for AI agents (Codex, Claude Code, etc.) and engineers onboarding to the project. It covers full-stack architecture, iOS specifics, authentication, and all major decisions made to date.

---

## 1. Project Overview

QrMingle is a digital business card app. Users create profile cards with social links, generate a QR code, and share it — scanners land on a public profile page. The primary platform is **iPhone (Capacitor iOS app)**; the web version is secondary.

**Live URL:** https://www.qrmingle.com  
**Stable git tag:** `v1.1-stable` (forgot-password + AI card builder working on iOS)

---

## 2. Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Wouter (routing), TanStack Query v5 |
| Backend | Node.js + Express (TypeScript), single process serves API + static assets |
| Database | PostgreSQL via **Neon** serverless (connection pooling built-in) |
| ORM | Drizzle ORM + drizzle-kit for migrations |
| Auth | Passport.js local strategy + express-session (sessions in PostgreSQL) |
| iOS | Capacitor 7 — wraps the React app in a native WKWebView |
| Hosting | **Railway** (auto-deploys on push to `main`) |
| Email | SendGrid (`@sendgrid/mail`) |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` |
| Payments | Stripe (web); Apple IAP / StoreKit 2 (iOS — app flow implemented; production readiness still needs validation) |
| i18n | react-i18next (EN, ES, FR, PT, AR, JA) |

---

## 3. Repository Layout

```
/
├── client/src/               # React frontend
│   ├── App.tsx               # Wouter router, layout shell, BottomTabBar
│   ├── pages/                # One file per route
│   ├── components/
│   │   ├── profile/          # ProfileCard, ProfileEditor, ImageCropper, ThemePicker
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-auth.tsx      # AuthContext — user state, login/register/logout mutations
│   │   └── use-toast.tsx
│   ├── lib/
│   │   └── queryClient.ts    # API_BASE, capacitorHeaders(), apiRequest(), TanStack queryClient
│   ├── data/
│   │   └── themes/           # FIFA 2026 and other event theme configs (data, not code)
│   └── locales/              # en.json, es.json, fr.json, pt.json, ar.json, ja.json
├── server/
│   ├── index.ts              # Express app entry, Vite middleware
│   ├── routes.ts             # Mounts all sub-routers, CORS, AASA, Vite fallback
│   ├── auth.ts               # Passport setup, /api/auth/* endpoints
│   ├── middleware.ts          # capacitorAuthMiddleware, requireAuth, requireAdmin
│   ├── storage.ts            # All DB queries (Drizzle) — single storage object
│   ├── db.ts                 # Neon + Drizzle client init
│   ├── limiters.ts           # express-rate-limit instances
│   └── routes/
│       ├── profiles.ts       # CRUD for profiles + photo/background upload
│       ├── analytics.ts      # Per-profile scan analytics
│       ├── ai.ts             # POST /api/ai/card-assist (Claude Haiku)
│       ├── admin.ts          # Admin-only endpoints (reset AI count, promote user, etc.)
│       ├── payments.ts       # Stripe trial + IAP verify/restore
│       └── misc.ts           # forgot-password, reset-password, contact form, tutorial video
├── shared/
│   └── schema.ts             # Drizzle table definitions + Zod schemas (shared by client + server)
├── scripts/
│   └── patch-cap-config.mjs  # Patches IAPPlugin back into capacitor.config.json after cap copy
├── ios/                      # Capacitor-generated Xcode project
│   └── App/App/
│       ├── App.entitlements  # Associated Domains (Universal Links)
│       └── capacitor.config.json  # Auto-generated; do not edit manually
├── capacitor.config.ts       # Capacitor config source of truth
├── CLAUDE.md                 # Claude Code instructions
├── RELEASE.md                # Release status + local dev checklist
└── TECHNICAL.md              # This file
```

---

## 4. Path Aliases (Vite + TypeScript)

```
@/        → client/src/
@shared/  → shared/
@assets/  → attached_assets/
```

---

## 5. Database Schema (`shared/schema.ts`)

All tables defined with Drizzle ORM. `shared/schema.ts` is imported by both client and server — it is the single source of truth for DB structure and Zod validation.

### Tables

| Table | Key columns |
|-------|-------------|
| `users` | `id`, `username` (email), `password` (scrypt+salt), `isPremium`, `isAdmin`, `aiAssistCount`, `stripeCustomerId`, `trialExpiresAt` |
| `profiles` | `id`, `userId`, `name`, `displayName`, `title`, `bio`, `photoUrl`, `backgroundUrl`, `cardColor`, `slug` (unique URL slug), `themeId`, `teamId`, `scanCount` |
| `social_links` | `id`, `profileId`, `platform`, `url` |
| `scan_logs` | `id`, `profileId`, `timestamp`, `country`, `countryCode`, `city`, `device`, `browser`, `ipAddress` |
| `session` | `sid`, `sess` (JSONB), `expire` — express-session via connect-pg-simple |
| `password_reset_tokens` | `token`, `userId`, `expiresAt` |
| `reviews` | Admin-managed testimonials shown on landing page |
| `contact_messages` | Messages sent via public profile contact form |

### Migrations
Edit `shared/schema.ts` → run `npm run db:push` (drizzle-kit pushes schema to Neon).

---

## 6. Server Architecture

### Entry point
`server/index.ts` — creates Express app, calls `registerRoutes()`, sets up Vite dev middleware (dev) or serves `dist/public` (production).

### Route structure
```
app
├── /.well-known/apple-app-site-association  → Universal Links AASA JSON
├── /uploads/*                               → static file serving (uploaded images/videos)
├── /p/:slug                                 → serves React SPA (public profile page)
└── /api/*   (express.Router `api`)
    ├── [capacitorAuthMiddleware applied here — runs before all /api routes]
    ├── /api/auth/*           → Passport login, register, logout, validate (setupAuth in auth.ts)
    ├── /api/profiles/*       → profilesRouter (CRUD + photo upload)
    ├── /api/analytics/*      → analyticsRouter (scan stats per profile)
    ├── /api/ai/*             → aiRouter (card-assist endpoint)
    ├── /api/admin/*          → adminRouter (requireAdmin middleware)
    ├── /api/reviews/*        → reviewsRouter
    ├── /api/forgot-password  → miscRouter
    ├── /api/reset-password   → miscRouter
    ├── /api/iap/*            → miscRouter (StoreKit receipt verify/restore)
    ├── /api/contact-form     → miscRouter
    └── /api/p/:slug          → handlePublicProfile (returns profile JSON for QR landing page)
```

### Storage layer (`server/storage.ts`)
All database access goes through a single `storage` object. No raw Drizzle queries outside this file. Key methods:
- `getUser(id)`, `getUserByUsername(username)`
- `createProfile`, `updateProfile`, `deleteProfile`, `getProfilesByUserId`
- `getProfileBySlug` — used by the public QR landing page
- `createScanLog` — called on every public profile view
- `incrementAiAssistCount(userId)`, `resetAiAssistCount(username)`
- `createPasswordResetToken`, `getPasswordResetToken`, `deletePasswordResetToken`
- `sessionStore` — connect-pg-simple instance used by express-session

---

## 7. Authentication

### Web (browser)
Standard cookie-based session auth. Passport.js local strategy. Sessions stored in PostgreSQL `session` table via connect-pg-simple.

Cookie settings (production):
```typescript
secure: true, httpOnly: true, sameSite: 'none', maxAge: 7 days
```

`sameSite: 'none'` is required for the Capacitor flow (cross-origin POST from `capacitor://localhost`).

### iOS standalone (Capacitor) — X-Session-Id header auth

**Problem:** WKWebView ITP (Intelligent Tracking Prevention) blocks third-party cookies on cross-origin POST requests. Even with `SameSite=None`, the session cookie is not sent on POST from the bundled Capacitor app (`capacitor://localhost` origin → `qrmingle.com` API).

**Solution:** Custom header-based session lookup.

1. **Login response** includes `sessionId: req.sessionID` in the JSON body
2. **Client** (`use-auth.tsx`) saves it: `localStorage.setItem('capacitor-session-id', sessionId)`
3. **Every fetch** via `capacitorHeaders()` in `queryClient.ts` adds `X-Session-Id: <sid>` header
4. **Server** `capacitorAuthMiddleware` (runs before all `/api` routes) looks up the session from PostgreSQL by `sid`, resolves `req.user`

```typescript
// server/middleware.ts — capacitorAuthMiddleware
const rows = await db.select().from(sessions)
  .where(and(eq(sessions.sid, sessionId), gt(sessions.expire, new Date())));
const userId = rows[0].sess?.passport?.user;
const user = await storage.getUser(userId);
if (user) req.user = user;
```

```typescript
// client/src/lib/queryClient.ts — capacitorHeaders()
export function capacitorHeaders(base = {}) {
  const headers = { ...base };
  if (isCapacitorBundled) {  // window.location.protocol === "capacitor:"
    const sid = localStorage.getItem('capacitor-session-id');
    if (sid) headers['X-Session-Id'] = sid;
  }
  return headers;
}
```

`requireAuth` and `requireAdmin` both check `req.user || req.isAuthenticated()` so both auth paths work.

### Password hashing
scrypt with random salt. Format stored in DB: `<hex-hash>.<hex-salt>`. Demo user (`demo`/`demo`) bypasses hashing.

### Admin
Admin status (`isAdmin: true`) grants access to `/api/admin/*`. The main admin account is `dathwal@qrmingle#2025` (set at registration). Admin can: reset AI counts, promote users, send reset emails, view analytics.

---

## 8. Frontend Architecture

### State management
TanStack Query v5 manages all server state. Query keys are URL strings (e.g. `['/api/profiles']`). Default `staleTime: Infinity` — data is never considered stale automatically; mutations call `queryClient.invalidateQueries()` to trigger re-fetches.

### API calls
All API calls go through `client/src/lib/queryClient.ts`:
- `apiRequest(method, url, data)` — for mutations; throws on non-ok via `throwIfResNotOk`
- `getQueryFn` — default query function used by TanStack Query; handles 401
- `capacitorHeaders(base?)` — merges `X-Session-Id` into headers when running in Capacitor
- `API_BASE` — `""` in browser/dev, `"https://www.qrmingle.com"` in Capacitor standalone

**Important:** Every `fetch()` call in the codebase must use `API_BASE + url` and `capacitorHeaders()`. Raw `fetch('/api/...')` fails in Capacitor standalone because relative URLs resolve to `capacitor://localhost/api/...` (the local bundle, not Railway).

### Auth context (`client/src/hooks/use-auth.tsx`)
- Wraps the whole app; validates session on mount via `GET /api/auth/validate`
- Exposes `user`, `loginMutation`, `registerMutation`, `logoutMutation`
- `isEffectivelyPremium()` — returns true for paid premium users, admins, and the hardcoded admin email
- On login/register success: saves `sessionId` to localStorage (Capacitor auth)
- On logout: clears `sessionId` from localStorage

### Frontend routes (Wouter)

| Path | Component | Auth required |
|------|-----------|--------------|
| `/` | Home | No |
| `/profiles` | CardsPage | Yes |
| `/p/:slug` | ProfilePage | No (public) |
| `/analytics` | Analytics | Yes |
| `/admin` | Admin | Yes + isAdmin |
| `/premium` | Premium | Yes |
| `/login`, `/register` | Login, Register | No |
| `/forgot-password` | ForgotPassword | No |
| `/settings` | Settings | Yes |
| `/scan` | Scan | No |

---

## 9. iOS / Capacitor

### How it works
Capacitor wraps the Vite-built React app in a native WKWebView. The iOS app is built with Xcode from `ios/App/App.xcworkspace`.

### Two build modes

| Mode | `server.url` in `capacitor.config.ts` | `API_BASE` in client | When to use |
|------|--------------------------------------|----------------------|-------------|
| **Dev (live-reload)** | Uncommented, points to `http://<mac-ip>:5000` | `""` (relative, hits local server) | Daily development |
| **Standalone (release)** | Commented out | `"https://www.qrmingle.com"` | TestFlight / App Store |

Detection: `window.location.protocol === "capacitor:"` is `true` only in standalone mode.

### Local dev commands
```bash
npm run dev           # start Express + Vite (port 5000)
npm run build         # build frontend to dist/public
npm run cap:copy      # cap copy ios + patch IAPPlugin (use this, not bare npx cap copy ios)
```
Open `ios/App/App.xcworkspace` in Xcode (not `.xcodeproj`).

### IAPPlugin patching
`npx cap copy ios` auto-generates `ios/App/App/capacitor.config.json` from `capacitor.config.ts`. Capacitor only knows about npm-installed plugins; `IAPPlugin` is a custom native Swift plugin, so it gets dropped from `packageClassList` every time.

`npm run cap:copy` runs `scripts/patch-cap-config.mjs` after copy, which merges `IAPPlugin` back in. **Always use `npm run cap:copy`.**

### Universal Links (T3 — done)
- `GET /.well-known/apple-app-site-association` served by Express → tells iOS which URL paths open the app
- `ios/App/App/App.entitlements` has `applinks:qrmingle.com` and `applinks:www.qrmingle.com`
- Effect: clicking a password reset email link opens the app instead of Safari

### iOS layout rules (critical — recurring bug)
iOS WebKit has a persistent horizontal overflow bug. Rules enforced via global CSS + layout conventions:

1. Never use `flex flex-col items-center` without `w-full` — container shrink-wraps and `width: 100%` children overflow
2. Fixed/absolute overlays must set `width: 100vw; max-width: 100vw; overflow-x: hidden` — not just `right: 0`
3. Scrollable panels need both `overflow-y: auto` AND `overflow-x: hidden` explicitly
4. **Critical:** Never put both `overflow-y: auto` AND `overflow-x: hidden` on the same element inside a fixed overlay — iOS WebKit expands the scroll-width. Instead, make the `position: fixed; left: 0; right: 0` element itself the scroll container

---

## 10. AI Card Builder (`/api/ai/card-assist`)

**File:** `server/routes/ai.ts`

Two modes:
- `writer` — user types a free-text description; Claude returns `{ name, title, bio, suggestedLinks }` JSON; ProfileEditor pre-fills form fields
- `tips` — after card built; Claude returns array of 2-3 improvement suggestions

Rate limiting:
- Free users: 2 AI assists total (`aiAssistCount` on user row)
- Premium: unlimited
- Count incremented server-side after each successful call; reset via `POST /api/admin/reset-ai-count`

Model: `claude-haiku-4-5-20251001` (fast, cheap ~$0.001–0.003/call)

**Client-side (`ProfileEditor.tsx`):** Uses raw `fetch` with `API_BASE + capacitorHeaders()` — not `apiRequest()` — so the response can be inspected before throwing (to handle `AI_LIMIT_REACHED` type specially).

---

## 11. Forgot Password / Email Reset

**Files:** `server/routes/misc.ts` (self-serve), `server/routes/admin.ts` (admin-triggered)

Flow:
1. User submits email → `POST /api/forgot-password`
2. Server creates a `password_reset_tokens` row (token = 32 random bytes hex, expires in 1 hour)
3. SendGrid sends email with link: `https://www.qrmingle.com/forgot-password?token=<token>`
4. User clicks link → app opens (Universal Links) → `ForgotPassword` page reads `?token` from URL
5. User submits new password → `POST /api/reset-password` → token validated, password updated, token deleted

**Env vars required:** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (or defaults to `noreply@qrmingle.com`), `APP_URL` (defaults to `https://www.qrmingle.com`)

---

## 12. Event Themes (FIFA World Cup 2026)

Theme data lives in `client/src/data/themes/` — configuration objects, no server logic.

Each theme config contains: `id`, `name`, active date range, teams array (each with `id`, name, flag, color palette), player lists.

Profiles store `themeId` (e.g. `'fifa-2026'`) and `teamId` (e.g. `'arg'`) columns. The public profile page reads these to render the fan card theme.

Adding a new theme = drop a new config file + register it. Zero server changes.

---

## 13. Payments / Premium

### Web — Stripe
`POST /api/start-premium-trial` creates a Stripe trial subscription. Stripe must not be presented inside the iOS app for digital premium features.

### iOS — Apple IAP / StoreKit 2
The iOS purchase flow is implemented through the custom Capacitor `IAPPlugin`, `client/src/lib/iap.ts`, and `client/src/pages/premium.tsx`. Current launch pricing is `$2.99` monthly (`com.qrmingle.app.pro.monthly`), `$19.99` yearly (`com.qrmingle.app.pro.yearly`), and `$39.99` lifetime (`com.qrmingle.app.pro.lifetime`). `POST /api/iap/verify` and `POST /api/iap/restore` mark the user premium after StoreKit transactions. Before paid App Store launch, complete App Store Connect monetization setup, validate sandbox/TestFlight purchase and restore, submit the IAPs/subscriptions with the app for review, and add subscription entitlement lifecycle hardening.

---

## 14. CORS

Allowed origins (production):
```
https://www.qrmingle.com
https://qrmingle.com
capacitor://localhost      ← Capacitor standalone iOS app
http://localhost:5000
http://10.0.0.x:5000      ← local dev over LAN
```

Allowed headers include `X-Session-Id` (required for Capacitor auth).

---

## 15. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `SESSION_SECRET` | Yes (prod) | express-session signing key |
| `ANTHROPIC_API_KEY` | Yes | Claude Haiku API key for AI card builder |
| `SENDGRID_API_KEY` | For email | SendGrid key for password reset emails |
| `SENDGRID_FROM_EMAIL` | No | Sender address (default: `noreply@qrmingle.com`) |
| `STRIPE_SECRET_KEY` | For web payments | Stripe secret key |
| `APP_URL` | No | Base URL (default: `https://www.qrmingle.com`) |

Local dev: set in `.env` file (gitignored). Production: set in Railway dashboard.

---

## 16. Key Decisions & Why

| Decision | Reason |
|----------|--------|
| X-Session-Id header auth | WKWebView ITP blocks cross-origin cookies on POST — even `SameSite=None` is insufficient. Header-based session lookup is the only reliable solution for Capacitor iOS. |
| `capacitorHeaders()` on every fetch | Bare `fetch('/api/...')` resolves to `capacitor://localhost/api/...` in standalone mode — 404. Must use `API_BASE` prefix + session header. |
| `staleTime: Infinity` + explicit `invalidateQueries` | Prevents unexpected background re-fetches; mutations trigger targeted cache invalidation. |
| Drizzle over Prisma | Better Neon serverless compatibility, lighter weight for this scale. |
| Single Express process (no separate API server) | Simpler Railway deployment; Vite middleware in dev, static serving in prod — one port, one process. |
| Theme data in client, not server | Themes are display config; no DB queries needed for them. Adding a theme requires no server deploy. |
| `npm run cap:copy` instead of bare `npx cap copy ios` | Ensures `IAPPlugin` always survives the copy (see §9). |

---

## 17. Branch & Review Workflow

### Rule
**Never commit or push directly to `main`.** Railway auto-deploys on every push to `main`, so only reviewed code should land there.

### Branches
| Branch | Purpose |
|--------|---------|
| `main` | Production — Railway deploys from here automatically |
| `dev/main` | Ongoing development work (current active branch) |
| `dev/<feature>` | Isolated feature branches when needed |

### Step-by-step process

#### 1. Start work on a dev branch
```bash
git checkout dev/main          # continue ongoing work
# or for an isolated feature:
git checkout -b dev/<feature-name>
```

#### 2. Make changes and commit
```bash
git add <files>
git commit -m "feat: describe the change"
git push origin dev/main       # or dev/<feature-name>
```

#### 3. Codex agent reviews
- Point Codex at `TECHNICAL.md` so it understands the architecture
- Ask Codex to review the diff on the branch: `git diff main...dev/main`
- Codex checks for correctness, security issues, iOS-specific pitfalls (see §9), and architectural consistency

#### 4. Merge to main after approval
```bash
git checkout main
git merge dev/main             # or dev/<feature-name>
git push origin main           # triggers Railway deploy (~1 min)
git checkout dev/main          # switch back to dev branch
```

#### 5. Tag stable milestones
After a significant set of features is confirmed working on the live iPhone:
```bash
git tag -a v<major>.<minor>-stable -m "Short description of what's stable"
git push origin v<major>.<minor>-stable
```

Current stable tag: `v1.1-stable` (forgot-password + AI card builder working on iOS, 2026-05-09)

### What Codex should check
When reviewing a diff, Codex should verify:
1. All `fetch()` calls use `API_BASE + url` and `capacitorHeaders()` — not bare relative URLs (§8)
2. New POST/PUT/DELETE routes are covered by `requireAuth` or `requireAdmin` middleware
3. iOS layout changes follow the overflow rules in §9 (no `flex-col items-center` without `w-full`)
4. Any new admin-only operations are behind `adminRouter` (which applies `requireAdmin`)
5. No secrets or credentials committed
6. `shared/schema.ts` changes are followed by `npm run db:push`
