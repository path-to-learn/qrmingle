# QRMingle — Complete Codebase Map
> Generated: 2026-03-21 | Branch: cleanup/phase-1

---

## 📁 Project Structure

```
qrmingle/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # Page components
│       └── hooks/           # Custom React hooks
├── server/                  # Node/Express backend
│   ├── index.ts             # Entry point
│   ├── routes.ts            # All API routes (1179 lines)
│   ├── auth.ts              # Passport authentication
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer
│   └── vite.ts              # Vite dev server integration
├── shared/
│   └── schema.ts            # Drizzle ORM schema (shared by client + server)
├── ios/                     # Capacitor iOS project (already scaffolded)
├── uploads/                 # File uploads (videos, images)
├── capacitor.config.ts      # iOS/Android app config
├── drizzle.config.ts        # Database migration config
├── tailwind.config.ts       # Tailwind CSS config
├── vite.config.ts           # Vite bundler config
└── package.json             # Dependencies
```

---

## 🗄️ Database Schema (shared/schema.ts)

### `users` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | Auto increment |
| username | text | Unique, used as email |
| password | text | Hashed |
| isPremium | boolean | Default false |
| isAdmin | boolean | Default false |
| trialExpiresAt | timestamp | Premium trial expiry |
| stripeCustomerId | text | Stripe integration |

### `profiles` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| userId | integer FK | Links to users |
| name | text | Full name |
| displayName | text | Shown on card |
| title | text | Job title |
| bio | text | Profile bio |
| photoUrl | text | Profile photo |
| photoSize | integer | Default 120px |
| backgroundUrl | text | Virtual background |
| backgroundOpacity | integer | 0-100, default 100 |
| cardColor | text | Default #ffffff |
| qrStyle | text | basic / etc |
| qrColor | text | Default #3B82F6 |
| qrSize | integer | Default 150px |
| qrPosition | text | top/bottom/left/right |
| photoPosition | text | top/left/right/hidden |
| layoutStyle | text | standard/compact/centered/minimal |
| slug | text | Unique public URL identifier |
| scanCount | integer | Total QR scans |
| createdAt | timestamp | |
| hasArEnabled | boolean | AR feature flag |
| arModelUrl | text | AR 3D model |
| arScale | integer | AR model scale |
| arAnimationEnabled | boolean | AR animation toggle |

### `socialLinks` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| profileId | integer FK | Links to profiles |
| platform | text | LinkedIn, Twitter etc |
| url | text | Link URL |

### `scanLogs` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| profileId | integer FK | |
| timestamp | timestamp | When scanned |
| location | text | |
| country | text | |
| countryCode | text | |
| city | text | |
| device | text | |
| browser | text | |
| os | text | |
| referrer | text | |
| ipAddress | text | |

### `reviews` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | Reviewer name |
| title | text | Job title/company |
| content | text | Review text |
| avatarUrl | text | |
| rating | integer | 1-5 stars |
| isVisible | boolean | Admin toggle |
| createdAt | timestamp | |

### `contactMessages` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| profileId | integer FK | |
| name | text | Sender name |
| email | text | Sender email |
| message | text | |
| isRead | boolean | Default false |
| createdAt | timestamp | |

### `sessions` table
| Column | Type | Notes |
|---|---|---|
| sid | text PK | Session ID |
| sess | jsonb | Session data |
| expire | timestamp | Expiry |

---

## 🔌 API Routes (server/routes.ts + server/auth.ts)

### Authentication (server/auth.ts)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Login with username/password |
| POST | `/api/auth/logout` | No | Logout current session |
| GET | `/api/auth/validate` | No | Check if user is logged in |

### Password Reset
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/forgot-password` | No | Generate reset token |
| POST | `/api/reset-password` | No | Reset password with token |

> ⚠️ Reset tokens stored in memory (Map) — lost on server restart. Should be moved to database.

### Profiles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/profiles` | Yes | Get all profiles for logged-in user |
| POST | `/api/profiles` | Yes | Create new profile |
| GET | `/api/profiles/:id` | Yes | Get profile by ID |
| PUT | `/api/profiles/:id` | Yes | Update profile |
| DELETE | `/api/profiles/:id` | Yes | Delete profile |
| GET | `/api/p/:slug` | No | Get public profile by slug (increments scan count) |

### Contact
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact-form` | No | Send message to profile owner |
| GET | `/api/contact-messages/:profileId` | Yes | Get messages for a profile |
| PATCH | `/api/contact-messages/:id/read` | Yes | Mark message as read |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/profile/:id` | No | Get scan analytics for profile |

