import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Venue } from "@/types/content";

import { prepareVenueSeed } from "./seed/prepare";
import { venueSeedFileSchema } from "./seed/schema";

export const LOCAL_VENUE_SEED_PATH = "data/seeds/iligan_pickleball_venues_seed.json";

export type LocalVenueSeed =
  | { status: "missing" }
  | { status: "invalid"; message: string }
  | { status: "ok"; venues: Venue[] };

/**
 * Reads the curated venue seed directly when Supabase is not configured, so the venue directory
 * can be previewed locally. Venues keep their unverified status and are labeled as such.
 */
export async function loadLocalVenueSeed(): Promise<LocalVenueSeed> {
  let raw: string;
  try {
    raw = await readFile(join(process.cwd(), LOCAL_VENUE_SEED_PATH), "utf8");
  } catch {
    return { status: "missing" };
  }

  try {
    const file = venueSeedFileSchema.parse(JSON.parse(raw));
    const seed = prepareVenueSeed(file);
    const city = { name: seed.city.name, slug: seed.city.slug, province: seed.city.province };

    return {
      status: "ok",
      venues: seed.venues.map((venue) => ({
        id: `seed-${venue.sourceKey}`,
        slug: venue.slug,
        name: venue.name,
        address: venue.address,
        barangay: venue.barangay,
        city,
        latitude: venue.latitude,
        longitude: venue.longitude,
        description: null,
        contactPhone: null,
        contactEmail: null,
        websiteUrl: null,
        facebookUrl: null,
        imageUrl: null,
        verificationStatus: "unverified",
        sources: venue.sources.map((source) => ({
          label: source.label,
          url: source.url,
          type: source.type,
          accessedAt: source.accessed_at,
          note: source.note,
        })),
        dataNotes: venue.notes,
        courts: [],
        isTestData: false,
        origin: "seed-file",
        updatedAt: null,
      })),
    };
  } catch (error) {
    return { status: "invalid", message: error instanceof Error ? error.message : String(error) };
  }
}
