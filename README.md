# Pickleball Hub

A pickleball venue directory and tournament platform for **Iligan City** (Lanao del Norte).
The schema is city-scoped, so more cities can be added later.

What exists today:

- The public site: venues, clubs, events and guides.
- The database foundation for organizer-run tournaments: organizations, divisions,
  registrations, teams, matches, scores and score audit logs, all protected by RLS.

Tournament management screens and the competition engine (round robin and single elimination)
are the next stages. Reservations, payments, subscriptions and ratings are out of scope.

## Tech stack

| Area            | Choice                                                           |
| --------------- | ---------------------------------------------------------------- |
| Framework       | Next.js 16.4 (App Router, Turbopack, Cache Components, Proxy)    |
| Language / UI   | TypeScript 5.9 (strict), React 19.3                              |
| Styling         | Tailwind CSS 4.3, shadcn/ui (Radix, "nova" style), Lucide icons  |
| Data / Auth     | Supabase (PostgreSQL, Auth, Storage) via `@supabase/ssr` 0.12    |
| Validation      | Zod 4                                                            |
| Quality         | ESLint 9 (`eslint-config-next`), Prettier 3 + Tailwind plugin    |
| Package manager | pnpm 9 · Node.js ≥ 22.18 (runs `.ts` scripts and tests natively) |
| Hosting         | Vercel                                                           |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional — the site runs without Supabase
pnpm dev                     # http://localhost:3000
```

Without Supabase credentials, `/venues` reads the local seed file
(`data/seeds/iligan_pickleball_venues_seed.json`) if it exists, and the rest of the public site
renders **fictional sample content**. A banner
appears on every page, and each sample card has a "Sample" badge. Sample records are left out
of the sitemap and get no structured data. Submissions return `503`, and the admin area explains
that authentication is not configured.

### Scripts

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Start the dev server                            |
| `pnpm build`       | Production build                                |
| `pnpm start`       | Serve the production build                      |
| `pnpm lint`        | ESLint                                          |
| `pnpm typecheck`   | Generate route types and run `tsc --noEmit`     |
| `pnpm format`      | Format with Prettier (`format:check` to verify) |
| `pnpm test`        | Unit tests (`node --test`, no extra deps)       |
| `pnpm db:test`     | Migration + RLS tests on a throwaway Postgres   |
| `pnpm seed:venues` | Generate venue seed SQL from the JSON seed      |
| `pnpm check`       | Lint + typecheck + format check + unit tests    |

The package is ESM (`"type": "module"`). Node runs pure TypeScript modules, scripts and tests
directly through type stripping, so they use relative imports with `.ts` extensions.

`pnpm db:test` needs local PostgreSQL binaries (`initdb`, `pg_ctl`, `psql`). It starts a
temporary cluster, applies Supabase stubs, every migration, the seeds (each twice, to prove
idempotency), and runs `supabase/tests/*.test.sql`.

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
   - the dashboard SQL editor: paste each file in `supabase/migrations/` in order.
3. **Local development only:** load sample data with `supabase db reset` (runs `supabase/seed.sql`)
   or paste the seed into the SQL editor. Do not seed production.
4. Import venues (safe to re-run, see [`data/seeds/README.md`](data/seeds/README.md)):
   ```bash
   pnpm seed:venues            # writes supabase/seeds/iligan_venues.sql
   ```
   Apply the generated SQL in the SQL editor or with `psql`. Imported venues are
   **unverified**. Re-imports never overwrite a venue once an admin has verified it.
5. Create an administrator:
   ```sql
   -- after creating the user under Authentication → Users
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
   Then sign in at `/admin/login`.
6. Optional: regenerate types after schema changes:
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

Tournament platform (`20261008100000_tournament_platform.sql`):

| Table                     | Notes                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `venues`                  | → `cities`. `verification_status` (default `unverified`), `source_key`, `source_references`, `is_test_data`. |
| `venue_courts`            | Courts recorded by admins only; never inferred from seed data.                                               |
| `organizations`           | Tournament organizers. Created through `create_organization()` (caller becomes owner).                       |
| `organization_members`    | `owner` / `organizer` / `scorekeeper`; an organization always keeps an owner.                                |
| `tournaments`             | → organization, venue. `phase`, `status`; test data can never be published.                                  |
| `tournament_divisions`    | Category (singles/doubles/mixed/open/custom), skill label, format, scoring (11, win by 2, best of 1/3/5).    |
| `participants`            | Players, scoped to an organization.                                                                          |
| `teams` / `team_members`  | Per division; team size and same-organization rules enforced by triggers.                                    |
| `registrations`           | Public sign-ups (`pending` until approved), contact details, hashed IP.                                      |
| `matches` / `match_games` | Rounds, positions, `next_match_id` progression, optimistic `version`.                                        |
| `match_court_assignments` | One current court per match.                                                                                 |
| `score_audit_logs`        | Every score submission, confirmation and correction (corrections need a reason).                             |

Competition tables are writable only through `security definer` functions, never directly.
The legacy `courts` and `events` tables remain until the venue and tournament pages replace them.

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
- Tournament data: anonymous visitors can read only published, non-test tournaments and
  their divisions, teams and matches, plus a limited set of columns on organizations and
  participants. Organization members can read their own organization's data. Owners and
  organizers manage tournaments; scorekeepers can only score. Tests in
  `supabase/tests/organization_isolation.test.sql` cover isolation across organizations.
- `src/proxy.ts` runs only on `/admin`. It refreshes the Supabase session and redirects
  signed-out users, but this is only an optimistic check. Each admin page also calls
  `requireAdmin()` on the server.

## Architecture

```text
src/
├── app/
│   ├── (public)/            # Public site (shared header/footer layout)
│   │   ├── page.tsx         # Home
│   │   ├── venues/          # /venues (search + barangay filter), /venues/[slug]
│   │   ├── courts/          # /courts, /courts/[city], /courts/[city]/[slug] (legacy)
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
│   ├── venues/ (+ seed/ importer: schema, slugs, SQL) courts/ cities/ clubs/ events/ …
├── hooks/                   # Client hooks (use-submission)
├── lib/
│   ├── supabase/            # public (cookie-less), server (session), client, service, proxy, storage
│   ├── validations/         # Zod schemas
│   ├── utils/  env.ts  seo.ts  cache-tags.ts
├── config/site.ts           # Site name, navigation, SEO keywords
├── types/                   # database.ts (Supabase types), content.ts (view models)
└── proxy.ts                 # Session refresh for /admin
data/seeds/                  # Curated venue seed (JSON) + schema docs and example fixture
scripts/                     # import-venue-seed.ts, db-test.sh
supabase/
├── migrations/              # Schema, RLS, storage bucket, tournament platform
├── seeds/                   # Generated venue seed SQL
├── tests/                   # SQL tests (RLS isolation, seed idempotency) + Supabase stubs
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
  - Unverified venues are `noindex`, left out of the sitemap and get no structured data.
  - Detail pages: `SportsActivityLocation` (verified venues only), `SportsOrganization`, `SportsEvent`, `Article`.
  - City pages: `ItemList`.
  - All pages with breadcrumbs: `BreadcrumbList`.
- `en-PH` locale, Philippine time zone formatting, and location-focused copy and URLs.

## Deployment (Vercel)

1. Import the repository in Vercel (the Next.js preset is detected automatically).
2. Add the environment variables above for Production and Preview.
3. Deploy. Images from Supabase Storage are allowed automatically through `images.remotePatterns`,
   which is derived from `NEXT_PUBLIC_SUPABASE_URL`.

## Next steps

- Stage 3: organizer dashboard (organizations, tournaments, divisions, registration review)
  and the public registration endpoint.
- Stage 4: round robin and single elimination generation, transactional scoring and
  progression, public bracket, schedule and results pages.

- Admin CRUD for courts, cities, clubs, events and articles, with image upload to `media` and
  `updateTag()` revalidation.
- A review queue in the admin area for submissions, with email notifications.
- Map view and geo search (PostGIS), plus filters for amenities and court type.
- Rich-text or MDX authoring for articles.
- End-to-end tests (Playwright) and CI running `pnpm check` and `pnpm build`.
- Analytics and monitoring (Vercel Analytics, Sentry).
