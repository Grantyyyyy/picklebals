import type {
  LiveDivision,
  LiveGame,
  LiveMatch,
  LiveTeam,
  MatchSlot,
  TournamentSnapshot,
} from "./types";

/** A game is over once a team reaches the target score with the required lead. */
export function isGameFinished(game: LiveGame, division: LiveDivision): boolean {
  return (
    Math.max(game.a, game.b) >= division.pointsToWin && Math.abs(game.a - game.b) >= division.winBy
  );
}

export function roundCount(division: LiveDivision): number {
  return division.matches.reduce((max, match) => Math.max(max, match.round), 0);
}

export function roundLabel(division: LiveDivision, round: number): string {
  if (division.format === "round_robin") return `Round ${round}`;
  const fromEnd = roundCount(division) - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round of ${2 ** (fromEnd + 1)}`;
}

/** Matches grouped by round, in round order. */
export function matchesByRound(division: LiveDivision): LiveMatch[][] {
  const rounds = new Map<number, LiveMatch[]>();
  for (const match of division.matches) {
    rounds.set(match.round, [...(rounds.get(match.round) ?? []), match]);
  }
  return [...rounds.entries()].sort(([a], [b]) => a - b).map(([, matches]) => matches);
}

/** Bracket-wide match numbers (1, 2, 3 …) in round and position order, as a desk would call them. */
export function matchNumbers(division: LiveDivision): Map<string, number> {
  return new Map(division.matches.map((match, index) => [match.id, index + 1]));
}

export function teamsById(division: LiveDivision): Map<string, LiveTeam> {
  return new Map(division.teams.map((team) => [team.id, team]));
}

/** What to show in a slot that has no team yet. */
export function emptySlotLabel(division: LiveDivision, match: LiveMatch, slot: MatchSlot): string {
  if (match.status === "bye") return "Bye";
  const feeder = division.matches.find(
    (candidate) => candidate.nextMatchId === match.id && candidate.nextMatchSlot === slot,
  );
  if (!feeder) return "To be decided";
  return `Winner of match ${matchNumbers(division).get(feeder.id)}`;
}

export function champion(division: LiveDivision): LiveTeam | null {
  if (division.format !== "single_elimination") return null;
  const rounds = roundCount(division);
  const final = division.matches.find((match) => match.round === rounds);
  if (!final?.winnerTeamId || !final.confirmed) return null;
  return teamsById(division).get(final.winnerTeamId) ?? null;
}

export type Standing = {
  team: LiveTeam;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
};

/** Round-robin table from decided matches: wins, then point difference, then points scored. */
export function standings(division: LiveDivision): Standing[] {
  const table = new Map<string, Standing>(
    division.teams.map((team) => [
      team.id,
      { team, played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0 },
    ]),
  );

  for (const match of division.matches) {
    if (match.status !== "completed" || !match.teamAId || !match.teamBId) continue;
    const a = table.get(match.teamAId);
    const b = table.get(match.teamBId);
    if (!a || !b) continue;
    for (const game of match.games) {
      a.pointsFor += game.a;
      a.pointsAgainst += game.b;
      b.pointsFor += game.b;
      b.pointsAgainst += game.a;
    }
    a.played += 1;
    b.played += 1;
    const [winner, loser] = match.winnerTeamId === match.teamAId ? [a, b] : [b, a];
    winner.won += 1;
    loser.lost += 1;
  }

  return [...table.values()].sort(
    (x, y) =>
      y.won - x.won ||
      y.pointsFor - y.pointsAgainst - (x.pointsFor - x.pointsAgainst) ||
      y.pointsFor - x.pointsFor ||
      x.team.name.localeCompare(y.team.name),
  );
}

export type BoardMatch = {
  match: LiveMatch;
  division: LiveDivision;
  number: number;
  teamA: LiveTeam | null;
  teamB: LiveTeam | null;
};

function boardMatches(
  snapshot: TournamentSnapshot,
  keep: (match: LiveMatch) => boolean,
): BoardMatch[] {
  return snapshot.divisions.flatMap((division) => {
    const teams = teamsById(division);
    const numbers = matchNumbers(division);
    return division.matches.filter(keep).map((match) => ({
      match,
      division,
      number: numbers.get(match.id) ?? 0,
      teamA: match.teamAId ? (teams.get(match.teamAId) ?? null) : null,
      teamB: match.teamBId ? (teams.get(match.teamBId) ?? null) : null,
    }));
  });
}

const byCourt = (x: BoardMatch, y: BoardMatch) =>
  (x.match.court?.label ?? "~").localeCompare(y.match.court?.label ?? "~", undefined, {
    numeric: true,
  });

/** Matches being played right now, in court order. */
export function liveMatches(snapshot: TournamentSnapshot): BoardMatch[] {
  return boardMatches(snapshot, (match) => match.status === "in_progress").sort(byCourt);
}

/** Ready matches: those already called to a court first (by start time), then bracket order. */
export function upNextMatches(snapshot: TournamentSnapshot, limit: number): BoardMatch[] {
  const time = (entry: BoardMatch) =>
    entry.match.court?.startsAt ? Date.parse(entry.match.court.startsAt) : Infinity;
  return boardMatches(snapshot, (match) => match.status === "scheduled")
    .sort(
      (x, y) =>
        Number(!x.match.court) - Number(!y.match.court) ||
        time(x) - time(y) ||
        byCourt(x, y) ||
        x.match.round - y.match.round ||
        x.number - y.number,
    )
    .slice(0, limit);
}

export function isTournamentLive(snapshot: TournamentSnapshot): boolean {
  return snapshot.divisions.some(
    (division) =>
      division.status === "in_progress" ||
      division.matches.some((match) => match.status === "in_progress"),
  );
}
