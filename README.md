# Pickleball Hub

A modern, SEO-friendly discovery and community platform for pickleball in the Philippines —
courts, clubs, events and guides — starting with Cagayan de Oro and Northern Mindanao.

**Phase 1** covers the public website, the database foundation and a protected admin area
skeleton. Bookings, payments, memberships, rankings and tournaments are planned for later phases.

## Tech stack

| Area            | Choice                                                          |
| --------------- | --------------------------------------------------------------- |
| Framework       | Next.js 16.4 (App Router, Turbopack, Cache Components, Proxy)   |
| Language / UI   | TypeScript 5.9 (strict), React 19.3                             |
| Styling         | Tailwind CSS 4.3, shadcn/ui (Radix, "nova" style), Lucide icons |
| Data / Auth     | Supabase (PostgreSQL, Auth, Storage) via `@supabase/ssr` 0.12   |
| Validation      | Zod 4                                                           |
| Quality         | ESLint 9 (`eslint-config-next`), Prettier 3 + Tailwind plugin   |
| Package manager | pnpm 9 · Node.js ≥ 20.9                                         |
| Hosting         | Vercel                                                          |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional — the site runs without Supabase
pnpm dev                     # http://localhost:3000
```

Without Supabase credentials, the public site renders **fictional sample content**. A banner
appears on every page, and each sample card has a "Sample" badge. Sample records are left out
of the sitemap and get no structured data. Submissions return `503`, and the admin area explains
that authentication is not configured.

### Scripts

| Command          | Description                                     |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Start the dev server                            |
| `pnpm build`     | Production build                                |
| `pnpm start`     | Serve the production build                      |
| `pnpm lint`      | ESLint                                          |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit`     |
| `pnpm format`    | Format with Prettier (`format:check` to verify) |
| `pnpm check`     | Lint + typecheck + format check                 |

## Environment variables

| Variable                               | Scope       | Purpose                                                                             |
| -------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | public      | Canonical base URL (sitemap, Open Graph). Falls back to `VERCEL_URL`.               |
| `NEXT_PUBLIC_SUPABASE_URL`             | public      | Supabase project URL.                                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public      | Publishable (`sb_publishable_…`) or legacy anon key. RLS-restricted.                |
| `SUPABASE_SECRET_KEY`                  | server only | Secret (`sb_secret_…`) or legacy service-role key. Used only by `/api/submissions`. |

`SUPABASE_SECRET_KEY` is read only in `server-only` modules. Never prefix it with `NEXT_PUBLIC_`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the URL and keys into
   `.env.local` (and into your Vercel project settings).
2. Apply the schema, using either:
   - the CLI: `pnpm dlx supabase link --project-ref <ref>` then `pnpm dlx supabase db push`, or
   - the dashboard SQL editor: paste `supabase/migrations/20261008000000_initial_schema.sql`.
3. **Local development only:** load sample data with `supabase db reset` (runs `supabase/seed.sql`)
   or paste the seed into the SQL editor. Do not seed production.
