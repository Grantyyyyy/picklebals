import { createHash } from "node:crypto";

import { normalizeForKey, slugify } from "../../../lib/utils/slug.ts";
import type { SeedVenue, SourceReference, VenueSeedFile } from "./schema.ts";

/** A seed venue ready for import: stable identity, unique slug, provenance kept intact. */
export type PreparedVenue = {
  sourceKey: string;
  slug: string;
  name: string;
  address: string | null;
  barangay: string | null;
  latitude: number | null;
  longitude: number | null;
  sources: SourceReference[];
  notes: string | null;
};

export type PreparedSeed = {
  dataset: string;
  /** From `dataset.test_data`: every venue in this file is test data. */
  isTestData: boolean;
  city: { name: string; slug: string; province: string; region: string | null };
  venues: PreparedVenue[];
  warnings: string[];
};

/**
 * Stable identity for a venue across re-imports: a hash of its normalized name and address.
 * Re-ordering or reformatting the seed file does not change it.
 */
export function venueSourceKey(venue: Pick<SeedVenue, "name" | "address">): string {
  const material = `${normalizeForKey(venue.name)}|${normalizeForKey(venue.address)}`;
  return createHash("sha256").update(material).digest("hex").slice(0, 24);
}

/**
 * Assigns unique, deterministic slugs. A pinned `slug` wins; otherwise the name is used. When
 * several venues share a name, each gets a suffix (barangay when it disambiguates, else a short
 * hash), so the result never depends on the order of entries in the file.
 */
export function assignSlugs(venues: SeedVenue[]): string[] {
  const bases = venues.map((venue) => venue.slug ?? (slugify(venue.name) || "venue"));
  const groups = new Map<string, number[]>();
  bases.forEach((base, index) => groups.set(base, [...(groups.get(base) ?? []), index]));

  const slugs = [...bases];
  for (const [base, indexes] of groups) {
    if (indexes.length < 2) continue;
    const barangaySlugs = indexes.map((index) => slugify(venues[index]?.barangay ?? ""));
    const barangaysDisambiguate =
      barangaySlugs.every(Boolean) && new Set(barangaySlugs).size === barangaySlugs.length;
    indexes.forEach((index, position) => {
      const venue = venues[index];
      if (!venue || venue.slug) return;
      const suffix = barangaysDisambiguate
        ? barangaySlugs[position]
        : venueSourceKey(venue).slice(0, 6);
      slugs[index] = `${base}-${suffix}`;
    });
  }
  return slugs;
}

export function prepareVenueSeed(file: VenueSeedFile): PreparedSeed {
  const warnings: string[] = [];
  const slugs = assignSlugs(file.venues);

  const venues = file.venues.map((venue, index): PreparedVenue => {
    const label = `venues[${index}] "${venue.name}"`;
    if (!venue.address) warnings.push(`${label}: no address — shown as "not yet confirmed"`);
    if (venue.sources.length === 0) warnings.push(`${label}: no source references to review`);
    return {
      sourceKey: venueSourceKey(venue),
      slug: slugs[index] ?? slugify(venue.name),
      name: venue.name,
      address: venue.address,
      barangay: venue.barangay,
      latitude: venue.latitude ?? null,
      longitude: venue.longitude ?? null,
      sources: venue.sources,
      notes: venue.notes,
    };
  });

  const seenKeys = new Map<string, string>();
  const seenSlugs = new Map<string, string>();
  for (const venue of venues) {
    const keyOwner = seenKeys.get(venue.sourceKey);
    if (keyOwner) {
      throw new Error(
        `Duplicate venue: "${venue.name}" has the same name and address as "${keyOwner}"`,
      );
    }
    const slugOwner = seenSlugs.get(venue.slug);
    if (slugOwner) {
      throw new Error(`Slug "${venue.slug}" is used by both "${slugOwner}" and "${venue.name}"`);
    }
    seenKeys.set(venue.sourceKey, venue.name);
    seenSlugs.set(venue.slug, venue.name);
  }

  const datasetName = file.dataset?.name ?? "iligan_pickleball_venues_seed";
  const version = file.dataset?.version;

  return {
    dataset: version != null ? `${datasetName}@${version}` : datasetName,
    isTestData: file.dataset?.test_data ?? false,
    city: {
      name: file.city.name,
      slug: slugify(file.city.name),
      province: file.city.province,
      region: file.city.region,
    },
    venues,
    warnings,
  };
}
