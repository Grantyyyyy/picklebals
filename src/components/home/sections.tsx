import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  LayersIcon,
  MapIcon,
  MapPinIcon,
  MapPinnedIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { CourtSearchForm } from "@/components/courts/court-search-form";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LogoMark } from "@/components/shared/logo";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { siteConfig } from "@/config/site";
import { getCities } from "@/features/cities/queries";
import { getClubs, getFeaturedClubs } from "@/features/clubs/queries";
import { getCourts, getFeaturedCourts } from "@/features/courts/queries";
import { getUpcomingEvents } from "@/features/events/queries";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/utils/format";
import type { City, Club } from "@/types/content";

import { CityCarousel } from "./city-carousel";
import { FeaturedCourtCard } from "./featured-court-card";
import { FeaturedEventCard } from "./featured-event";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: MapIcon,
    title: "Local first",
    description: `Built for players in ${siteConfig.initialRegion}, one city at a time.`,
  },
  {
    icon: LayersIcon,
    title: "Everything in one place",
    description: "Courts, clubs, open play, tournaments and beginner guides together.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Free for venues",
    description: "Court owners and managers can list their venue at no cost.",
  },
];

export async function HomeStats() {
  const [courts, clubs, cities, events] = await Promise.all([
    getCourts(),
    getClubs(),
    getCities(),
    getUpcomingEvents(),
  ]);
  const isSample = [courts, clubs, cities].some((items) => items[0]?.isSample);
  const stats: { icon: LucideIcon; value: number; label: string }[] = [
    { icon: MapPinnedIcon, value: courts.length, label: "Courts listed" },
    { icon: UsersRoundIcon, value: clubs.length, label: "Local clubs" },
    { icon: MapIcon, value: cities.length, label: "Cities covered" },
    { icon: CalendarDaysIcon, value: events.length, label: "Upcoming events" },
  ];

  return (
    <section aria-labelledby="why-hub" className="container-page pb-20">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold tracking-wider text-court uppercase">
            Why {siteConfig.name}
          </p>
          <h2 id="why-hub" className="mt-2 text-3xl font-bold text-court-deep sm:text-4xl">
            Less searching, more playing
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Pickleball is growing fast across the Philippines, but finding a court or a game often
            means digging through group chats. We bring it together so you can get on the court.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <dt className="order-last text-sm text-muted-foreground">{label}</dt>
                <dd className="flex flex-col items-center sm:items-start">
                  <span className="flex size-11 items-center justify-center rounded-full bg-court-deep text-ball">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-3 font-heading text-3xl font-extrabold text-court-deep">
                    {value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          {isSample && (
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <SampleBadge /> Counts reflect sample content.
            </p>
          )}
        </div>
        <ul className="grid gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4 rounded-2xl bg-mist p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-court-deep text-ball">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-court-deep">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CenteredHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <LogoMark className="mx-auto size-9" />
      <p className="mt-4 text-sm font-semibold tracking-wider text-court uppercase">{eyebrow}</p>
      <h2
        id={id}
        className="mt-2 font-heading text-4xl font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-5xl"
      >
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
}

function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-court hover:text-court-deep",
        className,
      )}
    >
      {children}
      <ArrowRightIcon
        className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export async function FeaturedCourts() {
  const courts = await getFeaturedCourts(3);
  return (
    <section aria-labelledby="featured-courts" className="border-t bg-background py-20">
      <div className="container-page">
        <CenteredHeading
          id="featured-courts"
          eyebrow="Featured courts"
          title="Popular places to play"
          description="Hand-picked venues with great courts, lighting and community."
        />
        {courts.length > 0 ? (
          <>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courts.map((court, index) => (
                <li key={court.id} className="grid">
                  <FeaturedCourtCard court={court} eager={index < 3} />
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <TextLink href="/courts">Browse all courts</TextLink>
            </div>
          </>
        ) : (
          <div className="mt-12">
            <EmptyState
              icon={MapPinnedIcon}
              title="No featured courts yet"
              description="Featured venues will appear here once they are published."
              action={{ label: "List your court", href: "/list-your-court" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export async function ClubSpotlight() {
  const clubs = await getFeaturedClubs(3);
  return (
    <section
      aria-labelledby="club-highlights"
      className="relative isolate overflow-hidden bg-court-gradient py-[calc(var(--angle)+4rem)] text-white clip-angle-both"
    >
      <div className="absolute inset-0 -z-10 bg-court-lines opacity-70" aria-hidden="true" />
      <p
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-center font-heading text-[clamp(6rem,22vw,20rem)] leading-none font-extrabold whitespace-nowrap text-white/[0.06] uppercase font-stretch-condensed select-none"
        aria-hidden="true"
      >
        Play local
      </p>
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-wider text-ball uppercase">Community</p>
          <h2
            id="club-highlights"
            className="mt-2 font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-6xl"
          >
            Clubs that make the game better
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Find your people — from beginner-friendly socials to competitive ladders.
          </p>
          <Link
            href="/clubs"
            className="group mt-8 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-sm font-semibold tracking-wider uppercase transition-colors hover:border-ball"
          >
            Explore all clubs
            <ArrowRightIcon
              className="size-4 text-ball transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
        {clubs.length > 0 ? (
          <ul className="grid min-w-0 grid-cols-1 gap-3">
            {clubs.map((club) => (
              <li key={club.id}>
                <ClubBandItem club={club} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h3 className="font-semibold">No clubs listed yet</h3>
            <p className="mt-1 text-sm text-white/75">
              Run a club?{" "}
              <Link href="/contact" className="font-semibold text-white underline">
                Get in touch
              </Link>{" "}
              and we&apos;ll feature it here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ClubBandItem({ club }: { club: Club }) {
  return (
    <article className="group relative flex items-center gap-4 rounded-2xl border border-white/15 bg-ink/30 p-4 backdrop-blur-sm transition-colors hover:bg-ink/45 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ball/60">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ball text-court-deep">
        <UsersRoundIcon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">
            <Link
              href={`/clubs/${club.slug}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl"
            >
              {club.name}
            </Link>
          </h3>
          {club.isSample && <SampleBadge />}
        </div>
        <p className="mt-0.5 truncate text-sm text-white/75">
          {[club.city?.name, club.skillLevels.join(", ")].filter(Boolean).join(" · ")}
        </p>
      </div>
      <ArrowUpRightIcon
        className="size-5 shrink-0 text-ball transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </article>
  );
}

export async function ExploreByLocation() {
  const cities = await getCities();
  return (
    <section aria-labelledby="explore-location" className="container-page py-20">
      <div className="rounded-[2rem] bg-mist px-5 py-8 sm:p-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="text-sm font-semibold tracking-wider text-court uppercase">
              Explore by location
            </p>
            <h2
              id="explore-location"
              className="mt-2 text-3xl font-bold text-court-deep sm:text-4xl"
            >
              Courts across {siteConfig.initialRegion}
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Start with your city and find courts, clubs and games close to home.
          </p>
        </div>
        {cities.length > 0 ? (
          <CityCarousel
            label="Cities"
            footer={
              <Link
                href="/courts"
                className="inline-flex h-10 items-center rounded-full bg-court-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-court-deep/90"
              >
                View all courts
              </Link>
            }
          >
            {cities.map((city) => (
              <CarouselItem
                key={city.id}
                className="basis-[78%] min-[480px]:basis-[55%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <CitySlide city={city} />
              </CarouselItem>
            ))}
          </CityCarousel>
        ) : (
          <div className="mt-8">
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

function CitySlide({ city }: { city: City }) {
  return (
    <article className="group relative isolate overflow-hidden rounded-2xl has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring">
      <MediaImage
        src={null}
        alt=""
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
        className="aspect-[4/5] transition-transform duration-500 motion-safe:group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        {city.isSample ? <SampleBadge /> : <span />}
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-court-deep">
          {pluralize(city.courtCount, "court")}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-2xl font-bold">
          <Link
            href={`/courts/${city.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {city.name}
          </Link>
        </h3>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-white/80">
          <MapPinIcon className="size-3.5 text-ball" aria-hidden="true" />
          {city.province}
        </p>
      </div>
    </article>
  );
}

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(4);
  const featured = events.find((event) => event.isFeatured) ?? events[0];
  const others = events.filter((event) => event !== featured).slice(0, 3);

  return (
    <section aria-labelledby="upcoming-events" className="container-page pb-24">
      <CenteredHeading
        id="upcoming-events"
        eyebrow="Upcoming events"
        title="Get on the court this week"
        description="Open play, clinics, socials and tournaments near you."
      />
      {featured ? (
        <>
          <div className="mt-12">
            <FeaturedEventCard event={featured} />
          </div>
          {others.length > 0 && (
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {others.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 text-center">
            <TextLink href="/events">See all events</TextLink>
          </div>
        </>
      ) : (
        <div className="mt-12">
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

export async function FindCourtCta() {
  const cities = await getCities();
  return (
    <section
      aria-labelledby="find-court"
      className="relative isolate overflow-hidden bg-ink pt-[calc(var(--angle)+3.5rem)] pb-16 text-white clip-angle-top sm:pb-20"
    >
      <div
        className="absolute inset-0 -z-10 bg-court-gradient [clip-path:polygon(0_0,100%_0,100%_45%,0_100%)] lg:[clip-path:polygon(0_0,60%_0,46%_100%,0_100%)]"
        aria-hidden="true"
      />
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-16">
        <div>
          <h2
            id="find-court"
            className="font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-5xl"
          >
            Find a court near you
          </h2>
          <p className="mt-3 max-w-sm text-white/80">
            Pick your city or search by venue name to see where you can play.
          </p>
        </div>
        <div>
          <CourtSearchForm cities={cities} idPrefix="cta-search" label="Find a court" />
          <p className="mt-4 text-sm text-white/75">
            Own or manage a court?{" "}
            <Link
              href="/list-your-court"
              className="font-semibold text-white underline decoration-ball underline-offset-4 hover:decoration-2"
            >
              List it for free
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
