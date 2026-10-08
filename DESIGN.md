---
name: Pickleball Hub
description: Nike-sporty public home with WANDER-calm listing cards — court green, ink, and lime ball.
colors:
  court: "oklch(0.44 0.095 160)"
  court-deep: "oklch(0.25 0.05 165)"
  court-soft: "oklch(0.95 0.025 160)"
  ball: "oklch(0.9 0.19 122)"
  ball-soft: "oklch(0.97 0.07 118)"
  sand: "oklch(0.975 0.008 95)"
  ink: "oklch(0.18 0.018 165)"
  mist: "oklch(0.955 0.008 170)"
  background: "oklch(0.99 0.004 95)"
  foreground: "oklch(0.21 0.025 165)"
  muted-foreground: "oklch(0.48 0.02 165)"
  border: "oklch(0.91 0.01 120)"
  card: "oklch(1 0 0)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 15vw, 12.5rem)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
rounded:
  sm: "0.45rem"
  md: "0.6rem"
  lg: "0.75rem"
  xl: "1.05rem"
  "2xl": "1.35rem"
  full: "9999px"
spacing:
  page-x: "1rem"
  section: "5rem"
  card: "1.25rem"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.court}"
    textColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-primary-pill:
    backgroundColor: "{colors.court-deep}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.5rem"
  button-cta-lime:
    backgroundColor: "{colors.ball}"
    textColor: "{colors.court-deep}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.5rem"
  card-listing:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
---

# Design System: Pickleball Hub

## Overview

**Creative North Star: "Match-day type, gallery cards"**

The public site should feel like walking into a tournament weekend and then browsing a calm lookbook. Display type is athletic: condensed, uppercase, oversized Bricolage Grotesque on dark ink or court-deep fields, with a lime pickleball accent used sparingly. Listing surfaces are the opposite of that noise — white or mist cards, generous radius, photography first, hairline or dashed borders, no nested chrome.

This is the incumbent home identity (Nike-like sport energy + WANDER-like clean cards). New marketing and listing surfaces extend it. App/admin chrome can be quieter but must still use the same tokens and type pairing.

**Key Characteristics:**

- Condensed uppercase display vs. readable Geist body
- Court green + ink + lime ball; warm sand paper, not cool gray SaaS
- Dark sticky header; light content canvas
- Pills for actions; rounded-2xl tiles for listings
- Photography and scale carry emotion; cards stay quiet

## Colors

Court green, deep ink, and a rare lime ball on warm sand paper.

### Primary

- **Court Green** (`oklch(0.44 0.095 160)`): brand primary, links, default buttons, environment labels.
- **Court Deep** (`oklch(0.25 0.05 165)`): headlines, header/footer ink-adjacent actions, icon wells.

### Secondary

- **Ball Lime** (`oklch(0.9 0.19 122)`): scarce accent — header CTA, hero punctuation, labels on dark, selected marks. Never a page fill except the dedicated list-your-court band.

### Neutral

- **Sand Paper** (`oklch(0.99 0.004 95)` / `oklch(0.975 0.008 95)`): page background.
- **Ink** (`oklch(0.18 0.018 165)`): header, footer, hero scrim — never pure black.
- **Mist** (`oklch(0.955 0.008 170)`): quiet band behind card grids.
- **Card White** (`oklch(1 0 0)`): listing tiles.
- **Muted text** (`oklch(0.48 0.02 165)`): supporting copy; still tinted green, not gray-on-gray.

**The Ball Accent Rule.** Lime appears on ≤10% of any screen. If everything is highlighted, nothing is.

**The No-Beige-SaaS Rule.** Do not drift to Inter + zinc + violet. Warm sand and court chroma are the neutrals.

## Typography

**Display Font:** Bricolage Grotesque (`--font-display` / `font-heading`), loaded with the `wdth` axis; use condensed stretch on sport display.
**Body Font:** Geist (`--font-body` / `font-sans`)
**Label/Mono Font:** Geist for labels; system ui-monospace only for code.

**Character:** Display shouts the sport. Body stays calm and newsy. Never set long paragraphs in condensed uppercase.

### Hierarchy

- **Display** (800, `clamp(3.5rem, 15vw, 12.5rem)`, 0.85): hero wordmark-scale “PICKLEBALL” only.
- **Headline** (800, ~`text-4xl`–`text-6xl`, ~0.95): section titles, often uppercase condensed.
- **Title** (800, `text-xl`–`text-2xl`): card names in condensed uppercase.
- **Body** (400, `text-base`/`text-lg`, relaxed): descriptions, ~max-w-xl.
- **Label** (600–700, `text-xs`, wide tracking, uppercase): kicker lines, chips, nav meta.

