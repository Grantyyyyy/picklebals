import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EventRegistrationForm } from "@/components/forms/event-registration-form";
import { DetailLayout, InfoCard, InfoRow } from "@/components/shared/detail-layout";
import { JsonLd } from "@/components/shared/json-ld";
import { EventTimingBadge } from "@/components/shared/live-status";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { getEventBySlug, getUpcomingEvents } from "@/features/events/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { eventTypeLabels, formatEventDate, formatEventTime } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";
import type { PickleballEvent } from "@/types/content";

export async function generateStaticParams() {
  const events = await getUpcomingEvents();
  return ensureStaticParams(
    events.map((event) => ({ slug: event.slug })),
    { slug: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return buildMetadata({
      title: "Event not found",
      description: "",
      path: "/events",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${event.title}${event.city ? ` — ${event.city.name}` : ""}`,
    description:
      event.summary ??
      `${eventTypeLabels[event.eventType]} on ${formatEventDate(event.startsAt)}${event.city ? ` in ${event.city.name}` : ""}.`,
    path: `/events/${event.slug}`,
    image: event.imageUrl,
  });
}

function eventJsonLd(event: PickleballEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.title,
    description: event.description ?? event.summary ?? undefined,
    startDate: event.startsAt,
    endDate: event.endsAt ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Pickleball",
    url: absoluteUrl(`/events/${event.slug}`),
    image: event.imageUrl ?? undefined,
    location: {
      "@type": "Place",
      name: event.venueName ?? event.court?.name ?? event.city?.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city?.name,
        addressRegion: event.city?.province,
        addressCountry: "PH",
      },
    },
    ...(event.club && {
      organizer: {
        "@type": "SportsOrganization",
        name: event.club.name,
        url: absoluteUrl(`/clubs/${event.club.slug}`),
      },
    }),
  };
}

async function EventDetail({ params }: Pick<PageProps<"/events/[slug]">, "params">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      {!event.isSample && <JsonLd data={eventJsonLd(event)} />}
      <DetailLayout
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: event.title, path: `/events/${event.slug}` },
        ]}
        eyebrow={<span>{eventTypeLabels[event.eventType]}</span>}
        title={event.title}
        summary={event.summary}
        imageUrl={event.imageUrl}
        imageAlt={event.title}
        imageLabel={formatEventDate(event.startsAt)}
        isSample={event.isSample}
        aside={
          <>
            <InfoCard title="Event details">
              <InfoRow icon={CalendarDaysIcon} label="Date">
                <time dateTime={event.startsAt}>{formatEventDate(event.startsAt)}</time>
                <span className="mt-1.5 flex empty:hidden">
                  <EventTimingBadge startsAt={event.startsAt} endsAt={event.endsAt} />
                </span>
              </InfoRow>
              <InfoRow icon={ClockIcon} label="Time (Philippine time)">
                {formatEventTime(event.startsAt, event.endsAt)}
              </InfoRow>
              {(event.venueName || event.court || event.city) && (
                <InfoRow icon={MapPinIcon} label="Venue">
                  {event.court ? (
                    <Link
                      href={`/courts/${event.court.citySlug}/${event.court.slug}`}
                      className="font-medium text-court hover:underline"
                    >
                      {event.venueName ?? event.court.name}
                    </Link>
                  ) : (
                    event.venueName
                  )}
                  {event.city && (
                    <span className="block text-muted-foreground">{event.city.name}</span>
                  )}
                </InfoRow>
              )}
              {event.club && (
                <InfoRow icon={UsersRoundIcon} label="Organized by">
                  <Link
                    href={`/clubs/${event.club.slug}`}
                    className="font-medium text-court hover:underline"
                  >
                    {event.club.name}
                  </Link>
                </InfoRow>
              )}
              {event.feeInfo && (
                <InfoRow icon={BadgeDollarSignIcon} label="Fee">
                  {event.feeInfo}
                </InfoRow>
              )}
            </InfoCard>
            {/* Below lg the inline form already sits above this aside, so a jump link would point backwards. */}
            <Button
              asChild
              size="lg"
              className={cn(
                "h-12 w-full rounded-full text-base",
                !event.registrationUrl && "hidden lg:inline-flex",
              )}
            >
              {event.registrationUrl ? (
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                  Register
                </a>
              ) : (
                <a href="#register">Register</a>
              )}
            </Button>
          </>
        }
      >
        <section aria-labelledby="about-event" className="space-y-3">
          <h2 id="about-event" className="text-2xl font-bold text-court-deep">
            About this event
          </h2>
          <p className="leading-relaxed text-foreground/90">
            {event.description ?? "More details about this event are coming soon."}
          </p>
        </section>
        {!event.registrationUrl && (
          <section
            id="register"
            aria-labelledby="register-heading"
            className="scroll-mt-24 space-y-4 rounded-2xl border bg-card p-6 sm:p-8"
          >
            <div className="space-y-1">
              <h2 id="register-heading" className="text-2xl font-bold text-court-deep">
                Register to play
              </h2>
              <p className="text-sm text-muted-foreground">
                Save your spot and the organizer will confirm by email.
              </p>
            </div>
            <EventRegistrationForm eventSlug={event.slug} eventTitle={event.title} />
          </section>
        )}
      </DetailLayout>
    </>
  );
}

export default function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <EventDetail params={params} />
    </Suspense>
  );
}
