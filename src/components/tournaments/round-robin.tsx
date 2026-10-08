import {
  matchesByRound,
  matchNumbers,
  roundLabel,
  standings,
  teamsById,
} from "@/features/tournaments/bracket";
import type { LiveDivision } from "@/features/tournaments/types";

import { MatchTile } from "./match-tile";

export function RoundRobin({ division }: { division: LiveDivision }) {
  const table = standings(division);
  const numbers = matchNumbers(division);
  const teams = teamsById(division);
  const pending = division.matches.some(
    (match) => match.status === "completed" && !match.confirmed,
  );

  return (
    <div className="space-y-8">
      <section aria-labelledby={`${division.id}-standings`}>
        <h4
          id={`${division.id}-standings`}
          className="mb-3 font-sans text-xs font-semibold tracking-wide text-court-deep uppercase"
        >
          Standings
        </h4>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm tabular-nums">
            <thead className="bg-mist text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="w-10 py-2 pl-4 font-semibold">
                  #
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Team
                </th>
                <th scope="col" className="w-10 py-2 text-center font-semibold">
                  <abbr title="Played" className="no-underline">
                    P
                  </abbr>
                </th>
                <th scope="col" className="w-10 py-2 text-center font-semibold">
                  <abbr title="Won" className="no-underline">
                    W
                  </abbr>
                </th>
                <th scope="col" className="w-10 py-2 text-center font-semibold">
                  <abbr title="Lost" className="no-underline">
                    L
                  </abbr>
                </th>
                <th scope="col" className="w-14 py-2 pr-4 text-right font-semibold">
                  <abbr title="Point difference" className="no-underline">
                    +/−
                  </abbr>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {table.map((row, index) => {
                const diff = row.pointsFor - row.pointsAgainst;
                return (
                  <tr key={row.team.id}>
                    <td className="py-2.5 pl-4 text-muted-foreground">{index + 1}</td>
                    <th scope="row" className="py-2.5 pr-2 text-left font-medium text-foreground">
                      <span className="block truncate" title={row.team.players.join(" & ")}>
                        {row.team.name}
                      </span>
                    </th>
                    <td className="py-2.5 text-center text-muted-foreground">{row.played}</td>
                    <td className="py-2.5 text-center font-semibold text-court-deep">{row.won}</td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.lost}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">
                      {diff > 0 ? `+${diff}` : diff < 0 ? `−${-diff}` : "0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pending && (
          <p className="mt-2 text-xs text-muted-foreground">
            Includes results still waiting for the organizer to confirm.
          </p>
        )}
      </section>

      {matchesByRound(division).map((matches) => {
        const round = matches[0]?.round ?? 0;
        return (
          <section key={round} aria-labelledby={`${division.id}-round-${round}`}>
            <h4
              id={`${division.id}-round-${round}`}
              className="mb-3 font-sans text-xs font-semibold tracking-wide text-court-deep uppercase"
            >
              {roundLabel(division, round)}
            </h4>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <li key={match.id}>
                  <MatchTile
                    division={division}
                    match={match}
                    number={numbers.get(match.id) ?? 0}
                    teams={teams}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
