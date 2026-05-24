# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start the Express + Vite dev server (port 5000)
npm run build      # Build frontend (Vite) + bundle server (esbuild) → dist/
npm run start      # Run production build
npm run check      # TypeScript type-check
npm run db:push    # Push schema changes to the database via Drizzle Kit
```

There are no automated tests. The `manual_test.py` and `test_*.py` files are one-off scripts, not a test suite.

## Agent handoff / review notes

- Use `AGENT_HANDOFF.local.md` for all Codex/Claude changelog, handoff, review, and verification notes.
- Do not create alternate review-note files such as `CLAUDE_REVIEW_NOTES.md`, `REVIEW_NOTES.md`, or duplicate handoff docs.
- Add a new versioned entry to `AGENT_HANDOFF.local.md` whenever making meaningful code changes, release decisions, or investigation findings.
- `AGENT_HANDOFF.local.md` is local/ignored by design, so it may not appear in `git status`.

## Architecture

**Stack**: React (TypeScript) + Express.js (TypeScript) + PostgreSQL (Neon serverless) + Capacitor (iOS)

The Node.js/Express server (`server/`) is the primary backend. It serves both the API and the Vite-built React app from a single process. The Python/Flask server (`python_server/`) is legacy infrastructure that is no longer the primary backend; the Node.js server handles everything.

### Key path aliases (vite.config.ts)
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Data flow
- All frontend API calls go through `client/src/lib/queryClient.ts` (`apiRequest`, `getQueryFn`)
- TanStack Query manages all server state; query keys are URL strings (e.g. `['/api/profiles', userId]`)
- Auth state lives in `client/src/hooks/use-auth.tsx` (`AuthContext`) and is validated server-side via `/api/auth/validate`

### Server structure
- `server/index.ts` — Express app setup, mounts routes and Vite middleware
- `server/routes.ts` — All API route handlers (`/api/...`)
- `server/auth.ts` — Passport.js local strategy, session setup, auth endpoints
- `server/storage.ts` — All DB access abstracted behind a `storage` object (the only place Drizzle queries run)
- `server/db.ts` — Drizzle + Neon client initialization

### Shared schema (`shared/schema.ts`)
Single source of truth for DB schema and Zod validation, imported by both server and client:
- Tables: `users`, `profiles`, `socialLinks`, `scanLogs`, `reviews`, `contactMessages`, `sessions`
- `profileFormSchema` is the Zod schema used to validate profile create/update requests

### Database
- Drizzle ORM with Neon serverless PostgreSQL
- `DATABASE_URL` env var required; `SESSION_SECRET` and `STRIPE_SECRET_KEY` are optional
- Schema changes: edit `shared/schema.ts`, then run `npm run db:push`
- Password hashing: scrypt with salt (`hex.salt` format) for all non-demo users

### Authentication
- Passport.js local strategy with express-session (sessions stored in PostgreSQL via connect-pg-simple)
- `username` field stores email addresses
- Admin user is hardcoded as `dathwal@qrmingle#2025`; admin status is set at registration
- `isEffectivelyPremium()` in `use-auth.tsx` returns `true` for `isPremium || isAdmin || prashant.dathwal@gmail.com` — StoreKit 2 IAP is implemented (`client/src/lib/iap.ts`, `ios/App/App/IAPPlugin.swift`, `client/src/pages/premium.tsx`)

### Frontend routes (wouter)
- `/` — Home/tutorial page
- `/profiles` — Main cards dashboard (`CardsPage`) — requires auth
- `/p/:slug` — Public profile view (QR landing page)
- `/analytics`, `/premium`, `/admin` — require auth

### iOS (Capacitor)
- `capacitor.config.ts` — bundle ID `com.qrmingle.app`, points to `http://10.0.0.179:5000` during dev
- Built web assets go to `client/dist/` for Capacitor
- iOS workspace at `ios/App/App.xcworkspace` (open this, not `.xcodeproj`)
- For local iOS dev, update the `server.url` in `capacitor.config.ts` to your machine's local IP

### Profile limit
Free users can create up to 2 profiles. Premium users can create unlimited profiles. This is enforced server-side in `POST /api/profiles`; shared limits and product IDs live in `shared/premium.ts`. The `PROFILE_LIMIT_REACHED` error type is used client-side to show a specific upgrade dialog.

### iOS / WebKit horizontal overflow — known gotcha
iOS WebKit has a recurring horizontal overflow bug. The global CSS in `index.css` already applies `* { max-width: 100% }`, `overflow-x: hidden` on html/body, and `.flex-col { width: 100% }`.

**Rules to follow when writing layout code:**
- Never write `flex flex-col items-center` without also adding `w-full`. Without it, the container shrink-wraps and any child with `width: 100%` (sliders, inputs) overflows.
- Fixed/absolute overlays must always set `width: 100vw; max-width: 100vw; overflow-x: hidden` — not just `right: 0`.
- Scrollable panels inside overlays need both `overflow-y: auto` AND `overflow-x: hidden` explicitly.
- Never rely on a single parent's `overflow-x: hidden` to contain a deeply nested overflow — set it at each scrollable boundary.
- NEVER wrap a scroll container with both `overflow-y: auto` AND `overflow-x: hidden` on the SAME element inside a fixed overlay. iOS WebKit expands the scroll-width for `overflow-y: auto`, then `width: 100%` children calculate against that expanded scroll-width instead of the viewport width. Instead, make the `position: fixed; left: 0; right: 0` element itself the scroll container — its width is definitively viewport width, so `width: 100%` always resolves correctly.
