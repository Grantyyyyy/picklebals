---
version: 1
slug: "src-app-public-tournaments-slug-page-tsx"
primary_target: "src/app/(public)/tournaments/[slug]/page.tsx"
related_targets: []
---

# Live tournament page

Scope: public `/tournaments/[slug]`. Mode: Operate (players complete a task: find where and when they play, follow results).

Audience: players at the venue on a phone between matches (primary); remote family follow along (secondary). Job: who is on which court now, what is next, how the bracket stands. Constraints: extends the incumbent Nike-sport / WANDER-card world; Supabase Realtime keeps it live; sample data is badged Sample.

## Direction contract

THESIS: A tournament desk in your pocket — courts first, bracket second. Refuses the category default of a bracket tree as the whole first view on a phone.

OWN-WORLD: Ink "Live now" band with condensed uppercase court labels and tabular Geist scores; lime only on the live dot and the leading game score. Below, sand canvas with flat white match tiles (rounded-xl, hairline border), court-soft chips for division tabs.

STORY: The player sees which matches are on court and their score, finds their next match, then scrolls the division bracket or standings to see their path.

FIRST VIEWPORT: Breadcrumbs, condensed tournament title with live status pill and venue/date line, then the ink Live-now band: horizontally scrollable court cards (court label, two team rows, game scores) and an Up-next list.

FORM: Pinned by the user's answers (players at venue, Live-now board leads); no concept-seed roll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
