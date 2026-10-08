import { type BoardMatch, isGameFinished, roundLabel } from "@/features/tournaments/bracket";
import type { LiveTeam } from "@/features/tournaments/types";
import { cn } from "@/lib/utils";
import { formatClockTime } from "@/lib/utils/format";

import { TickingNumber } from "./ticking-number";

type LiveNowBoardProps = {
  live: BoardMatch[];
  upNext: BoardMatch[];
  /** Shown in place of court cards when nothing is on court. */
  idleMessage: string;
};

/** The venue board: what is on each court right now, then what gets called next. */
export function LiveNowBoard({ live, upNext, idleMessage }: LiveNowBoardProps) {
  return (
    <section
      aria-labelledby="live-now"
      className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-5 py-6 text-white sm:px-8 sm:py-8"
    >
      <div className="absolute inset-0 -z-10 bg-court-grain opacity-[0.07]" aria-hidden="true" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="live-now"
          className="font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-5xl"
        >
          Live now
        </h2>
        <p className="text-sm text-white/65">
          {live.length === 0
            ? "No matches on court"
            : `${live.length} ${live.length === 1 ? "match" : "matches"} on court`}
        </p>
      </div>

      {live.length > 0 ? (
        <ul className="-mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {live.map((entry) => (
            <CourtCard key={entry.match.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 max-w-xl text-white/70">{idleMessage}</p>
      )}

      {upNext.length > 0 && (
        <div className="mt-7">
          <h3 className="font-sans text-xs font-semibold tracking-wide text-white/60 uppercase">
            Up next
          </h3>
          <ol className="mt-2 divide-y divide-white/10">
            {upNext.map((entry) => (
              <UpNextRow key={entry.match.id} entry={entry} />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function CourtCard({ entry }: { entry: BoardMatch }) {
  const { match, division } = entry;
  const lastGame = match.games.at(-1);
  const inGame = lastGame !== undefined && !isGameFinished(lastGame, division);
  const current = inGame ? lastGame : { number: match.games.length + 1, a: 0, b: 0 };
  const played = inGame ? match.games.slice(0, -1) : match.games;

  return (
    <li className="w-[85%] shrink-0 snap-start rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:w-auto">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-3xl leading-none font-extrabold uppercase font-stretch-condensed">
          {match.court?.label ?? "Court TBA"}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ball">
          <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
          Live
        </span>
      </div>
      <p className="mt-1 truncate text-xs text-white/60">
        {division.name} · {roundLabel(division, match.round)} · Match {entry.number}
      </p>

      <dl className="mt-4 space-y-2">
        <BoardTeam
          team={entry.teamA}
          score={current.a}
          played={played.map((game) => [game.a, game.b])}
        />
        <BoardTeam
          team={entry.teamB}
          score={current.b}
          played={played.map((game) => [game.b, game.a])}
        />
      </dl>

      <p className="mt-3 text-xs text-white/55 tabular-nums">
        Game {current.number}
        {division.bestOf > 1 && ` of ${division.bestOf}`} · to {division.pointsToWin}
      </p>
    </li>
  );
}

function BoardTeam({
  team,
  score,
  played,
}: {
  team: LiveTeam | null;
  score: number;
  played: [own: number, other: number][];
}) {
  return (
    <div className="flex items-center gap-3">
      <dt className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{team?.name ?? "To be decided"}</span>
        {team && team.players.length > 0 && (
          <span className="block truncate text-xs text-white/55">{team.players.join(" & ")}</span>
        )}
      </dt>
      <dd className="flex items-baseline gap-2 tabular-nums">
        {played.map(([own, other], index) => (
          <span
            key={index}
            className={cn("text-sm", own > other ? "font-semibold text-white" : "text-white/45")}
            aria-label={`Game ${index + 1}: ${own}`}
          >
            {own}
          </span>
        ))}
        <span className="w-10 overflow-hidden text-right text-3xl leading-none font-semibold">
          <TickingNumber value={score} />
        </span>
      </dd>
    </div>
  );
}

function UpNextRow({ entry }: { entry: BoardMatch }) {
  const { match, division } = entry;
  return (
    <li className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-2.5 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <span className="font-semibold text-white">
        {match.court ? (
          match.court.label
        ) : (
          <span className="font-normal text-white/50">No court yet</span>
        )}
        {match.court?.startsAt && (
          <span className="block text-xs font-normal text-white/60 tabular-nums">
            {formatClockTime(match.court.startsAt)}
          </span>
        )}
      </span>
      <span className="min-w-0 truncate text-white/85">
        {entry.teamA?.name ?? "To be decided"} <span className="text-white/45">vs</span>{" "}
        {entry.teamB?.name ?? "To be decided"}
      </span>
      <span className="col-start-2 truncate text-xs text-white/50 sm:col-start-auto">
        {division.name} · Match {entry.number}
      </span>
    </li>
  );
}
