import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { LiveDivision, LiveGame, LiveMatch, LiveTeam, TournamentSnapshot } from "./types";

/**
 * Loads the live state of a published tournament. Runs on the server for the first render and
 * in the browser whenever Supabase Realtime reports a change; RLS limits both to public rows.
 */
export async function loadTournamentSnapshot(
  supabase: SupabaseClient<Database>,
  tournamentId: string,
): Promise<TournamentSnapshot> {
  const [divisions, teams, matches, games, courts] = await Promise.all([
    supabase
      .from("tournament_divisions")
      .select(
        "id, slug, name, format, status, skill_label, points_to_win, win_by, best_of, sort_order",
      )
      .eq("tournament_id", tournamentId)
      .order("sort_order")
      .order("name"),
    supabase
      .from("teams")
      .select("id, division_id, name, seed, team_members(participant:participants(full_name))")
      .eq("tournament_id", tournamentId),
    supabase
      .from("matches")
      .select(
        "id, division_id, round, position, status, team_a_id, team_b_id, winner_team_id, next_match_id, next_match_slot, started_at, confirmed_at",
      )
      .eq("tournament_id", tournamentId),
    supabase
      .from("match_games")
      .select("match_id, game_number, team_a_score, team_b_score")
      .eq("tournament_id", tournamentId),
    supabase
      .from("match_court_assignments")
      .select("match_id, court_label, scheduled_start_at")
      .eq("tournament_id", tournamentId)
      .eq("is_current", true),
  ]);

  for (const [result, name] of [
    [divisions, "divisions"],
    [teams, "teams"],
    [matches, "matches"],
    [games, "match games"],
    [courts, "court assignments"],
  ] as const) {
    failOn(result.error, name);
  }

  const gamesByMatch = new Map<string, LiveGame[]>();
  for (const game of games.data ?? []) {
    const list = gamesByMatch.get(game.match_id) ?? [];
    list.push({ number: game.game_number, a: game.team_a_score, b: game.team_b_score });
    gamesByMatch.set(game.match_id, list);
  }

  const courtByMatch = new Map(
    (courts.data ?? []).map((court) => [
      court.match_id,
      { label: court.court_label, startsAt: court.scheduled_start_at },
    ]),
  );

  const teamsByDivision = new Map<string, LiveTeam[]>();
  for (const team of teams.data ?? []) {
    const list = teamsByDivision.get(team.division_id) ?? [];
    list.push({
      id: team.id,
      name: team.name,
      seed: team.seed,
      players: team.team_members.flatMap((member) =>
        member.participant ? [member.participant.full_name] : [],
      ),
    });
    teamsByDivision.set(team.division_id, list);
  }

  const matchesByDivision = new Map<string, LiveMatch[]>();
  for (const match of matches.data ?? []) {
    const list = matchesByDivision.get(match.division_id) ?? [];
    list.push({
      id: match.id,
      round: match.round,
      position: match.position,
      status: match.status,
      teamAId: match.team_a_id,
      teamBId: match.team_b_id,
      winnerTeamId: match.winner_team_id,
      nextMatchId: match.next_match_id,
      nextMatchSlot: match.next_match_slot,
      startedAt: match.started_at,
      confirmed: match.confirmed_at !== null,
      games: (gamesByMatch.get(match.id) ?? []).sort((x, y) => x.number - y.number),
      court: courtByMatch.get(match.id) ?? null,
    });
    matchesByDivision.set(match.division_id, list);
  }

  return {
    divisions: (divisions.data ?? []).map((division): LiveDivision => ({
      id: division.id,
      slug: division.slug,
      name: division.name,
      format: division.format,
      status: division.status,
      skillLabel: division.skill_label,
      pointsToWin: division.points_to_win,
      winBy: division.win_by,
      bestOf: division.best_of,
      teams: (teamsByDivision.get(division.id) ?? []).sort(
        (x, y) => (x.seed ?? Infinity) - (y.seed ?? Infinity) || x.name.localeCompare(y.name),
      ),
      matches: (matchesByDivision.get(division.id) ?? []).sort(
        (x, y) => x.round - y.round || x.position - y.position,
      ),
    })),
    fetchedAt: new Date().toISOString(),
  };
}

function failOn(error: PostgrestError | null, context: string): void {
  if (error) throw new Error(`Failed to load ${context}: ${error.message}`);
}
