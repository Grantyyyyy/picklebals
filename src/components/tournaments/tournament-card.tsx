import { ArrowRightIcon, CalendarDaysIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import type { TournamentSummary } from "@/features/tournaments/types";
import { cn } from "@/lib/utils";
import { formatEventDate, formatEventTime } from "@/lib/utils/format";

const phaseLabels: Record<TournamentSummary["phase"], string> = {
  setup: "Coming up",
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  in_progress: "In play",
  completed: "Final results",
  cancelled: "Cancelled",
};

export function TournamentCard({ tournament }: { tournament: TournamentSummary }) {
  const playing = tournament.phase === "in_progress";
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-court/20 bg-card p-5 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-court/10">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            playing
              ? "bg-ink text-ball ring-1 ring-ball/40"
              : tournament.phase === "cancelled"
                ? "bg-destructive/10 text-destructive"
                : "bg-court-soft text-court-deep",
          )}
        >
          {playing && <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />}
          {phaseLabels[tournament.phase]}
        </span>
      </div>
      <h3 className="font-heading text-2xl leading-tight font-extrabold text-court-deep uppercase font-stretch-condensed">
        <Link href={`/tournaments/${tournament.slug}`} className="after:absolute after:inset-0">
          {tournament.name}
        </Link>
      </h3>
      {tournament.summary && <p className="text-sm text-muted-foreground">{tournament.summary}</p>}
      <div className="mt-auto space-y-1.5 pt-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDaysIcon className="size-3.5 text-court" aria-hidden="true" />
          <time dateTime={tournament.startsAt}>
            {formatEventDate(tournament.startsAt)} ·{" "}
            {formatEventTime(tournament.startsAt, tournament.endsAt)}
          </time>
        </p>
        <p className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5 text-court" aria-hidden="true" />
          {tournament.venue?.name ?? "Venue to be announced"}, {tournament.city.name}
        </p>
      </div>
      <p className="inline-flex items-center gap-1 text-sm font-semibold text-court">
        {playing ? "Follow live scores" : "Brackets and results"}
        <ArrowRightIcon
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </p>
    </article>
  );
}
