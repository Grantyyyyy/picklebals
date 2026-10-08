import { ClockIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { type CSSProperties } from "react";

import { EventTimingBadge } from "@/components/shared/live-status";
import { SampleBadge } from "@/components/shared/sample-content";
import {
  eventTypeLabels,
  formatDateParts,
  formatEventDate,
  formatEventTime,
} from "@/lib/utils/format";
import type { PickleballEvent } from "@/types/content";

/** The torn-off half of the ticket: month, day and weekday. Decorative; the body repeats the date as text. */
function TicketStub({ startsAt }: { startsAt: string }) {
  const { month, day, weekday } = formatDateParts(startsAt);
  return (
    <div
      aria-hidden="true"
      className="relative isolate flex w-20 shrink-0 origin-bottom-right flex-col items-center justify-center gap-1 overflow-hidden rounded-l-2xl bg-court-deep notch-r px-2 py-5 text-white transition-transform duration-300 ease-out motion-safe:group-hover:-rotate-2"
    >
      <span className="absolute inset-0 -z-10 bg-court-grain opacity-60" />
      <span className="text-xs font-bold tracking-wider text-ball uppercase">{month}</span>
      <span className="font-heading text-4xl leading-none font-extrabold font-stretch-condensed">
        {day}
      </span>
      <span className="text-[0.6875rem] font-semibold tracking-wider text-white/60 uppercase">
        {weekday}
      </span>
    </div>
  );
}

export function EventCard({ event }: { event: PickleballEvent }) {
  const location = event.venueName ?? event.city?.name;
  return (
    <article
      style={{ "--notch": "0.6rem" } as CSSProperties}
      className="group relative flex h-full drop-shadow-[0_1px_1.5px_oklch(0.44_0.095_160/0.22)] transition-[translate,filter] duration-300 ease-out hover:-translate-y-0.5 hover:drop-shadow-[0_12px_18px_oklch(0.25_0.05_165/0.16)]"
    >
      <TicketStub startsAt={event.startsAt} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-r-2xl border-l-2 border-dashed border-court/25 bg-card notch-l p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ball-soft px-2.5 py-0.5 text-xs font-semibold text-court-deep">
            {eventTypeLabels[event.eventType]}
          </span>
          <EventTimingBadge startsAt={event.startsAt} endsAt={event.endsAt} />
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
