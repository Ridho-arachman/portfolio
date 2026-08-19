# Portfolio

A full-stack developer portfolio built with Next.js 16, featuring an admin dashboard, CMS-like content management, visitor analytics, and secure authentication.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui + @base-ui/react |
| Database | PostgreSQL via Prisma 7 (driver adapter) |
| Auth | [better-auth](https://www.better-auth.com) (email/password + OAuth) |
| State | React Query + Zustand + nuqs |
| Storage | Supabase Storage (images) |
| Map | Leaflet + react-leaflet |
| Testing | Vitest (unit + integration) + Playwright (E2E) |
| Deployment | Docker + Nginx + ngrok (VPS via GitHub Actions CI/CD) |

## Features

- **Public site** - Projects, experience, certificates, contact form
- **Admin dashboard** - Analytics, visitor map, CRUD management
- **Draft/Publish** - Toggle content visibility before going live
- **Image upload** - Supabase Storage with client-side preview
- **Authentication** - Email/password + Google/GitHub OAuth, rate limiting
- **Visitor tracking** - GeoIP-based analytics with Leaflet map visualization
- **Responsive design** - Glassmorphism UI, mobile-first

## Prerequisites

- Node.js 24+
- PostgreSQL 16+ (local or Docker)
- Supabase project (for image storage)
- Docker (optional, for containerized dev)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Ridho-arachman/portfolio.git
cd portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000.

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for auth sessions (32+ chars) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests (requires PostgreSQL)
npm run test:integration

# E2E tests (requires PostgreSQL + running dev server)
npm run test:e2e

# All tests
npm run test
```

## Project Structure

```
src/
  app/
    (public)/          # Public routes (home, projects, experience, etc.)
    admin/             # Admin dashboard routes
    api/               # API routes (auth, contact, analytics, etc.)
  components/
    sections/          # Page-level components (admin-dashboard, contact, etc.)
    ui/                # Shared UI components (shadcn/ui + custom)
  hooks/               # Custom React hooks
  lib/                 # Utilities (auth, prisma, env, supabase, etc.)
  stores/              # Zustand stores
prisma/                # Database schema and migrations
docker/                # Dockerfiles and compose files
e2e/                   # Playwright end-to-end tests
scripts/               # Seed and utility scripts
```

## Deployment

The project deploys via GitHub Actions CI/CD to a VPS:

1. Push to `main` triggers the CI pipeline
2. Tests run (unit, integration, E2E)
3. Docker image is built and deployed via SSH

See `.github/workflows/ci.yml` for the full pipeline.

## License

MIT
