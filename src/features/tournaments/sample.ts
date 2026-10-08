import type {
  LiveDivision,
  LiveMatch,
  LiveTeam,
  TournamentSnapshot,
  TournamentSummary,
} from "./types";

/**
 * SAMPLE TOURNAMENT: rendered only when Supabase is not configured. Like the other local content
 * it shows without a Sample badge; it stays out of search (noindex, no sitemap entry).
 * Teams, players and scores are invented for previewing the live bracket. Like the sample
 * events, it is deliberately not tied to any real venue.
 */

const SAMPLE_ID = "sample-tournament-1";
export const SAMPLE_TOURNAMENT_SLUG = "majestic-falls-doubles-open";

const MINUTE = 60_000;

export function buildSampleTournament(now: Date): TournamentSummary {
  return {
    id: SAMPLE_ID,
    slug: SAMPLE_TOURNAMENT_SLUG,
    name: "Majestic Falls Doubles Open",
    summary: "A one-day doubles tournament across three divisions.",
    description:
      "Mixed, men's and women's doubles. Knockout brackets for the open and intermediate divisions, round robin for novices.",
    startsAt: new Date(now.getTime() - 3 * 60 * MINUTE).toISOString(),
    endsAt: new Date(now.getTime() + 5 * 60 * MINUTE).toISOString(),
    phase: "in_progress",
    city: { name: "Iligan", slug: "iligan", province: "Lanao del Norte" },
    venue: null,
    organizer: "Majestic Falls Picklers",
    updatedAt: now.toISOString(),
    isSample: true,
  };
}

function teams(prefix: string, pairs: [string, string][], seeded: boolean): LiveTeam[] {
  return pairs.map(([first, second], index) => ({
    id: `${prefix}-t${index + 1}`,
    name: `${first.split(" ").at(-1)} / ${second.split(" ").at(-1)}`,
    seed: seeded ? index + 1 : null,
    players: [first, second],
  }));
}

type MatchSpec = Partial<LiveMatch> & Pick<LiveMatch, "round" | "position">;

function matches(prefix: string, specs: MatchSpec[]): LiveMatch[] {
  return specs.map((spec) => ({
    id: `${prefix}-r${spec.round}m${spec.position}`,
    status: "pending",
    teamAId: null,
    teamBId: null,
    winnerTeamId: null,
    nextMatchId: null,
    nextMatchSlot: null,
    startedAt: null,
    confirmed: false,
    games: [],
    court: null,
    ...spec,
  }));
}

const games = (...scores: [number, number][]) =>
  scores.map(([a, b], index) => ({ number: index + 1, a, b }));

