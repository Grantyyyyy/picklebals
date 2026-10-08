import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { sampleContent } from "@/features/sample-content/data";
import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { getMediaUrl } from "@/lib/supabase/storage";
import type { Club } from "@/types/content";
import type { Tables } from "@/types/database";

const CLUB_SELECT =
  "*, city:cities(name, slug, province), home_court:courts(name, slug, city:cities(slug))" as const;

type ClubRowWithRelations = Tables<"clubs"> & {
  city: Pick<Tables<"cities">, "name" | "slug" | "province"> | null;
  home_court: { name: string; slug: string; city: { slug: string } | null } | null;
};

function mapClub(row: ClubRowWithRelations): Club {
  const homeCourt = row.home_court;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    city: row.city,
    homeCourt:
      homeCourt?.city != null
        ? { name: homeCourt.name, slug: homeCourt.slug, citySlug: homeCourt.city.slug }
        : null,
    skillLevels: row.skill_levels,
    meetingSchedule: row.meeting_schedule,
    contactEmail: row.contact_email,
    facebookUrl: row.facebook_url,
    websiteUrl: row.website_url,
    imageUrl: getMediaUrl(row.cover_image_path ?? row.logo_path),
    isFeatured: row.is_featured,
    updatedAt: row.updated_at,
    isSample: false,
  };
}

export async function getClubs(): Promise<Club[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.clubs);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.clubs;

  const { data, error } = await supabase
    .from("clubs")
    .select(CLUB_SELECT)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("name");
  throwIfError(error, "clubs");
  return (data ?? []).map(mapClub);
}

export async function getFeaturedClubs(limit = 3): Promise<Club[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.clubs);

  const clubs = await getClubs();
  return clubs.filter((club) => club.isFeatured).slice(0, limit);
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.clubs);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.clubs.find((club) => club.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("clubs")
    .select(CLUB_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, `club "${slug}"`);
  return data ? mapClub(data) : null;
}
