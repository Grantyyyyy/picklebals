import { CalendarDaysIcon } from "lucide-react";
import { Suspense } from "react";

import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { EventListSkeleton } from "@/components/shared/skeletons";
import { getUpcomingEvents } from "@/features/events/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pickleball events & tournaments",
  description:
    "Upcoming pickleball tournaments, open play sessions, clinics and socials in Cagayan de Oro and Northern Mindanao.",
  path: "/events",
});

async function EventList() {
  const events = await getUpcomingEvents();
  return (
    <>
      {events.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CalendarDaysIcon}
          title="No games posted yet"
          description="Running a tournament, open play or clinic? Tell us and we'll put it on the calendar."
          action={{ label: "Post an event", href: "/contact" }}
        />
      )}
    </>
  );
}

export default function EventsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Upcoming pickleball events"
        description="Tournaments, open play, clinics and socials — all in one place."
      />
      <section aria-label="Upcoming events" className="container-page py-12">
        <Suspense fallback={<EventListSkeleton />}>
          <EventList />
        </Suspense>
      </section>
    </>
  );
}
