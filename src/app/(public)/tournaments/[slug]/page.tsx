import { CalendarDaysIcon, MapPinIcon, UsersRoundIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { LiveTournament } from "@/components/tournaments/live-tournament";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPublishedTournaments,
  getTournamentBySlug,
  getTournamentSnapshot,
} from "@/features/tournaments/queries";
import type { TournamentSummary } from "@/features/tournaments/types";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { formatEventDate, formatEventTime } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";

export async function generateStaticParams() {
  const tournaments = await getPublishedTournaments();
  return ensureStaticParams(
    tournaments.map((tournament) => ({ slug: tournament.slug })),
    { slug: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/tournaments/[slug]">) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    return buildMetadata({
      title: "Tournament not found",
      description: "",
      path: "/events",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${tournament.name}: Live bracket and scores`,
    description:
      tournament.summary ??
      `Live courts, brackets and results for ${tournament.name} in ${tournament.city.name}.`,
    path: tournamentPath(tournament),
    noIndex: tournament.isSample,
  });
}

function tournamentPath(tournament: Pick<TournamentSummary, "slug">): string {
  return `/tournaments/${tournament.slug}`;
}

function tournamentJsonLd(tournament: TournamentSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.name,
    description: tournament.description ?? tournament.summary ?? undefined,
    startDate: tournament.startsAt,
    endDate: tournament.endsAt ?? undefined,
    eventStatus:
      tournament.phase === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Pickleball",
    url: absoluteUrl(tournamentPath(tournament)),
    location: {
      "@type": "Place",
      name: tournament.venue?.name ?? tournament.city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: tournament.city.name,
        addressRegion: tournament.city.province,
        addressCountry: "PH",
      },
    },
    ...(tournament.organizer && {
      organizer: { "@type": "SportsOrganization", name: tournament.organizer },
    }),
  };
}

async function TournamentDetail({ params }: Pick<PageProps<"/tournaments/[slug]">, "params">) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();

  return (
    <article className="container-page py-10 sm:py-14">
      {!tournament.isSample && <JsonLd data={tournamentJsonLd(tournament)} />}
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: tournament.name, path: tournamentPath(tournament) },
        ]}
      />

      <header className="mt-6 max-w-4xl">
        <h1 className="font-heading text-5xl leading-[0.9] font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-7xl">
          {tournament.name}
        </h1>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarDaysIcon className="size-4 text-court" aria-label="Date" />
            </dt>
            <dd>
              <time dateTime={tournament.startsAt}>{formatEventDate(tournament.startsAt)}</time>,{" "}
              {formatEventTime(tournament.startsAt, tournament.endsAt)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <MapPinIcon className="size-4 text-court" aria-label="Venue" />
            </dt>
            <dd>
              {tournament.venue ? (
                <Link
                  href={`/venues/${tournament.venue.slug}`}
                  className="font-medium text-court hover:underline"
                >
                  {tournament.venue.name}
                </Link>
              ) : (
                "Venue to be announced"
              )}
              , {tournament.city.name}
            </dd>
          </div>
          {tournament.organizer && (
            <div className="flex items-center gap-2">
              <dt>
                <UsersRoundIcon className="size-4 text-court" aria-label="Organizer" />
              </dt>
              <dd>{tournament.organizer}</dd>
            </div>
          )}
        </dl>
        {tournament.summary && (
          <p className="mt-4 max-w-2xl text-lg text-foreground/85">{tournament.summary}</p>
        )}
      </header>

      <div className="mt-8">
        <Suspense fallback={<LiveSkeleton />}>
          <LiveSection tournament={tournament} />
        </Suspense>
      </div>
    </article>
  );
}

/** Streams in at request time: the bracket is never served from a cache. */
async function LiveSection({ tournament }: { tournament: TournamentSummary }) {
  const snapshot = await getTournamentSnapshot(tournament);
  return (
    <LiveTournament
      tournamentId={tournament.id}
      phase={tournament.phase}
      startsAt={tournament.startsAt}
      initialSnapshot={snapshot}
      realtime={!tournament.isSample}
    />
  );
}

function LiveSkeleton() {
  return (
    <div className="space-y-10" role="status" aria-label="Loading live scores">
      <Skeleton className="h-7 w-56 rounded-full" />
      <Skeleton className="h-80 w-full rounded-[2rem]" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function TournamentPage({ params }: PageProps<"/tournaments/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TournamentDetail params={params} />
    </Suspense>
  );
}
