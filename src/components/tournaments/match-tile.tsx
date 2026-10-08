import { CheckIcon } from "lucide-react";

import { emptySlotLabel, isGameFinished } from "@/features/tournaments/bracket";
import type { LiveDivision, LiveMatch, LiveTeam, MatchSlot } from "@/features/tournaments/types";
import { cn } from "@/lib/utils";
import { formatClockTime } from "@/lib/utils/format";

import { TickingNumber } from "./ticking-number";

type MatchTileProps = {
  division: LiveDivision;
  match: LiveMatch;
  number: number;
  teams: Map<string, LiveTeam>;
};

export function MatchTile({ division, match, number, teams }: MatchTileProps) {
  const live = match.status === "in_progress";
  const bye = match.status === "bye";
  const teamA = match.teamAId ? teams.get(match.teamAId) : undefined;
  const teamB = match.teamBId ? teams.get(match.teamBId) : undefined;

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-card text-sm transition-colors duration-200",
        live && "border-court ring-1 ring-court",
        bye && "border-dashed bg-transparent",
        match.status === "cancelled" && "opacity-60",
      )}
      aria-label={`Match ${number}: ${teamA?.name ?? "to be decided"} vs ${teamB?.name ?? "to be decided"}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <span className="tabular-nums">Match {number}</span>
        <MatchStatusLabel match={match} />
      </div>
      <TeamRow division={division} match={match} slot="a" team={teamA} />
      <TeamRow division={division} match={match} slot="b" team={teamB} />
    </div>
  );
}

function MatchStatusLabel({ match }: { match: LiveMatch }) {
  const court = match.court;
  switch (match.status) {
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 font-semibold text-court-deep">
          <span className="size-1.5 rounded-full bg-court" aria-hidden="true" />
          Live{court && ` · ${court.label}`}
        </span>
      );
    case "scheduled":
      return court ? (
        <span className="font-semibold text-court-deep">
          {court.label}
          {court.startsAt && ` · ${formatClockTime(court.startsAt)}`}
        </span>
      ) : (
        <span>Ready</span>
      );
    case "completed":
      return match.confirmed ? <span>Final</span> : <span className="italic">Unconfirmed</span>;
    case "bye":
      return <span>Bye</span>;
    case "cancelled":
      return <span>Cancelled</span>;
    default:
      return <span>Waiting</span>;
  }
}

function TeamRow({
  division,
  match,
  slot,
  team,
}: {
  division: LiveDivision;
  match: LiveMatch;
  slot: MatchSlot;
  team: LiveTeam | undefined;
}) {
  const decided = match.winnerTeamId !== null && match.status !== "bye";
  const won = team !== undefined && match.winnerTeamId === team.id;
  const lost = decided && team !== undefined && !won;
  const live = match.status === "in_progress";

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {division.teams.some((entry) => entry.seed !== null) && (
        <span className="w-4 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
          {team?.seed ?? ""}
        </span>
      )}
      {team ? (
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            won
              ? "font-semibold text-court-deep"
              : lost
                ? "text-muted-foreground"
                : "text-foreground",
          )}
          title={team.players.join(" & ") || team.name}
        >
          {team.name}
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-muted-foreground italic">
          {emptySlotLabel(division, match, slot)}
        </span>
      )}
      {won && <CheckIcon className="size-3.5 shrink-0 text-court" aria-label="Winner" />}
      {match.games.length > 0 && (
        <span className="flex shrink-0 gap-0.5">
          {match.games.map((game, index) => {
            const own = slot === "a" ? game.a : game.b;
            const other = slot === "a" ? game.b : game.a;
            const finished = isGameFinished(game, division);
            const current = live && !finished && index === match.games.length - 1;
            return (
              <span
                key={game.number}
                className={cn(
                  "w-6 overflow-hidden rounded-sm text-center tabular-nums",
                  current && "bg-ball-soft font-semibold text-court-deep",
                  finished && own > other && "font-semibold text-court-deep",
                  finished && own < other && "text-muted-foreground",
                )}
              >
                <TickingNumber value={own} />
              </span>
            );
          })}
        </span>
      )}
    </div>
  );
}
