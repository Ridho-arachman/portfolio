# Cache Strategy

## Overview
Three caching layers work together:

| Layer | Scope | Tech | Invalidation |
|-------|-------|------|--------------|
| **Client** | Browser | @tanstack/react-query | `queryClient.invalidateQueries()` on mutation |
| **Server/ISR** | Next.js | `unstable_cache` + `revalidateTag` | `revalidateTag(tag, { expire: 0 })` on mutation |
| **In-Memory** | Process | Singletons (Supabase, env) | Process restart |

---

## Client Cache (React Query)

### Provider
Single provider: `LazyProviders` in `src/lib/lazy-providers.tsx`
- `staleTime: 2 * 60 * 1000` (2 min)
- `gcTime: 10 * 60 * 1000` (10 min)
- `refetchOnWindowFocus: false`
- `retry: 2`

Wraps `NuqsAdapter` + `PublicProviders` (Toaster).

### Hooks (`src/hooks/`)
| Hook | `staleTime` | Invalidation |
|------|-------------|--------------|
| `use-skills` | 10 min | `invalidateQueries({ queryKey: ['skills'] })` |
| `use-projects` | 10 min | `invalidateQueries({ queryKey: ['projects'] })` |
| `use-messages` | 10 min | `invalidateQueries({ queryKey: ['messages'] })` |
| `use-experience` | 10 min | `invalidateQueries({ queryKey: ['experience'] })` |
| `use-certificates` | 10 min | `invalidateQueries({ queryKey: ['certificates'] })` |
| `use-categories` | 10 min | `invalidateQueries({ queryKey: ['categories'] })` |
| `use-dashboard-stats` | 2 min | `invalidateQueries({ queryKey: ['dashboard-stats'] })` |

### Admin Dashboard
Direct `useQuery` in `src/components/sections/admin-dashboard/admin-dashboard.tsx`:
- `staleTime: 5 * 60 * 1000` (5 min)

---

## Server Cache (Next.js)

### `unstable_cache` on Public Pages
All pages in `src/app/(public)/*/page.tsx` use `unstable_cache` with tags:

| Page | Cache Keys | Tags | Revalidate |
|------|------------|------|------------|
| `/` (home) | `home-certificates`, `home-projects` | `certificates`, `projects` | 60s |
| `/projects` | `public-projects` | `projects` | 3600s |
| `/experience` | `public-experiences` | `experiences` | 3600s |
| `/certificates` | `public-certificates` | `certificates` | 3600s |
| `/about` | `about-experiences` | `experiences` | 3600s |

### Mutation Invalidation (Admin API)
All admin POST/PUT/DELETE routes call:
```ts
revalidateTag("projects", { expire: 0 })
revalidateTag("experiences", { expire: 0 })
revalidateTag("certificates", { expire: 0 })
```
`expire: 0` = immediate invalidation.

---

## In-Memory Singletons

| File | What | Lifetime |
|------|------|----------|
| `src/lib/supabase-storage.ts` | Supabase client | Process |
| `src/lib/env.ts` | Parsed env (ClientEnv, Env) | Process |
| `src/lib/auth.ts` | better-auth `cookieCache` | Process |

---

## Rate Limiting (Related)

### Two Systems
1. **Custom** (`src/lib/rate-limit.ts`) — Postgres table, no Redis
   - Presets: `contact`, `upload`, `search`, `api`, `userAction`
   - Used by: contact form, upload, visit tracking, admin mutations
2. **better-auth built-in** — Database storage, per-endpoint rules
   - Used by: `/sign-in/email`, `/sign-up/email`, `/sign-in/social`

### Config (env)
| Variable | Default |
|----------|---------|
| `DISABLE_RATE_LIMIT` | `false` |
| `AUTH_RATE_LIMIT_SIGNIN_MAX` | `5` |
| `AUTH_RATE_LIMIT_SIGNUP_MAX` | `5` |

---

## Standards

- **List data**: 10 min staleTime / 3600s server revalidate
- **Dashboard/analytics**: 2 min staleTime / 60s server revalidate
- **Admin mutations**: immediate invalidation (`expire: 0`)
- **Tags**: plural entity name (`projects`, `experiences`, `certificates`, `skills`, `categories`, `messages`, `dashboard-stats`)
- **Cache keys**: descriptive + unique per query (`public-projects`, `home-certificates`, etc.)

---

## Adding New Cache

1. Define tag in admin mutation route: `revalidateTag("new-entity", { expire: 0 })`
2. Add `tags: ["new-entity"]` to `unstable_cache` on public page
3. Create hook with `staleTime: 10min` (lists) or `2min` (dashboards)
4. Invalidate in hook mutation: `queryClient.invalidateQueries({ queryKey: ['new-entity'] })`
