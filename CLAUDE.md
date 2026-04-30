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
- `isEffectivelyPremium()` in `use-auth.tsx` returns `true` for any logged-in user — premium gating is currently disabled

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
Users can create up to 3 profiles. This is enforced server-side in `POST /api/profiles`. The `PROFILE_LIMIT_REACHED` error type is used client-side to show a specific dialog.
