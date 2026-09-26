# Portfolio

[![CI](https://github.com/Ridho-arachman/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Ridho-arachman/portfolio/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?logo=prisma)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack developer portfolio built with Next.js 16, featuring an admin dashboard, CMS-like content management, visitor analytics, and secure authentication.

**Live:** https://ridho-arachman.vercel.app

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16.3.6](https://nextjs.org) (App Router, Turbopack, React Compiler) |
| Language | TypeScript 5 |
| Runtime | Node.js 24 |
| Styling | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) |
| Animation | [Motion](https://motion.dev), [GSAP](https://gsap.com), `tw-animate-css` |
| Database | PostgreSQL via Prisma 7.10 (`@prisma/adapter-pg` driver adapter) |
| Auth | [better-auth](https://www.better-auth.com) 1.7 — email/password + OAuth, Turnstile, rate limiting |
| Validation | [Zod](https://zod.dev) 4 + React Hook Form |
| State | TanStack Query 5, TanStack Table 9, Zustand 5, [nuqs](https://nuqs.dev) 2.10 |
| Storage | [Supabase](https://supabase.com) Storage + JS SDK 2.117 |
| Map | Leaflet 1.9 + react-leaflet 5, `topojson-client`, `world-atlas` |
| Charts | Recharts 3.10 |
| HTTP | Axios |
| Testing | [Vitest](https://vitest.dev) 5 (unit + integration) + [Playwright](https://playwright.dev) 1.63 (E2E) |
| Quality | ESLint 9, Lighthouse 13, commitlint + Husky |
| Deployment | Vercel via Git integration, plus Docker/Nginx for local and container workflows |

## Features

- **Public site** — projects, experience, certificates, contact form; i18n at `/en` and `/id`
- **Admin dashboard** — analytics, visitor map, CRUD management
- **Draft/Publish** — toggle content visibility before going live
- **Image upload** — Supabase Storage with client-side preview
- **Authentication** — email/password + Google/GitHub OAuth, Cloudflare Turnstile, rate limiting
- **Visitor tracking** — GeoIP-based analytics with Leaflet map visualization
- **Responsive design** — glassmorphism UI, mobile-first

## Prerequisites

- **Node.js 24+** (CI runs on Node 24)
- PostgreSQL 16+ — local, Docker, or Supabase
- Supabase project (for image storage)
- Docker — optional, only for the containerized dev/prod workflow

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Ridho-arachman/portfolio.git
cd portfolio

# 2. Install dependencies
npm ci

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# 5. Optional: seed an admin user and portfolio content
npm run db:seed
npm run db:seed:portfolio

# 6. Start the development server
npm run dev
```

Open http://localhost:3000 — it redirects to `/en` or `/id`.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run analyze` | Production build with the bundle analyzer |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed the admin user |
| `npm run db:seed:portfolio` | Seed portfolio content |
| `npm run docker:dev` | Start the Docker dev stack |
| `npm run docker:prod` | Start the Docker production stack |

## Environment Variables

Copy `.env.example` to `.env` and fill in real values — it is the annotated source of truth. `.env*` is gitignored; never commit it.

**Required**

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Use the Supabase **pooler** (port 6543) for Vercel production; direct connection (port 5432) is fine locally |
| `BETTER_AUTH_SECRET` | Session secret, min 32 chars. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | App URL, e.g. `https://ridho-arachman.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Must equal `BETTER_AUTH_URL` (read client-side) |

**Authentication (optional)**

| Variable | Description |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth. Redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth. Callback: `{BETTER_AUTH_URL}/api/auth/callback/github` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile CAPTCHA. `.env.example` includes the official test keys for CI/E2E |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials used by `npm run db:seed` |
| `AUTH_RATE_LIMIT_SIGNIN_MAX` / `AUTH_RATE_LIMIT_SIGNUP_MAX` | Defaults to `5` |
| `DISABLE_RATE_LIMIT` | `true` disables rate limiting — tests/dev only |

**Content and presentation** — all optional, each has a schema default: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_TAGLINE`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_AUTHOR_NAME`, `NEXT_PUBLIC_AUTHOR_TITLE`, `NEXT_PUBLIC_AUTHOR_BIO`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_LOCATION`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_TWITTER_URL`.

**Map and storage** — `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_NGROK_DOMAIN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).

> **Vercel Preview builds need `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` attached to the _Preview_ environment.** `src/lib/env.ts` validates eagerly at module load, so a missing value fails `next build` while collecting page data. Production-only variables are not enough.

## Testing

| Command | Scope |
| --- | --- |
| `npm run test:unit` | Vitest unit tests (`vitest.config.ts`) |
| `npm run test:integration` | Integration tests — starts Postgres via Docker, then runs `vitest.integration.config.ts` |
| `npm run test:e2e` | Playwright E2E (`e2e/*.spec.ts`) — needs Postgres and a running dev server |
| `npm run test` | Alias of `test:unit` |
| `npm run test:coverage` | Unit tests with `@vitest/coverage-v8` |
| `npm run test:watch` | Vitest watch mode |

Integration and E2E suites read `.env.e2e` for database credentials; see `docker/docker-compose.test.yml`.

### CI pipeline

`.github/workflows/ci.yml` runs three jobs on every push and pull request:

1. **Lint, Typecheck, Build, Unit & Docker Test** — ESLint, `tsc --noEmit`, unit tests, `next build`, Docker image build test
2. **Integration Tests** — Postgres service container plus the integration suite
3. **End-to-End Tests** — Playwright suite

### Quality gate

`AGENTS.md` sets the bar for any UI change: Lighthouse **Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100**, audited against a production build (not `next dev`) on both mobile (412×823) and desktop (1350×940). Do not merge UI changes without it.

## Project Structure

```
src/
  app/
    [lang]/
      (public)/       # Public routes — home, projects, experience, about, certificates, contact
    admin/            # Admin dashboard routes
    api/              # Route handlers (auth, contact, analytics, upload, ...)
  components/
    sections/         # Page-level sections
    layout/           # Navbar, footer
    ui/               # Shared UI (shadcn/ui + custom)
  hooks/              # Custom React hooks
  lib/                # Utilities (auth, prisma, env, supabase, seo, ...)
  schema/             # Zod schemas
  stores/             # Zustand stores
  messages/           # i18n messages (en.json, id.json)
  generated/prisma/   # Prisma client output — generated, do not edit
docker/               # Dockerfiles, compose files, nginx.conf
e2e/                  # Playwright specs
scripts/              # Seed and maintenance scripts
prisma/               # Schema and migrations
```

## Dependency Updates

Automated version updates are currently **paused**: `.github/dependabot.yml` sets `open-pull-requests-limit: 0`, so Dependabot proposes nothing.

To resume, change that `0` to a number (5–10). These rules stay in place and apply immediately:

- **Groups** — `react` + `react-dom` move together; `vitest` + `@vitest/coverage-v8` move together. Splitting the latter breaks `npm ci` with `ERESOLVE`, because coverage-v8 pins an exact peer on vitest.
- **Ignore** — ESLint `>=10.0.0` is ignored until `eslint-plugin-react` adds a `^10` peer range.

> `vitest` and `@vitest/coverage-v8` are pinned to **exact** versions in `package.json` for the same reason: a caret range lets `npm install` resolve the two apart whenever vitest publishes before coverage-v8, which fails the Vercel build.

## Deployment

The app deploys to Vercel. GitHub Actions runs the test pipeline; it does **not** deploy anything.

### Vercel — the hosted app

- **Production URL:** https://ridho-arachman.vercel.app
- **Build command:** `npx prisma generate && next build` (`vercel.json`)
- **Trigger:** push to `main`, via the Vercel Git integration
- **Preview:** one per pull request; requires the three Preview-scoped variables listed above
- `.vercel/project.json` links a local checkout to the project

### Database migrations

Production builds apply pending migrations automatically. `vercel.json` runs `prisma migrate deploy` before `next build`, gated on `VERCEL_ENV=production` so preview builds never touch the live database. A failed migration fails the build rather than deploying an app whose schema does not match its code.

To create a migration, generate the SQL and commit it:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma \
  --script -o prisma/migrations/$(date +%Y%m%d%H%M%S)_<name>/migration.sql
```

Commit the new `prisma/migrations/<name>/migration.sql`. It is applied on the next production deploy. To apply it immediately instead, run `npx prisma migrate deploy` yourself.

`prisma migrate dev` is not usable here: `DATABASE_URL` points at the Supabase **pooler**, which cannot host the shadow database that `migrate dev` needs. CI runs `prisma db push` against a throwaway test database, so it verifies the schema compiles but not the migration chain.

> ⚠️ Pushing to `main` runs the CI test pipeline and triggers the Vercel deploy. Do not push with failing checks.

### Docker + Nginx (local / self-hosted only)

`docker/` contains `Dockerfile.dev` / `docker-compose.dev.yml`, `Dockerfile.prod` / `docker-compose.prod.yml`, `docker-compose.test.yml`, and `nginx.conf`. Run these with the `npm run docker:*` scripts. There is **no automated VPS deploy** — no deploy job exists in `.github/workflows/ci.yml`.

## Commit Conventions

Commit messages are validated by **commitlint** through a Husky `commit-msg` hook using `@commitlint/config-conventional`. Conventional prefixes are required:

```
feat: add project filtering
fix(deps): pin vitest and coverage-v8 to the same version
chore: update README
```

## Further Documentation

| File | Contents |
| --- | --- |
| `AGENTS.md` | Mandatory working rules: code quality, git workflow, anti-looping discipline, Lighthouse gate, testing requirements |
| `DESIGN.md` | Design system and UI conventions |
| `CACHING.md` | Caching strategy and warm-cache behaviour |
| `documents/` | Additional project documents |

## License

MIT
