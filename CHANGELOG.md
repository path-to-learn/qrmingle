# QRMingle Changelog

## [Phase 1] - 2026-03-21 — Local Dev Setup & Cleanup

### Branch: `cleanup/phase-1`

---

### 🐛 Bug Fixes

#### `server/index.ts`
- **Removed `reusePort: true`** from `server.listen()` call
  - `reusePort` is a Linux-only socket option — crashes on macOS Sequoia
  - Replit runs Linux so this was never caught in production
  - Replaced with simple `server.listen(port, callback)` — works on all platforms
- **Removed `host: "0.0.0.0"`** from listen options
  - Not needed for local development
  - Caused `ENOTSUP` error on macOS
- **Added `import "dotenv/config"`** as first line
  - Replit auto-injects environment variables — local dev does not
  - Without this, `DATABASE_URL` and all other secrets were undefined locally

#### `server/storage.ts`
- **Removed `pushSchema()` method**
  - Was calling `npm run db:push` (drizzle-kit) on every server startup
  - `drizzle-kit v0.18.1` doesn't support the `push` command — crashes on startup
  - Schema push should be a manual step, never automatic on boot
- **Removed auto-migration from `initializeStorage()`**
  - Removed unused imports: `migrate` from `drizzle-orm/postgres-js/migrator` and `db`
  - Kept demo user creation logic intact

#### `server/db.ts`
- **Swapped `@neondatabase/serverless` for standard `postgres` driver**
  - Neon's serverless driver uses HTTP and only works with Neon cloud databases
  - Standard `postgres` driver works with any PostgreSQL instance (local, Neon, Supabase, Railway etc.)
  - This makes the codebase portable — no longer locked to Neon
  - Changed import from `drizzle-orm/neon-http` to `drizzle-orm/postgres-js`

---

### 📦 Dependencies Added

| Package | Version | Reason |
|---|---|---|
| `dotenv` | latest | Load `.env` file in local development |
| `postgres` | latest | Standard Postgres driver — replaces Neon-specific driver |
| `drizzle-kit` | latest | Updated from v0.18.1 which lacked `push` command support |

---

### 🛠️ Local Development Setup

The following infrastructure was set up to enable safe local development:

#### Local Database (Docker)
- PostgreSQL running in Docker container `qrmingle-local`
- Completely isolated from production — safe to experiment
- Start with: `docker start qrmingle-local`
- Stop with: `docker stop qrmingle-local`
- Connection: `postgresql://postgres:localpassword@localhost:5432/qrmingle`

#### Environment Variables
- `.env` file created at project root (not committed to Git)
- Contains `DATABASE_URL` pointing to local Docker Postgres
- Production Replit DB URL kept commented out for reference
- `.env` must be added to `.gitignore` (Task 2 cleanup)

#### Schema Migration
- Run once to create all tables in local DB: `npm run db:push`
- Only needs to be re-run when `shared/schema.ts` changes
- Never runs automatically on server startup anymore

---

### ⚠️ Known Issues (To Fix in Next Phases)

| Issue | File | Priority |
|---|---|---|
| Vite deprecation warnings on startup | `vite.config.ts` | Low |
| `@vitejs/plugin-react` incompatible with Vite 8 | `package.json` | Medium |
| Log files committed to Git repo | `.gitignore` | High — Phase 2 |
| `data-store.json` in public repo | root | High — Phase 2 |
| `session/` folder in public repo | root | High — Phase 2 |
| Python/Flask server — purpose unclear | `python_server/` | Medium — Phase 2 |
| `replit_agent/` folder not needed | root | Low — Phase 2 |
| No `README.md` with setup instructions | root | Medium — Phase 2 |

---

### ✅ How To Run Locally After This Phase

```bash
# 1. Make sure Docker is running
docker start qrmingle-local

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Run the app
npm run dev

# 4. Open in browser
open http://localhost:5000
```

---

### 🔜 Phase 2 Preview — Security & Cleanup

- Fix `.gitignore` to exclude logs, PIDs, session data, `.env`
- Audit and remove `data-store.json` from public repo
- Audit and remove `session/` folder from public repo
- Investigate Python server — keep or delete
- Remove `replit_agent/` folder
- Write proper `README.md`
