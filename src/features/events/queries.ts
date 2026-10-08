import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { buildSampleEvents } from "@/features/sample-content/data";
import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { getMediaUrl } from "@/lib/supabase/storage";
import type { PickleballEvent } from "@/types/content";
import type { Tables } from "@/types/database";

const EVENT_SELECT =
  "*, city:cities(name, slug, province), court:courts(name, slug, city:cities(slug)), club:clubs(name, slug)" as const;

type EventRowWithRelations = Tables<"events"> & {
  city: Pick<Tables<"cities">, "name" | "slug" | "province"> | null;
  court: { name: string; slug: string; city: { slug: string } | null } | null;
  club: { name: string; slug: string } | null;
};

/** Events stay listed as "upcoming" until this long after they start (or end). */
const UPCOMING_GRACE_MS = 6 * 60 * 60 * 1000;

function mapEvent(row: EventRowWithRelations): PickleballEvent {
  const court = row.court;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    eventType: row.event_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venueName: row.venue_name,
    city: row.city,
    court:
      court?.city != null
        ? { name: court.name, slug: court.slug, citySlug: court.city.slug }
        : null,
    club: row.club,
    registrationUrl: row.registration_url,
    feeInfo: row.fee_info,
    imageUrl: getMediaUrl(row.cover_image_path),
    isFeatured: row.is_featured,
    updatedAt: row.updated_at,
    isSample: false,
  };
}

/** Upcoming published events. Cached hourly, so "now" is evaluated at most once per hour. */
export async function getUpcomingEvents(limit?: number): Promise<PickleballEvent[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.events);

  const now = new Date();
  const supabase = createPublicClient();

  if (!supabase) {
    const events = buildSampleEvents(now);
    return limit ? events.slice(0, limit) : events;
  }

  const cutoff = new Date(now.getTime() - UPCOMING_GRACE_MS).toISOString();
  let request = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    .gte("starts_at", cutoff)
    .order("starts_at");
  if (limit) request = request.limit(limit);

  const { data, error } = await request;
  throwIfError(error, "events");
  return (data ?? []).map(mapEvent);
}

export async function getEventBySlug(slug: string): Promise<PickleballEvent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.events);

  const supabase = createPublicClient();
  if (!supabase) return buildSampleEvents(new Date()).find((event) => event.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, `event "${slug}"`);
  return data ? mapEvent(data) : null;
}
