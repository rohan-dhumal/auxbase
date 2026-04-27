# Auxbase

A multi-tenant SaaS admin panel for managing users, viewing analytics, and controlling permissions. Built with a production-grade stack and deployed live.

**Live Demo → [auxbase-client.vercel.app](https://auxbase-client.vercel.app)**

> Demo credentials:
> - Super Admin: `rohan@auxbase.com` / `password123`
> - Admin: `admin@auxbase.com` / `password123`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack Query |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT + Refresh Token Rotation |
| Monorepo | Turborepo, pnpm workspaces |
| DevOps | Docker, Vercel, Render, Supabase |

---

## Features

### Authentication
- Register, login, logout
- JWT access tokens (15min) + refresh token rotation (7 days)
- Refresh tokens stored in httpOnly cookies — XSS safe
- Silent token refresh on page reload
- Access tokens stored in memory — not localStorage

### Role Based Access Control
- Three roles — Super Admin, Admin, Viewer
- Role hierarchy — higher roles inherit lower role permissions
- Middleware-level protection on all backend routes
- Frontend route protection with role-based redirects

### User Management
- Paginated users table with search and filters
- Activate and deactivate accounts
- Edit user name and role
- Actions hidden for own account

### Analytics Dashboard
- KPI cards — total users, active, inactive, new this month
- Line chart — user growth over last 30 days
- Bar chart — activity by day over last 7 days
- Skeleton loading states on all data

### Settings
- Update display name
- Change password with current password verification
- Account info with role badge

### UI/UX
- Dark / light mode with persistence
- Fully responsive layout
- Error boundaries on all pages
- Toast notifications

---

## Architecture

```
auxbase/
├── apps/
│   ├── client/          # React SPA (Vite)
│   └── server/          # Express API
├── packages/
│   └── shared/          # Zod schemas shared across client and server
├── docker-compose.yml   # Local dev with PostgreSQL
└── turbo.json           # Turborepo pipeline
```

### Key architectural decisions

**Monorepo with Turborepo** — shared Zod schemas mean the same validation runs on the React form and the Express route. One source of truth for both sides.

**In-memory access tokens** — access tokens are stored in a JavaScript variable, not localStorage. Eliminates XSS token theft. Refresh tokens live in httpOnly cookies — inaccessible to JavaScript entirely.

**Role hierarchy middleware** — instead of listing every allowed role on each route, roles are assigned numeric levels. `authorize('ADMIN')` automatically allows Super Admin through without explicitly listing both.

**Prisma v7** — uses the new `prisma.config.ts` pattern with `@prisma/adapter-pg` for explicit connection management.

---

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- Docker

### Setup

```bash
# Clone the repo
git clone https://github.com/rohan-dhumal/auxbase.git
cd auxbase

# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d postgres

# Set up environment variables
cp apps/server/.env.example apps/server/.env
# Update DATABASE_URL in apps/server/.env

# Run database migrations
cd apps/server
pnpm prisma migrate dev

# Start both apps from root
cd ../..
pnpm dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [auxbase-client.vercel.app](https://auxbase-client.vercel.app) |
| Backend | Render | [auxbase-server.onrender.com](https://auxbase-server.onrender.com) |
| Database | Supabase | PostgreSQL (free tier) |

> **Note:** Backend is on Render's free tier and spins down after 15 minutes of inactivity. First request after inactivity may take ~30 seconds.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin+ | List users with pagination |
| GET | `/api/users/:id` | Admin+ | Get single user |
| PATCH | `/api/users/:id` | Admin+ | Update name or role |
| PATCH | `/api/users/:id/deactivate` | Admin+ | Deactivate user |
| PATCH | `/api/users/:id/activate` | Admin+ | Activate user |
| PATCH | `/api/users/:id/password` | Any | Change own password |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/stats` | Any | KPI stats |
| GET | `/api/analytics/growth` | Any | User growth chart data |
| GET | `/api/analytics/activity` | Any | Activity chart data |

---

## Environment Variables

### Server (`apps/server/.env`)

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```