import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ExternalLinkIcon,
  MapPinIcon,
  TicketIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { SampleBadge } from "@/components/shared/sample-content";
import { Button } from "@/components/ui/button";
import { getCourtBySlug } from "@/features/courts/queries";
import {
  eventTypeLabels,
  formatDateParts,
  formatEventDate,
  formatEventTime,
} from "@/lib/utils/format";
import type { Court, PickleballEvent } from "@/types/content";

function venueMapsUrl(court: Court | null): string | null {
  if (!court) return null;
  const query =
    court.latitude != null && court.longitude != null
      ? `${court.latitude},${court.longitude}`
      : court.address
        ? `${court.name}, ${court.address}`
        : null;
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
}

export async function FeaturedEventCard({ event }: { event: PickleballEvent }) {
  const court = event.court ? await getCourtBySlug(event.court.slug) : null;
  const mapsUrl = venueMapsUrl(court);
  const venue = event.venueName ?? event.court?.name;
  const { month, day } = formatDateParts(event.startsAt);
  const titleId = `featured-event-${event.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="grid overflow-hidden rounded-3xl border bg-card shadow-xl shadow-court-deep/5 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ball-soft px-2.5 py-0.5 text-xs font-semibold text-court-deep">
            {eventTypeLabels[event.eventType]}
          </span>
          {event.isSample && <SampleBadge />}
        </div>
        <div className="space-y-2">
          <h3
            id={titleId}
            className="font-heading text-3xl leading-tight font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-4xl"
          >
            {event.title}
          </h3>
          {event.summary && <p className="text-muted-foreground">{event.summary}</p>}
        </div>
        <dl className="grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
          <Detail icon={CalendarDaysIcon} label="When">
            <time dateTime={event.startsAt}>
              {formatEventDate(event.startsAt)}
              <br />
              {formatEventTime(event.startsAt, event.endsAt)}
            </time>
          </Detail>
          {(venue || event.city) && (
            <Detail icon={MapPinIcon} label="Where">
              {venue}
              {venue && event.city ? ", " : ""}
              {event.city?.name}
            </Detail>
          )}
          {event.feeInfo && (
            <Detail icon={TicketIcon} label="Fee">
              {event.feeInfo}
            </Detail>
          )}
          {event.club && (
            <Detail icon={UsersRoundIcon} label="Hosted by">
              <Link href={`/clubs/${event.club.slug}`} className="hover:underline">
                {event.club.name}
              </Link>
            </Detail>
          )}
        </dl>
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          {event.registrationUrl && (
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                Register
                <ExternalLinkIcon className="size-4" aria-hidden="true" />
                <span className="sr-only"> for {event.title} (opens in a new tab)</span>
              </a>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant={event.registrationUrl ? "outline" : "default"}
            className="h-11 rounded-full px-6"
          >
            <Link href={`/events/${event.slug}`}>
              Event details
              <span className="sr-only"> for {event.title}</span>
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative isolate flex min-h-64 flex-col justify-between gap-8 overflow-hidden bg-court-gradient p-6 text-white sm:p-10">
        <div className="absolute inset-0 -z-10 bg-court-lines" aria-hidden="true" />
        <p
          className="font-heading leading-none font-extrabold uppercase font-stretch-condensed"
          aria-hidden="true"
        >
          <span className="block text-2xl tracking-wider text-ball">{month}</span>
          <span className="block text-[clamp(6rem,16vw,10rem)]">{day}</span>
        </p>
        {(venue || mapsUrl) && (
          <div className="space-y-2">
            {venue && <p className="text-lg font-semibold">{venue}</p>}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                <MapPinIcon className="size-4 text-ball" aria-hidden="true" />
                Open venue in Google Maps
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[2.25rem_1fr] gap-x-3">
      <span className="row-span-2 flex size-9 items-center justify-center rounded-full bg-court-soft text-court">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-court-deep">{children}</dd>
    </div>
  );
}
