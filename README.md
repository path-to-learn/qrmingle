# QRMingle 🔗

> Digital AI profile cards with QR codes — connect with anyone, anywhere.

QRMingle lets you create beautiful digital business cards with custom QR codes. Share your profile instantly at events, meetups, and conferences. No paper, no typos, no friction.

---

## ✨ Features

- **Digital profile cards** — photo, bio, title, social links, custom colors and layouts
- **Custom QR codes** — choose color, size, style and position
- **Public profile URL** — shareable link that anyone can open without an account
- **Scan analytics** — track who scanned your QR, from where, on what device
- **Multiple profiles** — personal, business, event — switch between them instantly
- **Contact messaging** — visitors can message you directly from your profile
- **Premium tier** — free trial + Stripe payments
- **Apple Wallet** — add your QR card to your iPhone lock screen
- **iOS app** — native iPhone app via Capacitor

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Drizzle ORM) |
| Auth | Passport.js (local strategy) |
| Payments | Stripe |
| Mobile | Capacitor (iOS + Android) |
| QR Code | qrcode.react |

---

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js 18+** — `node --version`
- **npm** — comes with Node
- **Docker Desktop** — for local PostgreSQL ([docker.com](https://docker.com/products/docker-desktop))
- **Git** — `git --version`
- **Xcode** (Mac only, for iOS development) — Mac App Store

---

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone git@github.com:path-to-learn/qrmingle.git
cd qrmingle
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

> Note: `--legacy-peer-deps` is required due to a Vite version conflict being resolved in a future cleanup phase.

### 3. Start local PostgreSQL with Docker

```bash
docker run --name qrmingle-local \
  -e POSTGRES_PASSWORD=localpassword \
  -e POSTGRES_DB=qrmingle \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 -d postgres
```

To start it again after a machine restart:
```bash
docker start qrmingle-local
```

To stop it:
```bash
docker stop qrmingle-local
```

### 4. Set up environment variables

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following (copy and fill in your values):

```env
# Local database (Docker)
DATABASE_URL=postgresql://postgres:localpassword@localhost:5432/qrmingle

# Session secret - any random string works locally
SESSION_SECRET=your-local-secret-key-here

# Stripe (optional for local dev - leave blank to disable payments)
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=

# SendGrid (optional for local dev - leave blank to disable emails)
SENDGRID_API_KEY=
```

> ⚠️ Never commit `.env` to Git. It is already in `.gitignore`.

### 5. Create database tables

```bash
npm run db:push
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

**Default demo account:**
- Username: `demo`
- Password: `demo`

---

## 📁 Project Structure

```
qrmingle/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page-level components
│       └── hooks/           # Custom React hooks
├── server/                  # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # All API routes
│   ├── auth.ts              # Authentication setup
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer
│   └── vite.ts              # Vite integration
├── shared/
│   └── schema.ts            # Database schema (shared client + server)
├── ios/                     # Capacitor iOS project
├── uploads/                 # Uploaded files (videos, images)
├── capacitor.config.ts      # Mobile app configuration
├── drizzle.config.ts        # Database migration config
├── CHANGELOG.md             # What changed in each phase
└── CODEBASE_MAP.md          # Full technical reference
```

---

## 🗃️ Database

The app uses **PostgreSQL** with **Drizzle ORM**.

### Schema overview

| Table | Description |
|---|---|
| `users` | User accounts with premium/admin flags |
| `profiles` | Digital business cards (multiple per user) |
| `socialLinks` | Links attached to each profile |
| `scanLogs` | Every QR scan with location and device data |
| `reviews` | Landing page testimonials |
| `contactMessages` | Messages sent to profile owners |
| `sessions` | Postgres-backed user sessions |

### Useful database commands

```bash
# Push schema changes to database
npm run db:push

# View database in browser (Drizzle Studio)
npx drizzle-kit studio
```

---

## 📱 iOS App

The iOS app is built with **Capacitor** — it wraps the web app in a native shell.

### Prerequisites
- Mac with Xcode installed
- Apple Developer account ($99/year) — [developer.apple.com](https://developer.apple.com)

### Build and run on device

```bash
# Build the web app first
npm run build

# Sync web assets to iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode: select your iPhone as the target device and press **Run**.

---

## 🌿 Git Workflow

We use feature branches — never commit directly to `main`.

```bash
# Create a new branch for your work
git checkout -b feature/your-feature-name

# After testing, push to GitHub
git push origin feature/your-feature-name

# Open a Pull Request on GitHub to merge into main
```

### Branch naming conventions

| Prefix | Use for |
|---|---|
| `feature/` | New features |
| `cleanup/` | Code cleanup and refactoring |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ Yes | Secret key for session signing |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (payments) |
| `VITE_STRIPE_PUBLIC_KEY` | No | Stripe publishable key (frontend) |
| `SENDGRID_API_KEY` | No | SendGrid API key (emails) |

---

## 🚢 Deployment (Replit)

The production app runs on Replit.

1. Push changes to `main` branch on GitHub
2. In Replit — open the Git panel and pull latest
3. Run database migrations if schema changed: `npm run db:push`
4. Restart the Replit app

> ⚠️ Always test on local branch before merging to `main`.

---

## 📖 Additional Documentation

- [CHANGELOG.md](./CHANGELOG.md) — History of changes by phase
- [CODEBASE_MAP.md](./CODEBASE_MAP.md) — Full technical reference, all routes and schema

---

## 🗺️ Roadmap

- [x] Phase 1 — Local dev setup and cleanup
- [ ] Phase 2 — UI upgrade and World Cup features
- [ ] Phase 3 — iOS App Store submission
- [ ] Phase 4 — AI profile generation
- [ ] Phase 5 — Event Mode and marketing launch

---

## 📄 License

MIT
