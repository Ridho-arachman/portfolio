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

### `unstable_cache` Declarations
Every server cache in the app, and nothing else. This table is exhaustive —
8 declarations total.

| File | Cache Key | Tags | Revalidate |
|------|-----------|------|------------|
| `src/app/[lang]/(public)/page.tsx` | `home-certificates` | `certificates` | 60s |
| `src/app/[lang]/(public)/page.tsx` | `home-projects` | `projects` | 60s |
| `src/app/[lang]/(public)/projects/page.tsx` | `public-projects` | `projects`, `categories` | 3600s |
| `src/app/[lang]/(public)/experience/page.tsx` | `public-experiences` | `experiences` | 3600s |
| `src/app/[lang]/(public)/about/page.tsx` | `about-experiences` | `experiences` | 3600s |
| `src/app/[lang]/(public)/certificates/page.tsx` | `public-certificates` | `certificates` | 3600s |
| `src/lib/settings.ts` | `site-settings-v1` | `site-settings` | 3600s |
| `src/lib/translations.ts` | `messages-v1` | `translations` | 3600s |

### The Full Set of Server Tags
```
projects  experiences  certificates  categories  site-settings  translations
```

`skills` and `messages` are **React Query keys only** — they have no
`unstable_cache` wrapper, so they need no server tag, and the public skill and
message read paths are not listed above. `dashboard-stats` is a React Query key
on the dashboard, not a server tag either. Absence of a tag is a deliberate
reflection that nothing is cached; do not add one to make the list look
complete.

### Why `public-projects` also carries `categories`
That payload embeds `category.name` through a relation load, so it is affected
by category writes too. Without the extra tag, renaming or trashing a category
left cached project pages showing the old name until the 3600s TTL expired.
**Rule: every tag whose data appears in the payload belongs in `tags`, not just
the tag matching the route.**

### Mutation Invalidation (Admin API)
23 `revalidateTag` call sites, all inside `src/app/api/admin`. Each of the four
cached content entities has exactly five — create, update, soft-delete,
restore, purge:

```ts
revalidateTag("projects", { expire: 0 })      // and experiences, certificates, categories
revalidateTag("site-settings", { expire: 0 }) // settings PUT + reset
revalidateTag("translations", { expire: 0 })  // translations PUT
```

`expire: 0` = immediate invalidation.

### Soft Delete and the Cache
Trash, restore and purge all revalidate the entity tag, so a soft-deleted row
leaves every public page on the same request that trashed it — no wait for the
TTL. `skills` and `messages` need nothing here, per the rule above.

A relation load that filters with `notDeleted` still embeds `deletedAt` in the
cached payload, and a `Date` rehydrates as a `string` after warm. That
serialization mismatch is the incident recorded on `public-projects`; relation
loads inside a cached getter must use an explicit `select` for the fields the
template actually renders.

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
- **Tags**: plural entity name, drawn only from `projects`, `experiences`, `certificates`, `categories`, `site-settings`, `translations`
- **Cache keys**: descriptive + unique per query (`public-projects`, `home-certificates`, etc.)

---

## Adding New Cache

1. Wrap the read in `unstable_cache` with a descriptive key
2. List **every** tag whose data lands in the payload, including tags from
   relation loads
3. Define those tags in each admin mutation route: `revalidateTag("new-entity", { expire: 0 })`
4. Create hook with `staleTime: 10min` (lists) or `2min` (dashboards)
5. Invalidate in hook mutation: `queryClient.invalidateQueries({ queryKey: ['new-entity'] })`

### Two ways this goes wrong

**Adding a tag to a route that is not cached.** A `revalidateTag` for an entity
whose read path has no `unstable_cache` wrapper invalidates nothing, and adding
a `tags` array to an uncached route invents a cache that was never there. This
happened while documenting the category fix: a task assumed
`src/app/api/public/projects/route.ts` was cached and it has zero
`unstable_cache`. Check for the wrapper before adding a tag to anything.

**Writing a tag only in the mutation route.** The mutation half without the read
half is the common bug — a mutation invalidating a tag nothing reads. Both ends
must be changed in the same commit.
