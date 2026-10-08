# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are pickleball players in Iligan City, Lanao del Norte, looking for a court, a club, or a game — often after bouncing between group chats. Secondary audiences are court owners/managers who want to list a venue for free, and (soon) organizers running tournaments.

[inferred from `src/config/site.ts`, README, and the public site copy]

## Product Purpose

Pickleball Hub is a city-scoped pickleball venue directory and tournament platform. Today it helps people in Iligan discover courts, clubs, events, and beginner guides in one place. Success is less searching, more playing: a player can find a nearby court or upcoming event without leaving the site.

Tournament management screens and the competition engine (round robin and single elimination) are planned next. Reservations, payments, subscriptions, and ratings are out of scope.

## Positioning

A Philippines-first, city-scoped pickleball hub — currently Iligan — rather than a generic global court finder. The schema is built so more cities can be added later; the UI does not yet.

## Operating Context

Players browse on the public web (`en-PH`, Asia/Manila). Listings can come from Supabase or, without credentials, from a local seed file with fictional sample content marked as Sample. Venue owners suggest listings via `/list-your-court`. Organizer workflows live in the database (RLS-protected) but do not yet have product screens.

## Capabilities and Constraints

- Public site: venues, clubs, events, learn/guides, about, contact, court search by city.
- Database foundation exists for organizations, divisions, registrations, teams, matches, scores, and score audit logs.
- Undecided / future: tournament management UI, multi-city UI, reservations, payments.
- Stack (existing codebase): Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui, Supabase, TypeScript. Do not swap this stack for visual work.

## Brand Commitments

- Name: **Pickleball Hub** (short: **PB Hub**).
- Tagline in site config: “Find your next tournament.” Hero currently leads with “Find your next game.”
- Voice: direct, local, sport-forward; Philippines / Iligan first.
- Binding visual constraint from the product owner (Reancirl): the public home redesign blends **Nike sporty energy** (condensed display type, dark ink, lime ball accent, athletic scale) with **WANDER-like clean cards** (calm white/mist tiles, generous radius, photography-led listings). Future UI work preserves this identity unless an explicit redesign is requested.

## Evidence on Hand

- Site copy and nav: `src/config/site.ts`
- Venue seed: `data/seeds/` (optional local JSON)
- Sample-content banners and badges when Supabase is not configured
- Logo: `src/components/shared/logo.tsx`, `public/icon.svg`
- Do not invent testimonials, player counts, press, or venue claims that are not in the codebase or seed data.

## Product Principles

1. Local first — one city at a time, starting with Iligan.
2. Get people on court faster than group chats can.
3. Free and simple for venues to list.
4. Do not fabricate social proof or market coverage the product does not have.
5. Preserve the sporty-home / clean-card identity once it is recorded in DESIGN.md.

## Accessibility & Inclusion

No product-specific WCAG mandate is recorded. Public pages are `lang="en-PH"`, include a skip-to-content link, and should stay usable on a phone. [inferred from layout; no formal a11y policy found]