4. Create an administrator:
   ```sql
   -- after creating the user under Authentication → Users
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
   Then sign in at `/admin/login`.
5. Optional: regenerate types after schema changes:
   `pnpm dlx supabase gen types typescript --linked > src/types/database.ts`

### Schema summary

| Table         | Notes                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| `cities`      | Name, unique slug, province, region, coordinates, sort order.                                 |
| `courts`      | → `cities`. Environment enum, surface, court count, amenities, hours, rates, contacts, image. |
| `clubs`       | → `cities`, → home `courts`. Skill levels, schedule, links, logo/cover.                       |
| `events`      | → `cities`/`courts`/`clubs`. Type enum, `starts_at`/`ends_at` (checked), registration, fee.   |
| `articles`    | Unique slug, body, category, author, reading time, SEO overrides.                             |
| `submissions` | Court listings and contact messages (`payload` jsonb), review status, hashed IP.              |
| `admins`      | `auth.users` ids allowed to manage content.                                                   |

All tables use UUID primary keys and `created_at`/`updated_at` timestamps, with triggers keeping
`updated_at` current. Content tables share a `content_status` enum (`draft | published | archived`),
and a trigger sets `published_at` the first time a record is published. The migration also adds
foreign-key, status, featured and rate-limit indexes.

### Security model

- **RLS is enabled on every table.** Visitors (`anon`) and signed-in users can read only
  `published` content. Administrators, as determined by `public.is_admin()` (a `security definer`
  function), have full CRUD on content and can read and update submissions.
- `anon` has **no write privileges** on any table. Public submissions go through
  `POST /api/submissions`, which checks the request origin and content type, caps the body at
  10 KB, validates with Zod, rejects bot-filled honeypot fields, and rate-limits each hashed IP to
  5 submissions per hour (the HMAC hash is stored instead of the raw IP). It inserts using the
  secret key.
- Storage: a public `media` bucket (images only, max 5 MB). Anyone can read it; only admins can
  write to it.
- `src/proxy.ts` runs only on `/admin`. It refreshes the Supabase session and redirects
  signed-out users, but this is only an optimistic check. Each admin page also calls
  `requireAdmin()` on the server.

## Architecture

```text
src/
├── app/
│   ├── (public)/            # Public site (shared header/footer layout)
│   │   ├── page.tsx         # Home
│   │   ├── courts/          # /courts, /courts/[city], /courts/[city]/[slug]
│   │   ├── clubs/           # /clubs, /clubs/[slug]
│   │   ├── events/          # /events, /events/[slug]
│   │   ├── learn/           # /learn, /learn/[slug]
│   │   ├── about/ contact/ list-your-court/
│   │   ├── error.tsx  not-found.tsx
│   ├── admin/               # Protected admin foundation (+ /admin/login)
│   ├── api/submissions/     # Validated, rate-limited public submissions
│   ├── layout.tsx  globals.css  sitemap.ts  robots.ts  opengraph-image.tsx  icon.svg
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # Header, footer, navigation
│   ├── shared/              # Page header, empty states, media, JSON-LD, breadcrumbs…
│   ├── home/ courts/ clubs/ events/ learn/ forms/ admin/
├── features/                # Data access per domain ("use cache" queries + row mappers)
│   ├── courts/ cities/ clubs/ events/ articles/ auth/ sample-content/ shared/
├── hooks/                   # Client hooks (use-submission)
├── lib/
│   ├── supabase/            # public (cookie-less), server (session), client, service, proxy, storage
│   ├── validations/         # Zod schemas
│   ├── utils/  env.ts  seo.ts  cache-tags.ts
├── config/site.ts           # Site name, navigation, SEO keywords
├── types/                   # database.ts (Supabase types), content.ts (view models)
└── proxy.ts                 # Session refresh for /admin
supabase/
├── migrations/              # Schema, RLS, storage bucket
└── seed.sql                 # Local-dev sample data
```

### Rendering and caching

Cache Components and Partial Prefetching are enabled (the Next.js 16 defaults).

- Public data functions use `"use cache"` with `cacheLife("hours")` and the tags in
  `lib/cache-tags.ts`. They use a **cookie-less** Supabase client, so public pages prerender into
  static shells. After an admin edit, refresh the cache with `revalidateTag()` or `updateTag()`.
- Request-time reads happen inside `<Suspense>`: `searchParams` on `/courts`, dynamic `params`
  on detail pages, and session cookies in `/admin`.
- `generateStaticParams` prerenders every published slug. Slugs added later are rendered on
  first visit. If a table is empty, it returns a placeholder entry, because Cache Components
  requires at least one entry.
- Court URLs are nested as `/courts/[city]/[slug]`, which avoids conflicting `[city]` and `[slug]`
  segments and keeps URLs location-rich for SEO. A court requested under the wrong city
  permanently redirects to its canonical URL.

### SEO

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter metadata via `buildMetadata()`.
- `sitemap.xml` and `robots.txt` (which disallows `/admin` and `/api/`), plus a generated
  Open Graph image.
- JSON-LD:
  - Home: `Organization` and `WebSite` with a `SearchAction`.
  - Detail pages: `SportsActivityLocation`, `SportsOrganization`, `SportsEvent`, `Article`.
  - City pages: `ItemList`.
  - All pages with breadcrumbs: `BreadcrumbList`.
- `en-PH` locale, Philippine time zone formatting, and location-focused copy and URLs.

## Deployment (Vercel)

1. Import the repository in Vercel (the Next.js preset is detected automatically).
2. Add the environment variables above for Production and Preview.
3. Deploy. Images from Supabase Storage are allowed automatically through `images.remotePatterns`,
   which is derived from `NEXT_PUBLIC_SUPABASE_URL`.

## Next steps

- Admin CRUD for courts, cities, clubs, events and articles, with image upload to `media` and
  `updateTag()` revalidation.
- A review queue in the admin area for submissions, with email notifications.
- Map view and geo search (PostGIS), plus filters for amenities and court type.
- Rich-text or MDX authoring for articles.
- End-to-end tests (Playwright) and CI running `pnpm check` and `pnpm build`.
- Analytics and monitoring (Vercel Analytics, Sentry).
