import type { CityRef } from "@/types/content";
import type { Enums } from "@/types/database";

export type TournamentPhase = Enums<"tournament_phase">;
export type BracketFormat = Enums<"bracket_format">;
export type DivisionStatus = Enums<"division_status">;
export type MatchStatus = Enums<"match_status">;
export type MatchSlot = Enums<"match_slot">;

/** The slow-changing facts about a tournament (cached). */
export type TournamentSummary = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  phase: TournamentPhase;
  city: CityRef;
  venue: { name: string; slug: string } | null;
  organizer: string | null;
  updatedAt: string;
  isSample: boolean;
};

export type LiveTeam = { id: string; name: string; seed: number | null; players: string[] };

export type LiveGame = { number: number; a: number; b: number };

export type LiveMatch = {
  id: string;
  round: number;
  position: number;
  status: MatchStatus;
  teamAId: string | null;
  teamBId: string | null;
  winnerTeamId: string | null;
  nextMatchId: string | null;
  nextMatchSlot: MatchSlot | null;
  startedAt: string | null;
  confirmed: boolean;
  games: LiveGame[];
  court: { label: string; startsAt: string | null } | null;
};

export type LiveDivision = {
  id: string;
  slug: string;
  name: string;
  format: BracketFormat;
  status: DivisionStatus;
  skillLabel: string | null;
  pointsToWin: number;
  winBy: number;
  bestOf: number;
  teams: LiveTeam[];
  matches: LiveMatch[];
};

/** Everything that changes during play (fetched fresh, then kept live in the browser). */
export type TournamentSnapshot = { divisions: LiveDivision[]; fetchedAt: string };
