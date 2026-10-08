"use client";

import { RefreshCwIcon, TrophyIcon } from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  champion,
  isTournamentLive,
  liveMatches,
  upNextMatches,
} from "@/features/tournaments/bracket";
import type {
  LiveDivision,
  TournamentPhase,
  TournamentSnapshot,
} from "@/features/tournaments/types";
import { cn } from "@/lib/utils";
import { formatClockTime, formatEventDate, formatEventTime } from "@/lib/utils/format";

import { EliminationBracket } from "./elimination-bracket";
import { LiveNowBoard } from "./live-now-board";
import { RoundRobin } from "./round-robin";
import { type LiveConnection, useLiveSnapshot } from "./use-live-snapshot";

type LiveTournamentProps = {
  tournamentId: string;
  phase: TournamentPhase;
  startsAt: string;
  initialSnapshot: TournamentSnapshot;
  /** False for sample data, which has no live feed. */
  realtime: boolean;
};

export function LiveTournament({
  tournamentId,
  phase,
  startsAt,
  initialSnapshot,
  realtime,
}: LiveTournamentProps) {
  const { snapshot, connection, refresh } = useLiveSnapshot(
    tournamentId,
    initialSnapshot,
    realtime,
  );
  const live = liveMatches(snapshot);
  const upNext = upNextMatches(snapshot, 5);
  const playing = isTournamentLive(snapshot);
  const finished = phase === "completed" || phase === "cancelled";
  const drawn = snapshot.divisions.some((division) => division.matches.length > 0);

  return (
    <div className="space-y-10">
      <StatusLine
        connection={connection}
        fetchedAt={snapshot.fetchedAt}
        playing={playing}
        phase={phase}
        startsAt={startsAt}
        onRefresh={refresh}
      />

      {!finished && drawn && (
        <LiveNowBoard
          live={live}
          upNext={upNext}
          idleMessage={
            playing
              ? "Between matches. Courts and scores appear here the moment the next match starts."
              : `Play starts ${formatEventDate(startsAt)}, ${formatEventTime(startsAt, null)}. Courts and scores appear here the moment the first match begins.`
          }
        />
      )}

      {snapshot.divisions.length === 0 ? (
        <EmptyState
          title="Divisions coming soon"
          description="The organizer hasn't published this tournament's divisions yet. Brackets will appear here once they're drawn."
          icon={TrophyIcon}
        />
      ) : (
        <Divisions divisions={snapshot.divisions} />
      )}
    </div>
  );
}

function StatusLine({
  connection,
  fetchedAt,
  playing,
  phase,
  startsAt,
  onRefresh,
}: {
  connection: LiveConnection;
  fetchedAt: string;
  playing: boolean;
  phase: TournamentPhase;
  startsAt: string;
  onRefresh: () => void;
}) {
  const pill = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-live="polite">
      {phase === "cancelled" ? (
        <span className={cn(pill, "bg-destructive/10 text-destructive")}>Cancelled</span>
      ) : phase === "completed" ? (
        <span className={cn(pill, "bg-court-deep text-white")}>Final results</span>
      ) : playing ? (
        <span className={cn(pill, "bg-ink text-ball ring-1 ring-ball/40")}>
          <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
          In play
        </span>
      ) : (
        <span className={cn(pill, "bg-court-soft text-court-deep")}>
          Starts {formatEventDate(startsAt)}
        </span>
      )}

      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        {connection === "preview" && "Sample scores, not a live feed"}
        {connection === "connecting" && `Connecting… scores as of ${formatClockTime(fetchedAt)}`}
        {connection === "live" && (
          <>
            <span
              className="size-1.5 rounded-full bg-court ring-2 ring-court/20"
              aria-hidden="true"
            />
            Scores update live
          </>
        )}
        {connection === "offline" && (
          <>
            Reconnecting… scores as of {formatClockTime(fetchedAt)}
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-court hover:bg-court-soft focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <RefreshCwIcon className="size-3.5" aria-hidden="true" />
              Refresh
            </button>
          </>
        )}
      </span>
    </div>
  );
}