### Premium / Payments (Stripe)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/start-premium-trial` | No | Start free premium trial |
| POST | `/api/stripe-webhook` | No | Stripe payment webhook |
| POST | `/api/create-payment-intent` | Yes | Create Stripe payment |
| POST | `/api/confirm-premium` | Yes | Confirm premium upgrade |

### Media
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload-tutorial-video` | Yes | Upload tutorial video |
| GET | `/api/tutorial-video` | No | Get latest tutorial video URL |

### Reviews (Landing page testimonials)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | No | Get visible reviews |
| POST | `/api/reviews` | No | Submit a review |
| GET | `/api/admin/reviews` | Yes | Get all reviews (admin) |
| PATCH | `/api/admin/reviews/:id` | Yes | Toggle review visibility |
| DELETE | `/api/admin/reviews/:id` | Yes | Delete review |

---

## 📦 Key Dependencies

### Frontend
| Package | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui (Radix UI) | Component library |
| Framer Motion | Animations |
| TanStack Query | Data fetching/caching |
| Wouter | Client-side routing |
| qrcode.react | QR code rendering |
| react-easy-crop | Image cropping |
| canvas-confetti | Celebration animations |
| recharts | Analytics charts |
| Lucide React | Icons |

### Backend
| Package | Purpose |
|---|---|
| Express | HTTP server |
| Passport + passport-local | Authentication |
| express-session | Session management |
| connect-pg-simple | Postgres session store |
| Drizzle ORM | Database ORM |
| postgres | Postgres driver |
| Stripe | Payment processing |
| Multer | File uploads |
| SendGrid | Email (installed, check if wired up) |
| passkit-generator | Apple Wallet passes |
| Zod | Schema validation |

### Mobile
| Package | Purpose |
|---|---|
| @capacitor/core | iOS/Android wrapper |
| @capacitor/ios | iOS platform |
| @capacitor/camera | Camera access |
| @capacitor/haptics | Haptic feedback |
| @capacitor/app | App lifecycle |
| @capacitor/status-bar | Status bar control |

---

## ✅ Features Already Built

- [x] User registration & login
- [x] Multiple profiles per user
- [x] Custom QR code (color, size, style, position)
- [x] Profile customization (photo, bio, title, card color, background)
- [x] 4 layout styles (standard, compact, centered, minimal)
- [x] Social links management
- [x] Public profile page via slug URL
- [x] QR scan count tracking
- [x] Rich scan analytics (location, device, browser, OS)
- [x] Contact messaging (visitor → profile owner)
- [x] Premium / free tier system
- [x] Free trial support
- [x] Stripe payment integration
- [x] Admin panel (review management)
- [x] Landing page reviews/testimonials
- [x] Tutorial video upload and playback
- [x] Apple Wallet pass generation (passkit-generator installed)
- [x] AR profile features (fields in schema, partial implementation)
- [x] Capacitor iOS project scaffolded

---

## ❌ Features Not Yet Built

### World Cup / Event Features
- [ ] Event Mode — one QR, whole room connects
- [ ] "Where we met" tag on scan logs
- [ ] Fan Card template (country flag, team, language)
- [ ] Offline QR caching (works without internet)

### AI Features
- [ ] AI profile bio generation
- [ ] AI card style recommendation

### Mobile Polish
- [ ] Haptic feedback wired up (package installed, not wired)
- [ ] Swipe gestures (@use-gesture/react)
- [ ] Confetti on first connection (canvas-confetti installed, not wired)
- [ ] Apple Wallet pass UI (passkit-generator installed, needs UI)
- [ ] Push notifications

### Infrastructure
- [ ] Password reset tokens stored in DB (currently in-memory Map)
- [ ] SendGrid email wired up for password reset
- [ ] Proper README.md
- [ ] CI/CD pipeline

---

## ⚠️ Known Issues

| Issue | File | Priority |
|---|---|---|
| Vite 8 incompatible with @vitejs/plugin-react | package.json | Medium |
| Vite deprecation warnings on startup | vite.config.ts | Low |
| Password reset tokens lost on restart | server/routes.ts:68 | Medium |
| AR features partially implemented | schema.ts, routes.ts | Low |
| No README.md | root | Medium |
| caniuse-lite database outdated | — | Low |

---

## 🔜 Next Steps (Phase 2+)

1. Write README.md with setup instructions
2. Fix Vite version conflict
3. Move password reset tokens to database
4. Wire up haptic feedback
5. Wire up Apple Wallet pass generation
6. Build Event Mode feature
7. Add Fan Card template for World Cup
8. iOS Capacitor build and App Store submission
