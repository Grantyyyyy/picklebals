import { ClockIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { SampleBadge } from "@/components/shared/sample-content";
import {
  eventTypeLabels,
  formatDateParts,
  formatEventDate,
  formatEventTime,
} from "@/lib/utils/format";
import type { PickleballEvent } from "@/types/content";

export function EventDateChip({ startsAt }: { startsAt: string }) {
  const { month, day } = formatDateParts(startsAt);
  return (
    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-court-deep text-white">
      <span className="text-[11px] font-semibold tracking-wider text-ball uppercase">{month}</span>
      <span className="font-heading text-2xl leading-none font-bold">{day}</span>
    </div>
  );
}

export function EventCard({ event }: { event: PickleballEvent }) {
  const location = event.venueName ?? event.city?.name;
  return (
    <article className="group relative flex h-full gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-court/10">
      <EventDateChip startsAt={event.startsAt} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ball-soft px-2.5 py-0.5 text-xs font-semibold text-court-deep">
            {eventTypeLabels[event.eventType]}
          </span>
          {event.isSample && <SampleBadge />}
        </div>
        <h3 className="font-semibold text-court-deep">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          <time dateTime={event.startsAt}>
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt, event.endsAt)}
          </time>
        </p>
        {location && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            {location}
            {event.venueName && event.city ? `, ${event.city.name}` : ""}
          </p>
        )}
      </div>
    </article>
  );
}
