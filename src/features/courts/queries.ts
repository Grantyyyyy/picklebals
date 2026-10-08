import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { sampleContent } from "@/features/sample-content/data";
import { throwIfError, toIlikePattern } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { getMediaUrl } from "@/lib/supabase/storage";
import type { Court } from "@/types/content";
import type { Tables } from "@/types/database";

const COURT_SELECT = "*, city:cities!inner(name, slug, province)" as const;

type CourtRowWithCity = Tables<"courts"> & {
  city: Pick<Tables<"cities">, "name" | "slug" | "province">;
};

function mapCourt(row: CourtRowWithCity): Court {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    address: row.address,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    environment: row.environment,
    surface: row.surface,
    courtCount: row.court_count,
    amenities: row.amenities,
    openingHours: row.opening_hours,
    priceInfo: row.price_info,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    websiteUrl: row.website_url,
    facebookUrl: row.facebook_url,
    imageUrl: getMediaUrl(row.cover_image_path),
    isFeatured: row.is_featured,
    updatedAt: row.updated_at,
    isSample: false,
  };
}

export type CourtFilters = { query?: string; citySlug?: string };

export async function getCourts(filters: CourtFilters = {}): Promise<Court[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.courts);

  const query = filters.query?.trim().slice(0, 80);
  const supabase = createPublicClient();

  if (!supabase) {
    const term = query?.toLowerCase();
    return sampleContent.courts.filter(
      (court) =>
        (!filters.citySlug || court.city.slug === filters.citySlug) &&
        (!term || court.name.toLowerCase().includes(term)),
    );
  }

  let request = supabase.from("courts").select(COURT_SELECT).eq("status", "published");
  if (filters.citySlug) request = request.eq("city.slug", filters.citySlug);
  if (query) request = request.ilike("name", toIlikePattern(query));

  const { data, error } = await request.order("is_featured", { ascending: false }).order("name");
  throwIfError(error, "courts");
  return (data ?? []).map(mapCourt);
}

export async function getFeaturedCourts(limit = 4): Promise<Court[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.courts);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.courts.filter((court) => court.isFeatured).slice(0, limit);

  const { data, error } = await supabase
    .from("courts")
    .select(COURT_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  throwIfError(error, "featured courts");
  return (data ?? []).map(mapCourt);
}

export async function getCourtBySlug(slug: string): Promise<Court | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.courts);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.courts.find((court) => court.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("courts")
    .select(COURT_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, `court "${slug}"`);
  return data ? mapCourt(data) : null;
}

export async function getCourtStaticParams(): Promise<{ city: string; slug: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.courts);

  const courts = await getCourts();
  return courts.map((court) => ({ city: court.city.slug, slug: court.slug }));
}