const formatLabels: Record<LiveDivision["format"], string> = {
  single_elimination: "Knockout",
  round_robin: "Round robin",
};

function Divisions({ divisions }: { divisions: LiveDivision[] }) {
  const [selectedId, setSelectedId] = useState(divisions[0]?.id);
  const tabsId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const selected = divisions.find((division) => division.id === selectedId) ?? divisions[0];
  if (!selected) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    const index = divisions.findIndex((division) => division.id === selected.id);
    let next: number | undefined;
    if (event.key in keys)
      next = (index + (keys[event.key] ?? 0) + divisions.length) % divisions.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = divisions.length - 1;
    const target = next === undefined ? undefined : divisions[next];
    if (!target) return;
    event.preventDefault();
    setSelectedId(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  return (
    <section aria-labelledby="divisions-heading" className="space-y-6">
      <h2
        id="divisions-heading"
        className="font-heading text-4xl leading-[0.95] font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-5xl"
      >
        Brackets
      </h2>

      {divisions.length > 1 && (
        <div
          role="tablist"
          aria-label="Divisions"
          onKeyDown={onKeyDown}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          {divisions.map((division) => {
            const active = division.id === selected.id;
            const hasLive = division.matches.some((match) => match.status === "in_progress");
            return (
              <button
                key={division.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(division.id, node);
                  else tabRefs.current.delete(division.id);
                }}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${division.id}`}
                aria-selected={active}
                aria-controls={`${tabsId}-panel`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelectedId(division.id)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-court-deep text-white"
                    : "bg-court-soft text-court-deep hover:bg-court/15",
                )}
              >
                {division.name}
                {division.skillLabel && (
                  <span className={active ? "text-white/70" : "text-court-deep/65"}>
                    {division.skillLabel}
                  </span>
                )}
                {hasLive && (
                  <span
                    className={cn("size-1.5 rounded-full", active ? "bg-ball" : "bg-court")}
                    aria-label="Matches in play"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div
        id={`${tabsId}-panel`}
        role={divisions.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={divisions.length > 1 ? `${tabsId}-tab-${selected.id}` : undefined}
      >
        <DivisionPanel division={selected} named={divisions.length > 1} />
      </div>
    </section>
  );
}

/** `named`: a selected tab already shows the division name, so the heading is kept for screen readers only. */
function DivisionPanel({ division, named }: { division: LiveDivision; named: boolean }) {
  const winner = champion(division);
  const rules = [
    formatLabels[division.format],
    `games to ${division.pointsToWin}, win by ${division.winBy}`,
    division.bestOf > 1 ? `best of ${division.bestOf}` : "one game",
  ].join(" · ");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h3
            className={cn(
              "font-heading text-2xl leading-tight font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-3xl",
              named && "sr-only",
            )}
          >
            {division.name}
            {division.skillLabel && <span className="text-court"> · {division.skillLabel}</span>}
          </h3>
          <p className={cn("text-sm text-muted-foreground", !named && "mt-1")}>
            {rules} · {division.teams.length} {division.teams.length === 1 ? "team" : "teams"}
          </p>
        </div>
        {winner && (
          <p className="inline-flex items-center gap-2 rounded-full bg-ball-soft px-4 py-2 text-sm font-semibold text-court-deep">
            <TrophyIcon className="size-4" aria-hidden="true" />
            Champions: {winner.name}
          </p>
        )}
      </header>

      {division.matches.length === 0 ? (
        <EmptyState
          title="Bracket not drawn yet"
          description="Matches appear here once the organizer draws this division, usually after registration closes."
          icon={TrophyIcon}
        />
      ) : division.format === "single_elimination" ? (
        <EliminationBracket division={division} />
      ) : (
        <RoundRobin division={division} />
      )}
    </div>
  );
}