export function buildSampleSnapshot(now: Date): TournamentSnapshot {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * MINUTE).toISOString();
  const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * MINUTE).toISOString();

  // Mixed doubles, 8 seeded teams, best of 3: quarterfinals done, both semifinals on court.
  const mx = "sample-mx";
  const mxNext = (round: number, position: number) => ({
    nextMatchId: `${mx}-r${round + 1}m${Math.ceil(position / 2)}`,
    nextMatchSlot: position % 2 === 1 ? ("a" as const) : ("b" as const),
  });
  const mixed: LiveDivision = {
    id: `${mx}`,
    slug: "mixed-doubles-open",
    name: "Mixed Doubles",
    format: "single_elimination",
    status: "in_progress",
    skillLabel: "Open",
    pointsToWin: 11,
    winBy: 2,
    bestOf: 3,
    teams: teams(
      mx,
      [
        ["Andrea Villanueva", "Paolo Mercado"],
        ["Bea Navarro", "Carlo Aquino"],
        ["Joy Ramos", "Miguel Torres"],
        ["Kat Bautista", "Rico Salazar"],
        ["Liza Gomez", "Nico Fernandez"],
        ["Mae Castillo", "Jun Lim"],
        ["Rose Domingo", "Tony Pascual"],
        ["Grace Lopez", "Ben Rivera"],
      ],
      true,
    ),
    matches: [],
  };
  const mxDone = { status: "completed" as const, confirmed: true };
  mixed.matches = matches(mx, [
    {
      round: 1,
      position: 1,
      ...mxNext(1, 1),
      ...mxDone,
      teamAId: `${mx}-t1`,
      teamBId: `${mx}-t8`,
      winnerTeamId: `${mx}-t1`,
      games: games([11, 4], [11, 7]),
    },
    {
      round: 1,
      position: 2,
      ...mxNext(1, 2),
      ...mxDone,
      teamAId: `${mx}-t4`,
      teamBId: `${mx}-t5`,
      winnerTeamId: `${mx}-t5`,
      games: games([9, 11], [11, 8], [10, 12]),
    },
    {
      round: 1,
      position: 3,
      ...mxNext(1, 3),
      ...mxDone,
      teamAId: `${mx}-t2`,
      teamBId: `${mx}-t7`,
      winnerTeamId: `${mx}-t2`,
      games: games([11, 6], [13, 11]),
    },
    {
      round: 1,
      position: 4,
      ...mxNext(1, 4),
      ...mxDone,
      teamAId: `${mx}-t3`,
      teamBId: `${mx}-t6`,
      winnerTeamId: `${mx}-t3`,
      games: games([11, 9], [11, 5]),
    },
    {
      round: 2,
      position: 1,
      ...mxNext(2, 1),
      status: "in_progress",
      teamAId: `${mx}-t1`,
      teamBId: `${mx}-t5`,
      startedAt: ago(24),
      games: games([11, 8], [7, 9]),
      court: { label: "Court 1", startsAt: null },
    },
    {
      round: 2,
      position: 2,
      ...mxNext(2, 2),
      status: "in_progress",
      teamAId: `${mx}-t2`,
      teamBId: `${mx}-t3`,
      startedAt: ago(9),
      games: games([6, 4]),
      court: { label: "Court 2", startsAt: null },
    },
    { round: 3, position: 1 },
  ]);

  // Men's doubles, 6 teams in an 8-line draw: seeds 1 and 2 have byes.
  const md = "sample-md";
  const mdNext = (round: number, position: number) => ({
    nextMatchId: `${md}-r${round + 1}m${Math.ceil(position / 2)}`,
    nextMatchSlot: position % 2 === 1 ? ("a" as const) : ("b" as const),
  });
  const mens: LiveDivision = {
    id: md,
    slug: "mens-doubles-intermediate",
    name: "Men's Doubles",
    format: "single_elimination",
    status: "in_progress",
    skillLabel: "Intermediate",
    pointsToWin: 11,
    winBy: 2,
    bestOf: 1,
    teams: teams(
      md,
      [
        ["Arnel Cruz", "Dennis Ocampo"],
        ["Ely Santiago", "Ramon Tan"],
        ["Gino Valdez", "Mark Uy"],
        ["Jojo Reyes", "Allan Sy"],
        ["Leo Manalo", "Vince Garcia"],
        ["Noel Abad", "Ryan Chua"],
      ],
      true,
    ),
    matches: [],
  };
  mens.matches = matches(md, [
    {
      round: 1,
      position: 1,
      ...mdNext(1, 1),
      status: "bye",
      confirmed: true,
      teamAId: `${md}-t1`,
      winnerTeamId: `${md}-t1`,
    },
    {
      round: 1,
      position: 2,
      ...mdNext(1, 2),
      status: "completed",
      teamAId: `${md}-t4`,
      teamBId: `${md}-t5`,
      winnerTeamId: `${md}-t4`,
      games: games([11, 9]),
    },
    {
      round: 1,
      position: 3,
      ...mdNext(1, 3),
      status: "bye",
      confirmed: true,
      teamAId: `${md}-t2`,
      winnerTeamId: `${md}-t2`,
    },
    {
      round: 1,
      position: 4,
      ...mdNext(1, 4),
      status: "in_progress",
      teamAId: `${md}-t3`,
      teamBId: `${md}-t6`,
      startedAt: ago(6),
      games: games([8, 7]),
      court: { label: "Court 3", startsAt: null },
    },
    { round: 2, position: 1, ...mdNext(2, 1), teamAId: `${md}-t1` },
    { round: 2, position: 2, ...mdNext(2, 2), teamAId: `${md}-t2` },
    { round: 3, position: 1 },
  ]);

  // Women's doubles novice, 4 teams round robin: round 1 played, round 2 under way.
  const wd = "sample-wd";
  const womens: LiveDivision = {
    id: wd,
    slug: "womens-doubles-novice",
    name: "Women's Doubles",
    format: "round_robin",
    status: "in_progress",
    skillLabel: "Novice",
    pointsToWin: 11,
    winBy: 2,
    bestOf: 1,
    teams: teams(
      wd,
      [
        ["Ana Morales", "Cathy Lim"],
        ["Dina Flores", "Ella Javier"],
        ["Fe Santos", "Gina Robles"],
        ["Hazel Ong", "Iris Medina"],
      ],
      false,
    ),
    matches: [],
  };
  womens.matches = matches(wd, [
    {
      round: 1,
      position: 1,
      status: "completed",
      confirmed: true,
      teamAId: `${wd}-t1`,
      teamBId: `${wd}-t4`,
      winnerTeamId: `${wd}-t1`,
      games: games([11, 6]),
    },
    {
      round: 1,
      position: 2,
      status: "completed",
      confirmed: true,
      teamAId: `${wd}-t2`,
      teamBId: `${wd}-t3`,
      winnerTeamId: `${wd}-t3`,
      games: games([12, 14]),
    },
    {
      round: 2,
      position: 1,
      status: "in_progress",
      teamAId: `${wd}-t1`,
      teamBId: `${wd}-t3`,
      startedAt: ago(4),
      games: games([5, 3]),
      court: { label: "Court 4", startsAt: null },
    },
    {
      round: 2,
      position: 2,
      status: "scheduled",
      teamAId: `${wd}-t4`,
      teamBId: `${wd}-t2`,
      court: { label: "Court 5", startsAt: inMinutes(10) },
    },
    { round: 3, position: 1, status: "scheduled", teamAId: `${wd}-t1`, teamBId: `${wd}-t2` },
    { round: 3, position: 2, status: "scheduled", teamAId: `${wd}-t3`, teamBId: `${wd}-t4` },
  ]);

  return { divisions: [mixed, mens, womens], fetchedAt: now.toISOString() };
}
