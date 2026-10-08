import { ArrowRightIcon, CalendarDaysIcon, MapPinnedIcon, UsersRoundIcon } from "lucide-react";
import Link from "next/link";

import { ClubCard } from "@/components/clubs/club-card";
import { CityCard } from "@/components/courts/city-card";
import { CourtGrid } from "@/components/courts/court-card";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getCities } from "@/features/cities/queries";
import { getFeaturedClubs } from "@/features/clubs/queries";
import { getFeaturedCourts } from "@/features/courts/queries";
import { getUpcomingEvents } from "@/features/events/queries";

export async function FeaturedCourts() {
  const courts = await getFeaturedCourts(3);
  return (
    <section aria-labelledby="featured-courts" className="container-page py-20">
      <SectionHeading
        id="featured-courts"
        eyebrow="Featured courts"
        title="Popular places to play"
        description="Hand-picked venues with great courts, lighting and community."
        action={{ label: "Browse all courts", href: "/courts" }}
      />
      <div className="mt-10">
        {courts.length > 0 ? (
          <CourtGrid courts={courts} />
        ) : (
          <EmptyState
            icon={MapPinnedIcon}
            title="No featured courts yet"
            description="Featured venues will appear here once they are published."
            action={{ label: "List your court", href: "/list-your-court" }}
          />
        )}
      </div>
    </section>
  );
}

export async function ExploreByLocation() {
  const cities = await getCities();
  return (
    <section aria-labelledby="explore-location" className="bg-sand py-20">
      <div className="container-page">
        <SectionHeading
          id="explore-location"
          eyebrow="Explore by location"
          title="Courts across Northern Mindanao"
          description="Start with your city and find courts, clubs and games close to home."
        />
        {cities.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cities.map((city) => (
              <li key={city.id}>
                <CityCard city={city} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10">
            <EmptyState
              icon={MapPinnedIcon}
              title="No cities published yet"
              description="Cities will appear here as courts are added."
            />
          </div>
        )}
      </div>
    </section>
  );
}

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(4);
  return (
    <section aria-labelledby="upcoming-events" className="container-page py-20">
      <SectionHeading
        id="upcoming-events"
        eyebrow="Upcoming events"
        title="Get on the court this week"
        description="Open play, clinics, socials and tournaments near you."
        action={{ label: "See all events", href: "/events" }}
      />
      {events.length > 0 ? (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={CalendarDaysIcon}
            title="No upcoming events"
            description="Check back soon — new open plays and tournaments are added regularly."
          />
        </div>
      )}
    </section>
  );
}

export async function ClubHighlights() {
  const clubs = await getFeaturedClubs(3);
  return (
    <section aria-labelledby="club-highlights" className="bg-court-soft/60 py-20">
      <div className="container-page">
        <SectionHeading
          id="club-highlights"
          eyebrow="Community"
          title="Clubs that make the game better"
          description="Find your people — from beginner-friendly socials to competitive ladders."
          action={{ label: "Explore clubs", href: "/clubs" }}
        />
        {clubs.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <li key={club.id}>
                <ClubCard club={club} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10">
            <EmptyState
              icon={UsersRoundIcon}
              title="No clubs listed yet"
              description="Run a club? Get in touch and we'll feature it here."
              action={{ label: "Contact us", href: "/contact" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function ListYourCourtCta() {
  return (
    <section aria-labelledby="list-court-cta" className="container-page py-20">
      <div className="relative isolate overflow-hidden rounded-3xl bg-ball px-6 py-14 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div
          className="absolute -right-16 -bottom-24 -z-10 size-80 rounded-full bg-white/40 blur-2xl"
          aria-hidden="true"
        />
        <div className="max-w-2xl">
          <h2 id="list-court-cta" className="text-3xl font-extrabold text-court-deep sm:text-4xl">
            Own or manage a court?
          </h2>
          <p className="mt-3 text-lg text-court-deep/80">
            Get discovered by players across the region. Listing your venue is free.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-full bg-court-deep px-7 text-base hover:bg-court-deep/90 lg:mt-0"
        >
          <Link href="/list-your-court">
            List your court
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
