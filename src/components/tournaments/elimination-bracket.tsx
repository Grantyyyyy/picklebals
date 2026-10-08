import {
  matchesByRound,
  matchNumbers,
  roundLabel,
  teamsById,
} from "@/features/tournaments/bracket";
import type { LiveDivision, LiveMatch } from "@/features/tournaments/types";
import { cn } from "@/lib/utils";

import { MatchTile } from "./match-tile";

/**
 * A knockout bracket: one column per round. Each column splits its height evenly between its
 * matches, so a match always sits level with the midpoint of the two it is fed by, and the
 * connector lines are plain borders. Columns scroll sideways (and snap) on narrow screens.
 */
export function EliminationBracket({ division }: { division: LiveDivision }) {
  const rounds = matchesByRound(division);
  const numbers = matchNumbers(division);
  const teams = teamsById(division);

  return (
    <div
      className="-mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:px-0"
      role="region"
      aria-label={`${division.name} bracket`}
      tabIndex={0}
    >
      <ol className="grid min-w-max auto-cols-[17.5rem] grid-flow-col gap-8">
        {rounds.map((matches, roundIndex) => {
          const last = roundIndex === rounds.length - 1;
          const groups = last ? [matches] : pairs(matches);
          return (
            <li key={matches[0]?.round ?? roundIndex} className="flex snap-start flex-col">
              <h4 className="mb-2 flex items-baseline justify-between gap-2 border-b border-court/15 pb-2 font-sans text-xs font-semibold tracking-wide text-court-deep uppercase">
                {roundLabel(division, matches[0]?.round ?? roundIndex + 1)}
                <span className="font-medium tracking-normal text-muted-foreground normal-case tabular-nums">
                  {matches.length} {matches.length === 1 ? "match" : "matches"}
                </span>
              </h4>
              <div className="flex flex-1 flex-col">
                {groups.map((group) => (
                  <div
                    key={group[0]?.id}
                    className={cn(
                      "relative flex flex-1 flex-col",
                      // Bracket arm joining the pair's midpoints, reaching halfway to the next round.
                      !last &&
                        group.length === 2 &&
                        "after:pointer-events-none after:absolute after:top-1/4 after:bottom-1/4 after:left-full after:w-4 after:rounded-r-md after:border-y after:border-r after:border-court/30",
                    )}
                  >
                    {group.map((match) => (
                      <div
                        key={match.id}
                        className={cn(
                          "relative flex flex-1 items-center py-1.5",
                          // Stub from the previous round's arm into this match.
                          roundIndex > 0 &&
                            "before:pointer-events-none before:absolute before:top-1/2 before:right-full before:w-4 before:border-t before:border-court/30",
                        )}
                      >
                        <MatchTile
                          division={division}
                          match={match}
                          number={numbers.get(match.id) ?? 0}
                          teams={teams}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function pairs(matches: LiveMatch[]): LiveMatch[][] {
  const result: LiveMatch[][] = [];
  for (let index = 0; index < matches.length; index += 2) {
    result.push(matches.slice(index, index + 2));
  }
  return result;
}
