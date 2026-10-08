import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

import { buildSampleSnapshot, buildSampleTournament } from "./sample";
import { loadTournamentSnapshot } from "./snapshot";
import type { TournamentSnapshot, TournamentSummary } from "./types";

const TOURNAMENT_SELECT =
  "id, slug, name, summary, description, starts_at, ends_at, phase, updated_at, city:cities!inner(name, slug, province), venue:venues(name, slug), organizer:organizations(name)" as const;

type TournamentRowWithRelations = Pick<
  Tables<"tournaments">,
  | "id"
  | "slug"
  | "name"
  | "summary"
  | "description"
  | "starts_at"
  | "ends_at"
  | "phase"
  | "updated_at"
> & {
  city: Pick<Tables<"cities">, "name" | "slug" | "province">;
  venue: Pick<Tables<"venues">, "name" | "slug"> | null;
  organizer: Pick<Tables<"organizations">, "name"> | null;
};

function mapTournament(row: TournamentRowWithRelations): TournamentSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    phase: row.phase,
    city: row.city,
    venue: row.venue,
    organizer: row.organizer?.name ?? null,
    updatedAt: row.updated_at,
    isSample: false,
  };
}

/** Published tournaments, newest first. RLS already hides drafts and test data. */
export async function getPublishedTournaments(): Promise<TournamentSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.tournaments);

  const supabase = createPublicClient();
  if (!supabase) return [buildSampleTournament(new Date())];

  const { data, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT)
    .eq("status", "published")
    .order("starts_at", { ascending: false });
  throwIfError(error, "tournaments");
  return (data ?? []).map(mapTournament);
}

export async function getTournamentBySlug(slug: string): Promise<TournamentSummary | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.tournaments);

  const supabase = createPublicClient();
  if (!supabase) {
    const sample = buildSampleTournament(new Date());
    return sample.slug === slug ? sample : null;
  }

  const { data, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, "tournament");
  return data ? mapTournament(data) : null;
}

/** Live state for the first render. Never cached: scores change by the second during play. */
export async function getTournamentSnapshot(
  tournament: TournamentSummary,
): Promise<TournamentSnapshot> {
  await connection();

  const supabase = createPublicClient();
  if (!supabase || tournament.isSample) return buildSampleSnapshot(new Date());
  return loadTournamentSnapshot(supabase, tournament.id);
}