**The Two-Voice Rule.** Condensed uppercase is for titles that name a place or a moment. Geist sentence case is for everything a person has to read.

## Layout

Page shell is `container-page`: `max-w-7xl` with `px-4` / `sm:px-6` / `lg:px-8`. Home sections stack with ~`pb-20` rhythm. Hero is a single rounded-[2rem] stage inside the container, not full-bleed to the viewport edge. Listing grids are 1 / 2 / 3 columns. Stats sit in a two-column split (copy + feature list) on large screens. Angled clip-path utilities (`clip-angle-top/bottom`) exist for court-shaped bands; use them on full-width color sections, not on cards.

## Elevation & Depth

Mostly tonal. Cards are flat white with a hairline or dashed court-tinted border. Hover may add a soft court-tinted shadow (`shadow-xl shadow-court/10`); rest state stays flat. Hero photography sits under an ink gradient scrim. Header uses `bg-ink/95` plus backdrop blur. Do not stack cards in cards or use glow shadows.

**The Flat-Tile Rule.** Listing cards lift only on hover. Depth is photography, scrims, and ink bands — not drop shadows at rest.

## Shapes

Base radius token is `0.75rem`. Listing tiles are `rounded-2xl`; hero stage and large media cards go up to `rounded-[2rem]` / `rounded-3xl`. Primary marketing actions are **pills** (`rounded-full`). Default shadcn buttons stay `rounded-lg` for dense UI chrome. Icon wells are circles or rounded-xl squares on ink/court-deep. Sport geometry is the acrylic court grain (`bg-court-grain`), real cropped court markings (`<CourtMarkings crop>`, kitchen tinted, net dashed) and angled clips. Never a square graph-paper grid or repeating tile pattern; do not add random blobs or purple mesh gradients.

**The Pill-for-Action Rule.** Promoted CTAs on the public site are capsules. Cards are rounded rectangles. Do not mix a squircle CTA on a pill-heavy page.

## Components

### Buttons

- **Shape:** dense UI = `rounded-lg` (0.75rem); public CTAs = pill.
- **Primary:** court green on sand-tinted white; hover `primary/80`.
- **Header CTA:** ball lime on court-deep text, pill, `h-10`.
- **Hero text links:** ghost pill, white 30% stroke, hover `bg-white/10`.
- **Focus:** 3px ring using `--ring` (`oklch(0.6 0.12 150)`).

### Chips

- Court-soft fill, court-deep text, `rounded-full`, `text-xs`. Amenity tags and environment labels. Uppercase only for status/environment, not for long amenity names.

### Cards / Containers

- **Listing / featured court:** white, `rounded-2xl`, dashed or solid court-tinted border, `p-5`, image `rounded-xl` inside — never a card wrapping another card.
- **Feature list rows:** mist fill, no border, `rounded-2xl`.
- **shadcn Card:** `rounded-xl`, ring-1 `foreground/10`, for forms and admin — not the home showcase language.

### Inputs / Fields

- `h-8`–`h-10`, `rounded-lg`, transparent fill, `border-input`. Focus: ring-3 ring-court. Hero search sits on the dark stage; keep fields legible (light fill or strong contrast), not ghost-on-ghost.

### Navigation

- Sticky ink header, white links, lime List-your-court pill. Footer is solid ink with ball uppercase group titles. Mobile: sheet/nav from existing `MobileNav`; keep the same ink + lime language.

### Signature: Hero stage

A single `rounded-[2rem]` court-deep (or photo + ink scrim) panel. Optional court grain. Eyebrow pill with a 6px ball dot. One oversized condensed word, then a sentence-case promise ending in a lime period. Search is the primary action; secondary links are ghost pills.

## Do's and Don'ts

### Do:

- **Do** keep Bricolage Grotesque + Geist as the only type pairing.
- **Do** use court / ink / ball tokens from `src/app/globals.css`; extend, don't replace.
- **Do** put athletic scale on heroes and section titles; keep listing cards quiet and photographic.
- **Do** mark sample/seed data with the existing Sample badge language — never as real social proof.

### Don't:

- **Don't** restyle the home into generic shadcn marketing (centered hero, Inter, nested cards, purple gradient).
- **Don't** use pure black, cool zinc palettes, or AI-beige `#fafafa` with no court chroma.
- **Don't** set body copy in uppercase condensed display.
- **Don't** nest cards or wrap every section in a bordered tile.
- **Don't** flood a page with ball lime or pulsing/glow decorations.
