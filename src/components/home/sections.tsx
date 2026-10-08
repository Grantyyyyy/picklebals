import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  MapPinnedIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { CourtMarkings } from "@/components/shared/court-markings";
import { CourtSearchForm } from "@/components/courts/court-search-form";
import { EventCard } from "@/components/events/event-card";
import { CountUp } from "@/components/reactbits/count-up";
import { EmptyState } from "@/components/shared/empty-state";
import { LogoMark } from "@/components/shared/logo";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getCities } from "@/features/cities/queries";
import { getClubs, getFeaturedClubs } from "@/features/clubs/queries";
import { getCourts, getFeaturedCourts } from "@/features/courts/queries";
import { getUpcomingEvents } from "@/features/events/queries";
import { getVenueDirectory } from "@/features/venues/queries";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/utils/format";
import { isLogoImage } from "@/lib/utils/images";
import type { Club } from "@/types/content";

import { FeaturedCourtCard } from "./featured-court-card";
import { FeaturedEventCard } from "./featured-event";

const reasons: { title: string; description: string }[] = [
  {
    title: "Local first",
    description: `Built for players in ${siteConfig.initialRegion}, one city at a time.`,
  },
  {
    title: "Everything in one place",
    description: "Courts, clubs, open play, tournaments and beginner guides together.",
  },
  {
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
  const score = [
    { value: courts.length, label: "Courts listed" },
    { value: clubs.length, label: "Local clubs" },
    { value: events.length, label: "Upcoming events" },
    { value: cities.length, label: "Cities covered" },
  ];

  return (
    <section aria-labelledby="why-hub" className="container-page pb-20 sm:pb-24">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
        <h2
          id="why-hub"
          className="reveal-title font-heading text-[clamp(3rem,10vw,7rem)] leading-[0.88] font-extrabold tracking-[-0.02em] text-court-deep uppercase font-stretch-condensed"
        >
          <span className="block">Less searching,</span>
          <span className="block text-court">
            more playing
            <span
              className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-ball align-baseline ring-[0.035em] ring-court-deep/15"
              aria-hidden="true"
            />
          </span>
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground lg:pb-3 lg:text-lg">
          Pickleball is growing fast across the Philippines, but finding a court or a game often
          means digging through group chats. {siteConfig.name} brings it together so you can get on
          the court.
        </p>
      </div>

      <div className="relative isolate mt-10 overflow-hidden rounded-[1.75rem] bg-ink text-white sm:mt-14">
        <div className="absolute inset-0 -z-10 bg-court-grain opacity-60" aria-hidden="true" />
        <CourtMarkings crop="service" className="-z-10 opacity-60" />
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,3fr)]">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-6 sm:p-8 lg:border-r lg:border-b-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-ball uppercase">
              <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
              On the hub today
            </p>
            {isSample ? (
              <p className="flex flex-wrap items-center gap-2 text-xs text-white/65">
                <SampleBadge /> Counts reflect sample content.
              </p>
            ) : (
              <p className="text-xs text-white/65">Counted from live listings.</p>
            )}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            {score.map(({ value, label }, index) => (
              <div
                key={label}
                className={cn(
                  "flex flex-col gap-1 p-6 sm:p-8",
                  index % 2 === 1 && "border-l border-white/10",
                  index >= 2 && "border-t border-white/10 sm:border-t-0",
                  index === 2 && "sm:border-l",
                )}
              >
                <dt className="order-last text-sm text-white/70">{label}</dt>
                <dd className="font-heading text-[clamp(3rem,7vw,4.75rem)] leading-none font-extrabold font-stretch-condensed tabular-nums">
                  <CountUp to={value} pad={2} delay={index * 0.12} duration={1.6} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ol className="relative mt-12 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
        <span
          className="absolute top-[5px] right-0 left-0 hidden h-px bg-court/25 sm:block"
          aria-hidden="true"
        />
        {reasons.map(({ title, description }) => (
          <li key={title} className="relative border-t border-court/25 pt-7 sm:border-t-0">
            <span
              className="absolute -top-[5px] left-0 size-3 rounded-full bg-ball ring-4 ring-background sm:top-0"
              aria-hidden="true"
            />
            <h3 className="font-heading text-2xl leading-tight font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-3xl">
              {title}
            </h3>
            <p className="mt-2 max-w-xs text-pretty text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
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
        className="mt-2 reveal-title font-heading text-4xl font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-5xl"
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
                  <FeaturedCourtCard court={court} eager={index < 3} index={index} />
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
      <div className="absolute inset-0 -z-10 bg-court-grain opacity-70" aria-hidden="true" />
      <CourtMarkings crop="full" className="-z-10" />
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
            className="mt-2 reveal-title font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-6xl"
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
    <article className="group relative flex items-center gap-4 rounded-2xl border border-white/15 bg-ink/30 p-4 transition-colors hover:bg-ink/45 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ball/60">
      {club.imageUrl ? (
        <MediaImage
          src={club.imageUrl}
          alt=""
          sizes="48px"
          fit={isLogoImage(club.imageUrl) ? "contain" : "cover"}
          className="size-12 shrink-0 rounded-xl bg-ink ring-1 ring-white/15"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ball text-court-deep">
          <UsersRoundIcon className="size-6" aria-hidden="true" />
        </span>
      )}
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

const MAX_BARANGAYS = 12;

export async function ExploreByLocation() {
  const { venues } = await getVenueDirectory();
  const { city, province } = siteConfig.market;

  const counts = new Map<string, number>();
  for (const venue of venues) {
    if (venue.barangay) counts.set(venue.barangay, (counts.get(venue.barangay) ?? 0) + 1);
  }
  const barangays = [...counts.entries()].sort(
    ([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB),
  );
  const shown = barangays.slice(0, MAX_BARANGAYS);
  const hidden = barangays.length - shown.length;

  return (
    <section aria-labelledby="explore-location" className="container-page py-20">
      <div className="rounded-[2rem] bg-mist p-3 sm:p-4">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <article className="group relative isolate flex min-h-80 flex-col justify-between gap-10 overflow-hidden rounded-[1.5rem] bg-court-deep p-6 text-white sm:p-8">
            <div className="absolute inset-0 -z-10 bg-court-grain opacity-60" aria-hidden="true" />
            <CourtMarkings crop="kitchen" className="-z-10" />
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-ball uppercase">
              <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
              Now covering
            </p>
            <div>
              <h2
                id="explore-location"
                className="reveal-title font-heading text-[clamp(3.5rem,12vw,6.5rem)] leading-[0.85] font-extrabold uppercase font-stretch-condensed"
              >
                {city}
                <span className="block text-ball">City</span>
              </h2>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/75">
                <MapPinIcon className="size-3.5 text-ball" aria-hidden="true" />
                {province}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                <p className="text-sm text-white/75">
                  <span className="font-heading text-3xl font-extrabold text-white font-stretch-condensed tabular-nums">
                    {venues.length}
                  </span>{" "}
                  {venues.length === 1 ? "place" : "places"} to play
                </p>
                <Link
                  href="/venues"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ball px-5 text-sm font-semibold text-court-deep transition-colors outline-none hover:bg-ball/85 focus-visible:ring-3 focus-visible:ring-white/70"
                >
                  Browse venues
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>

          <div className="flex flex-col rounded-[1.5rem] bg-card p-6 sm:p-8">
            <h3 className="font-heading text-2xl font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-3xl">
              Play by barangay
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Pick your barangay to see the courts closest to home.
            </p>
            {shown.length > 0 ? (
              <>
                <ul className="mt-6 grid gap-x-6 sm:grid-cols-2">
                  {shown.map(([name, count]) => (
                    <li key={name} className="border-b border-dashed border-court/20">
                      <Link
                        href={`/venues?barangay=${encodeURIComponent(name)}`}
                        className="group/row flex items-center justify-between gap-3 py-3.5 outline-none focus-visible:text-court"
                      >
                        <span className="flex min-w-0 items-center gap-2.5 font-semibold text-court-deep">
                          <span
                            className="size-2 shrink-0 rounded-full bg-court/25 transition-colors group-hover/row:bg-ball group-focus-visible/row:bg-ball"
                            aria-hidden="true"
                          />
                          <span className="truncate">{name}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                          {pluralize(count, "venue")}
                          <ArrowUpRightIcon
                            className="size-4 text-court transition-transform motion-safe:group-hover/row:translate-x-0.5 motion-safe:group-hover/row:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {hidden > 0 && (
                  <TextLink href="/venues" className="mt-6">
                    {pluralize(hidden, "more barangay", "more barangays")}
                  </TextLink>
                )}
              </>
            ) : (
              <div className="mt-6 flex flex-1 flex-col items-start justify-center gap-4 rounded-2xl border border-dashed border-court/25 bg-sand p-6">
                <p className="text-sm text-muted-foreground">
                  Barangays appear here as venues in {city} are added and checked.
                </p>
                <TextLink href="/list-your-court">Know a court? List it for free</TextLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
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
            title="No games posted yet"
            description="Running an open play or tournament? Tell us and we'll put it on the calendar."
            action={{ label: "Post an event", href: "/contact" }}
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
          <h2
            id="list-court-cta"
            className="reveal-title text-3xl font-extrabold text-court-deep sm:text-4xl"
          >
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
            className="reveal-title font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-5xl"
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
