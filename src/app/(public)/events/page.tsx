import { CalendarDaysIcon } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getUpcomingEvents } from "@/features/events/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pickleball events & tournaments",
  description:
    "Upcoming pickleball tournaments, open play sessions, clinics and socials in Cagayan de Oro and Northern Mindanao.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Upcoming pickleball events"
        description="Tournaments, open play, clinics and socials — all in one place."
      />
      <section aria-label="Upcoming events" className="container-page py-12">
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
            title="No upcoming events"
            description="Organizing a tournament or open play? Let us know and we'll list it."
            action={{ label: "Contact us", href: "/contact" }}
          />
        )}
      </section>
    </>
  );
}
