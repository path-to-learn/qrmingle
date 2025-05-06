# QrMingle Architecture

## Overview

QrMingle is a full-stack web application that allows users to create and share digital contact cards with customizable QR codes. The application follows a hybrid architecture with a JavaScript/TypeScript frontend using React, and dual backend services: a Node.js/Express server for main application functionality and a Python/Flask server for specific features like authentication and profile management.

The application enables users to:
- Create personalized QR code-based contact profiles
- Customize QR code appearance and style
- Share profiles via QR codes
- Track scan analytics
- Manage multiple profiles

## System Architecture

### High-Level Architecture

QrMingle follows a hybrid client-server architecture with:

1. **React Frontend**: Single-page application built with React, TypeScript, and TailwindCSS
2. **Dual Backend Services**:
   - **Node.js/Express API**: Main application server handling most business logic
   - **Python/Flask API**: Secondary service handling specific features
3. **PostgreSQL Database**: Main data storage for user accounts, profiles, and analytics
4. **External Integrations**: Stripe for payments, SendGrid for emails

```
┌─────────────┐        ┌─────────────────┐        ┌─────────────────┐
│             │        │                 │        │                 │
│   React     │◄──────►│  Node.js/Express│◄──────►│   PostgreSQL    │
│  Frontend   │        │      API        │        │   Database      │
│             │        │                 │        │                 │
└─────────────┘        └─────────────────┘        └─────────────────┘
       ▲                        ▲
       │                        │
       │                        │
       ▼                        ▼
┌─────────────┐        ┌─────────────────┐
│             │        │                 │
│  External   │        │   Python/Flask  │
│  Services   │        │      API        │
│             │        │                 │
└─────────────┘        └─────────────────┘
```

### Communication Patterns

- **Client-Server Communication**: REST API endpoints for data exchange
- **Inter-Service Communication**: The Node.js server communicates with the Flask server for specific operations
- **Database Access**: Both servers connect to the same PostgreSQL database
- **External Service Integration**: APIs for Stripe payment processing and SendGrid email delivery

## Key Components

### Frontend Components

1. **React SPA**
   - Built with React and TypeScript
   - Uses React Query for data fetching and caching
   - Implements React hooks for state management
   - Component library based on shadcn/ui components

2. **UI Framework**
   - TailwindCSS for styling
   - Responsive design for mobile and desktop
   - Custom theme configuration via theme.json

3. **Frontend Routes**
   - Authentication pages (login, register, forgot-password)
   - Profile dashboard for managing multiple profiles
   - Profile viewing pages for visitors
   - Settings and premium pages
   - Analytics dashboard

### Backend Components

1. **Node.js/Express API**
   - Main application server
   - Handles most business logic
   - Implements REST API endpoints
   - Serves static frontend assets in production
   - Key files:
     - `/server/index.ts`: Server initialization
     - `/server/routes.ts`: API route definitions
     - `/server/auth.ts`: Authentication service
     - `/server/db.ts`: Database connection
     - `/server/storage.ts`: Data access layer

2. **Python/Flask API**
   - Secondary service handling specific features
   - Implements RESTful endpoints
   - Focuses on authentication and profile management
   - Key files:
     - `/python_server/app.py`: Flask application factory
     - `/python_server/api/`: API routes directory
     - `/python_server/models/`: Database models
     - `/python_server/auth/`: Authentication utilities

3. **Authentication System**
   - Session-based authentication with cookies
   - Password hashing and verification
   - Premium user detection and verification
   - Trial system for premium features

### Data Model

The application uses a relational database schema with the following main entities:

1. **Users**
   - Basic user information (username, password)
   - Premium status tracking
   - Stripe customer ID for premium users

2. **Profiles**
   - User's digital contact card information
   - Customization settings (colors, layout, styles)
   - QR code configuration
   - Scan statistics

3. **Social Links**
   - Social media links associated with profiles
   - Platform identification and URLs

4. **Scan Logs**
   - Tracking when and how profiles are viewed
   - Analytics data collection

5. **Reviews**
   - User testimonials and feedback
   - Moderation status for visibility control

The schema is defined in two places:
- TypeScript: `/shared/schema.ts` using Drizzle ORM
- Python: `/python_server/models/models.py` using SQLAlchemy

## Data Flow

### User Registration and Login

1. User submits registration form to `/api/auth/register`
2. Python Flask API validates data and creates a new user record
3. Password is hashed using scrypt before storage
4. Upon successful registration, user session is created
5. For login, credentials are verified against stored hash

### Profile Creation

1. User submits profile data via frontend form
2. Data is sent to `/api/profiles` endpoint
3. Server validates input and creates new profile record
4. QR code is generated based on profile settings
5. Profile is returned to frontend and displayed to user

### QR Code Scanning

1. Visitor scans QR code linking to a profile URL
2. Server logs the scan event in scan_logs table
3. Profile data is retrieved and served to visitor
4. Scan analytics are updated for the profile owner
5. Profile owner can view aggregated statistics

### Premium Subscription

1. User initiates premium subscription via Stripe
2. Payment information processed through Stripe API
3. On successful payment, user record is updated with premium status
4. Premium features are unlocked immediately
5. Stripe customer ID stored for future reference

## External Dependencies

### Core Dependencies

1. **Frontend**
   - React: UI library
   - Wouter: Lightweight routing solution
   - TanStack Query: Data fetching and caching
   - Shadcn UI / Radix UI: Component library
   - Lucide: Icon library
   - Recharts: Data visualization

2. **Backend (Node.js)**
   - Express: Web framework
   - Drizzle ORM: Database access layer
   - Neon Database SDK: PostgreSQL connection
   - Stripe: Payment processing
   - SendGrid: Email delivery
   - Multer: File upload handling

3. **Backend (Python)**
   - Flask: Web framework
   - SQLAlchemy: ORM for database access
   - Flask-CORS: Cross-origin resource sharing
   - Flask-Session: Session management
   - Passlib: Password hashing
   - Gunicorn: WSGI HTTP server

### External Services

1. **Stripe**
   - Payment processing for premium subscriptions
   - Customer management
   - Webhook handling for payment events

2. **SendGrid**
   - Email delivery for notifications
   - Password reset emails
   - Marketing communications

3. **PostgreSQL Database**
   - Primary data storage
   - Hosted via Neon Database (serverless Postgres)

## Deployment Strategy

The application is configured for deployment on Replit, a cloud development and hosting platform:

1. **Build Process**
   - Frontend: Vite bundles React application
   - Backend (Node.js): esbuild compiles TypeScript
   - Combined into a single distributable package

2. **Runtime Configuration**
   - Environment variables loaded from `.env` file
   - Different configurations for development and production

3. **Startup Process**
   - Gunicorn serves Python/Flask application
   - Node.js/Express serves main application and static assets
   - Database connections established on startup

4. **Scaling Strategy**
   - Stateless design enables horizontal scaling
   - Database connections managed by connection pooling
   - Frontend assets cached and served from CDN in production

5. **Infrastructure Requirements**
   - Node.js runtime (v20+)
   - Python runtime (v3.11+)
   - PostgreSQL database (v16+)
   - Environment variable management

The deployment configuration is defined in `.replit` and supports both development and production environments.