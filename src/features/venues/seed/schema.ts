import { z } from "zod";

/**
 * Schema for `data/seeds/iligan_pickleball_venues_seed.json` (documented in data/seeds/README.md).
 *
 * Only identity and provenance fields are imported. Prices, facilities, court counts, photos and
 * third-party descriptions are deliberately absent: unknown keys are stripped, so they can never
 * reach the database even if a source file contains them.
 */

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

export const sourceReferenceSchema = z.object({
  label: trimmed(200),
  url: z
    .url({ protocol: /^https?$/ })
    .nullish()
    .transform((value) => value ?? null),
  type: optionalText(60),
  accessed_at: optionalText(40),
  note: optionalText(500),
});

export type SourceReference = z.infer<typeof sourceReferenceSchema>;

export const seedVenueSchema = z
  .object({
    name: trimmed(200),
    /** Optional pinned slug; otherwise derived from the name. */
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens")
      .max(80)
      .optional(),
    address: optionalText(400),
    barangay: optionalText(120),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    sources: z.array(sourceReferenceSchema).default([]),
    notes: optionalText(1000),
  })
  .refine((venue) => (venue.latitude == null) === (venue.longitude == null), {
    message: "Provide both latitude and longitude, or neither",
    path: ["latitude"],
  });

export type SeedVenue = z.infer<typeof seedVenueSchema>;

export const divisionCategories = [
  "mens_singles",
  "womens_singles",
  "mens_doubles",
  "womens_doubles",
  "mixed_doubles",
  "open",
  "custom",
] as const;

const demoTeamSchema = z.object({
  name: trimmed(120),
  players: z.array(trimmed(120)).min(1).max(2),
});

const demoDivisionSchema = z.object({
  name: trimmed(120),
  category: z.enum(divisionCategories),
  skill_label: optionalText(60),
  format: z.enum(["round_robin", "single_elimination"]).default("round_robin"),
  teams: z.array(demoTeamSchema).default([]),
});

/** Fictional tournament used to demonstrate setup and bracket generation. Always test data. */
export const demoTournamentSchema = z.object({
  name: trimmed(160),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(80)
    .optional(),
  description: optionalText(4000),
  organizer_name: optionalText(120),
  venue_name: optionalText(200),
  starts_at: optionalText(40),
  divisions: z.array(demoDivisionSchema).default([]),
});

export type DemoTournament = z.infer<typeof demoTournamentSchema>;

export const venueSeedFileSchema = z.object({
  dataset: z
    .object({
      name: optionalText(120),
      version: z.union([z.string(), z.number()]).nullish(),
      compiled_at: optionalText(40),
      description: optionalText(2000),
      /** Mark every imported venue as test data (`venues.is_test_data`). */
      test_data: z.boolean().default(false),
    })
    .nullish(),
  city: z
    .object({
      name: trimmed(80),
      province: trimmed(80),
      region: optionalText(80),
    })
    .default({ name: "Iligan", province: "Lanao del Norte", region: "Northern Mindanao" }),
  venues: z.array(seedVenueSchema).min(1, "The seed file must contain at least one venue"),
  demo_tournament: demoTournamentSchema.nullish(),
});

export type VenueSeedFile = z.infer<typeof venueSeedFileSchema>;

/** Human-readable validation errors with JSON paths, e.g. `venues[3].sources[0].url: Invalid URL`. */
export function formatSeedIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path
      .map((part, index) =>
        typeof part === "number" ? `[${part}]` : `${index === 0 ? "" : "."}${String(part)}`,
      )
      .join("");
    return `${path || "(root)"}: ${issue.message}`;
  });
}
