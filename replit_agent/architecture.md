# QrMingle Architecture

## 1. Overview

QrMingle is a web application that allows users to create and share digital contact cards via customizable QR codes. The application enables users to create profiles with personal information, customize their QR codes, and track analytics on profile views. 

The system follows a modern full-stack architecture with:
- A React-based frontend written in TypeScript
- A dual-backend approach with Node.js/Express and Python/Flask servers
- PostgreSQL database for data persistence
- Integration with third-party services such as Stripe for payments and SendGrid for email

## 2. System Architecture

### High-Level Architecture

QrMingle employs a hybrid architecture with:

1. **Frontend**: React application with TypeScript, using modern React patterns and libraries
2. **Backend**: Dual-backend setup with:
   - Node.js/Express API handling core functionality
   - Python/Flask API providing supplementary services
3. **Database**: PostgreSQL for data persistence
4. **External Services**: Stripe for payment processing, SendGrid for email services

### Architecture Diagram (Conceptual)

```
┌─────────────────┐           ┌─────────────────┐
│                 │           │                 │
│  React Frontend │◄────────►│  Node.js/Express │
│  (TypeScript)   │           │  Backend API    │
│                 │           │                 │
└────────┬────────┘           └────────┬────────┘
         │                             │
         │                             │
         │                             ▼
         │                    ┌─────────────────┐
         │                    │                 │
         └─────────────────► │  PostgreSQL DB  │
         │                    │                 │
         │                    └─────────────────┘
         │                             ▲
         │                             │
         │                             │
         │                    ┌────────┴────────┐
         │                    │                 │
         └────────────────────┤  Python/Flask   │
                              │  Backend API    │
                              │                 │
                              └─────────────────┘
                                       ▲
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ External APIs   │
                              │ - Stripe        │
                              │ - SendGrid      │
                              └─────────────────┘
```

## 3. Key Components

### 3.1 Frontend Architecture

#### Technologies
- **React**: Core UI library
- **TypeScript**: For type safety
- **TanStack Query (React Query)**: For data fetching, caching, and state management
- **Wouter**: For routing
- **Shadcn UI**: Component library built on Radix UI and Tailwind CSS
- **Tailwind CSS**: For styling
- **Vite**: Build tool

#### Key Components
- **Page Components**: Located in `client/src/pages`
- **UI Components**: Located in `client/src/components`
- **Hooks**: Custom hooks in `client/src/hooks`
- **API Integration**: API client in `client/src/lib/queryClient.ts`
- **Authentication**: Auth context in `client/src/hooks/use-auth.tsx`

### 3.2 Node.js Backend Architecture

#### Technologies
- **Express.js**: Web framework
- **TypeScript**: For type safety
- **Drizzle ORM**: Database ORM for PostgreSQL
- **Neon Serverless**: PostgreSQL connection client
- **Stripe**: Payment processing
- **SendGrid**: Email service

#### Key Components
- **API Routes**: Defined in `server/routes.ts`
- **Authentication**: Implemented in `server/auth.ts`
- **Database Access**: Database client in `server/db.ts`
- **Storage Implementation**: Data operations in `server/storage.ts`
- **Vite Integration**: For serving the React app in `server/vite.ts`

### 3.3 Python Backend Architecture

#### Technologies
- **Flask**: Web framework
- **SQLAlchemy**: ORM for database access
- **Flask-CORS**: CORS middleware
- **Flask-Session**: Session management
- **Gunicorn**: WSGI HTTP server

#### Key Components
- **App Configuration**: In `python_server/app.py`
- **API Routes**: In `python_server/api/` directory
- **Authentication**: In `python_server/auth/`
- **Database Models**: In `python_server/models/models.py`
- **Schema Validation**: In `python_server/schemas/schemas.py`

### 3.4 Database Architecture

The application uses PostgreSQL with the following schema:

- **Users**: User accounts and authentication
- **Profiles**: User profiles with personal information and QR customization options
- **Social Links**: Associated social media links for profiles
- **Scan Logs**: Tracking when QR codes are scanned
- **Reviews**: User testimonials for the service

Schema is defined in two places:
1. TypeScript: In `shared/schema.ts` using Drizzle ORM
2. Python: In `python_server/models/models.py` using SQLAlchemy

## 4. Data Flow

### 4.1 Authentication Flow

1. User registers or logs in via the React frontend
2. Credentials are sent to the authentication API
3. Server validates credentials and creates a session
4. Session token is stored client-side (cookies)
5. Subsequent requests include the session token for authentication

### 4.2 Profile Creation Flow

1. Authenticated user creates a profile with personal information
2. Frontend sends data to the API
3. API validates data and stores it in the database
4. A unique slug is generated for the profile
5. QR code is generated based on the profile slug
6. Profile is returned to the frontend for display

### 4.3 QR Code Scanning Flow

1. Someone scans a QR code
2. They are directed to the profile page with the appropriate slug
3. Backend records the scan in the scan logs
4. Profile information is displayed to the visitor
5. Analytics are updated for the profile owner

### 4.4 Payment Flow (Premium Features)

1. User selects premium plan
2. Stripe payment form is displayed
3. User enters payment information
4. Data is sent to Stripe via the Stripe API
5. Server confirms payment with Stripe
6. User account is updated with premium status

## 5. External Dependencies

### 5.1 Third-Party Services

- **Stripe**: Payment processing for premium subscriptions
- **SendGrid**: Email service for notifications and password resets

### 5.2 Frontend Dependencies

Major dependencies include:
- React ecosystem (React, React DOM)
- TanStack Query for data fetching and state management
- Radix UI components for the UI
- Tailwind CSS for styling
- Wouter for routing
- Lucide React for icons
- Recharts for analytics charts

### 5.3 Backend Dependencies

Node.js backend:
- Express.js for API routes
- Drizzle ORM for database access
- Neon Serverless for database connectivity
- Stripe SDK for payment processing
- SendGrid SDK for email services

Python backend:
- Flask for API routes
- SQLAlchemy for database ORM
- Werkzeug for security utilities
- Gunicorn for WSGI HTTP server
- Pydantic for schema validation

## 6. Deployment Strategy

The application is configured for deployment on Replit, as evident from the `.replit` configuration file.

### 6.1 Development Environment

- **Frontend**: Vite dev server
- **Backend**: Express.js and Flask servers in development mode
- **Database**: PostgreSQL database (likely provisioned by Replit)

### 6.2 Production Deployment

- **Build Process**: 
  - Frontend is built with Vite
  - Backend is bundled with esbuild
  - Combined into a single distributionn

- **Server Configuration**:
  - Node.js server serves both the API and static assets
  - Python/Flask server runs with Gunicorn
  - Environment variables control configuration

- **Scaling Strategy**:
  - The application is designed to deploy with `"deploymentTarget": "autoscale"` in the Replit configuration
  - The Node.js server can handle multiple connections
  - Gunicorn can be configured with multiple workers

### 6.3 Database Management

- Database migrations are handled via Drizzle Kit
- Connection configuration is provided via environment variables
- The application is designed to work with Neon PostgreSQL service