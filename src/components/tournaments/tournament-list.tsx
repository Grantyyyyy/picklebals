import { getPublishedTournaments } from "@/features/tournaments/queries";
import type { TournamentSummary } from "@/features/tournaments/types";

import { TournamentCard } from "./tournament-card";

/** In play first, then upcoming (soonest first), then finished (most recent first). */
function sortTournaments(tournaments: TournamentSummary[]): TournamentSummary[] {
  const rank = (t: TournamentSummary) =>
    t.phase === "in_progress" ? 0 : t.phase === "completed" || t.phase === "cancelled" ? 2 : 1;
  return [...tournaments].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    const order = Date.parse(a.startsAt) - Date.parse(b.startsAt);
    return rank(a) === 2 ? -order : order;
  });
}

/** Tournaments with live brackets, shown at the top of the events page. Renders nothing when empty. */
export async function TournamentList() {
  const tournaments = sortTournaments(await getPublishedTournaments());
  if (tournaments.length === 0) return null;

  return (
    <section aria-labelledby="tournaments-heading" className="mb-14 space-y-6">
      <div className="space-y-1">
        <h2
          id="tournaments-heading"
          className="font-heading text-3xl leading-[0.95] font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-4xl"
        >
          Tournaments
        </h2>
        <p className="text-muted-foreground">Live courts, brackets and results.</p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <TournamentCard tournament={tournament} />
          </li>
        ))}
      </ul>
    </section>
  );
}
