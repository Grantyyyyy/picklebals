import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { siteConfig } from "@/config/site";
import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { getMediaUrl } from "@/lib/supabase/storage";
import type { Venue, VenueSource } from "@/types/content";
import type { Json, Tables } from "@/types/database";

import { loadLocalVenueSeed } from "./local-seed";
import { sourceReferenceSchema } from "./seed/schema";

const VENUE_SELECT =
  "*, city:cities!inner(name, slug, province), courts:venue_courts(id, label, environment, surface, is_active, sort_order)" as const;

type VenueRowWithRelations = Tables<"venues"> & {
  city: Pick<Tables<"cities">, "name" | "slug" | "province">;
  courts: Pick<
    Tables<"venue_courts">,
    "id" | "label" | "environment" | "surface" | "is_active" | "sort_order"
  >[];
};

function parseSources(value: Json): VenueSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const parsed = sourceReferenceSchema.safeParse(entry);
    if (!parsed.success) return [];
    const { label, url, type, accessed_at, note } = parsed.data;
    return [{ label, url, type, accessedAt: accessed_at, note }];
  });
}

function mapVenue(row: VenueRowWithRelations): Venue {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address,
    barangay: row.barangay,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    websiteUrl: row.website_url,
    facebookUrl: row.facebook_url,
    imageUrl: getMediaUrl(row.cover_image_path),
    verificationStatus: row.verification_status,
    sources: parseSources(row.source_references),
    dataNotes: row.data_notes,
    courts: row.courts
      .filter((court) => court.is_active)
      .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
      .map(({ id, label, environment, surface }) => ({ id, label, environment, surface })),
    isTestData: row.is_test_data,
    origin: "database",
    updatedAt: row.updated_at,
  };
}

/** Verified venues first, then alphabetical. */
function sortVenues(venues: Venue[]): Venue[] {
  return [...venues].sort(
    (a, b) =>
      Number(b.verificationStatus === "verified") - Number(a.verificationStatus === "verified") ||
      a.name.localeCompare(b.name),
  );
}

export type VenueDataSource =
  | { kind: "database" }
  | { kind: "seed-file"; seedStatus: "ok" | "missing" | "invalid"; message?: string };

export type VenueDirectory = { venues: Venue[]; source: VenueDataSource };

async function loadAllVenues(): Promise<VenueDirectory> {
  const supabase = createPublicClient();

  if (!supabase) {
    const local = await loadLocalVenueSeed();
    if (local.status === "ok") {
      return { venues: sortVenues(local.venues), source: { kind: "seed-file", seedStatus: "ok" } };
    }
    return {
      venues: [],
      source: {
        kind: "seed-file",
        seedStatus: local.status,
        ...(local.status === "invalid" && { message: local.message }),
      },
    };
  }

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_SELECT)
    .eq("status", "published")
    .eq("city.slug", siteConfig.market.citySlug)
    .order("name");
  throwIfError(error, "venues");
  return { venues: sortVenues((data ?? []).map(mapVenue)), source: { kind: "database" } };
}

export type VenueFilters = { query?: string; barangay?: string };

/** Published venues in the current market (Iligan), optionally filtered. */
export async function getVenueDirectory(filters: VenueFilters = {}): Promise<VenueDirectory> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.venues);

  const directory = await loadAllVenues();
  const query = filters.query?.trim().slice(0, 80).toLowerCase();
  const barangay = filters.barangay?.trim().toLowerCase();

  if (!query && !barangay) return directory;
  return {
    ...directory,
    venues: directory.venues.filter(
      (venue) =>
        (!query ||
          venue.name.toLowerCase().includes(query) ||
          (venue.address?.toLowerCase().includes(query) ?? false)) &&
        (!barangay || venue.barangay?.toLowerCase() === barangay),
    ),
  };
}

/** Barangays that appear in the data; used for the location filter. */
export async function getVenueBarangays(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.venues);

  const { venues } = await loadAllVenues();
  const barangays = new Set(venues.flatMap((venue) => (venue.barangay ? [venue.barangay] : [])));
  return [...barangays].sort((a, b) => a.localeCompare(b));
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.venues);

  const supabase = createPublicClient();
  if (!supabase) {
    const { venues } = await loadAllVenues();
    return venues.find((venue) => venue.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_SELECT)
    .eq("status", "published")
    .eq("city.slug", siteConfig.market.citySlug)
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, `venue "${slug}"`);
  return data ? mapVenue(data) : null;
}
