import {
  ExternalLinkIcon,
  GlobeIcon,
  LayoutGridIcon,
  MailIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ExternalLink, InfoCard, InfoRow } from "@/components/shared/detail-layout";
import { JsonLd } from "@/components/shared/json-ld";
import { MediaImage } from "@/components/shared/media-image";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { venuePath } from "@/components/venues/venue-card";
import { VerificationBadge } from "@/components/venues/verification-badge";
import { getVenueBySlug, getVenueDirectory } from "@/features/venues/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { environmentLabels, formatPublishedDate } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";
import type { Venue } from "@/types/content";

export async function generateStaticParams() {
  const { venues } = await getVenueDirectory();
  return ensureStaticParams(
    venues.map((venue) => ({ slug: venue.slug })),
    { slug: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return buildMetadata({
      title: "Venue not found",
      description: "",
      path: "/venues",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${venue.name} — Pickleball venue in ${venue.city.name}`,
    description: `${venue.name}${venue.address ? `, ${venue.address}` : ""}. Pickleball venue in ${venue.city.name}, ${venue.city.province}.`,
    path: venuePath(venue),
    image: venue.imageUrl,
    // Unverified listings stay out of search results until an operator confirms them.
    noIndex: venue.verificationStatus !== "verified",
  });
}

/** Directions use coordinates only when they exist; otherwise a plain map search on the address. */
function directionsUrl(venue: Venue): string {
  const query =
    venue.latitude !== null && venue.longitude !== null
      ? `${venue.latitude},${venue.longitude}`
      : [venue.name, venue.address, `${venue.city.name} City`, venue.city.province]
          .filter(Boolean)
          .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function venueJsonLd(venue: Venue) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: venue.name,
    sport: "Pickleball",
    url: absoluteUrl(venuePath(venue)),
    telephone: venue.contactPhone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address ?? undefined,
      addressLocality: venue.city.name,
      addressRegion: venue.city.province,
      addressCountry: "PH",
    },
    ...(venue.latitude !== null &&
      venue.longitude !== null && {
        geo: { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude },
      }),
  };
}

function Unconfirmed({ children = "Not yet confirmed" }: { children?: ReactNode }) {
  return <span className="text-muted-foreground italic">{children}</span>;
}

async function VenueDetail({ params }: Pick<PageProps<"/venues/[slug]">, "params">) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const verified = venue.verificationStatus === "verified";
  const hasContact =
    venue.contactPhone || venue.contactEmail || venue.websiteUrl || venue.facebookUrl;

  return (
    <article className="container-page py-10 sm:py-14">
      {verified && <JsonLd data={venueJsonLd(venue)} />}
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Venues", path: "/venues" },
          { name: venue.name, path: venuePath(venue) },
        ]}
      />

      <header className="mt-6 max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-court">
          <span>Pickleball venue · {venue.city.name}</span>
          <VerificationBadge status={venue.verificationStatus} />
        </div>
        <h1 className="text-4xl font-bold text-court-deep sm:text-5xl">{venue.name}</h1>
        <p className="text-lg text-muted-foreground">
          {venue.address ?? `${venue.city.name} City, ${venue.city.province}`}
        </p>
      </header>

      {venue.imageUrl && (
        <MediaImage
          src={venue.imageUrl}
          alt={`${venue.name} in ${venue.city.name}`}
          sizes="(min-width: 1280px) 1216px, 100vw"
          preload
          className="mt-8 aspect-[16/9] rounded-3xl sm:aspect-[21/9]"
        />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="about-venue" className="space-y-3">
            <h2 id="about-venue" className="text-2xl font-bold text-court-deep">
              About this venue
            </h2>
            {venue.description ? (
              <p className="leading-relaxed text-foreground/90">{venue.description}</p>
            ) : (
              <p className="text-muted-foreground">
                We don&apos;t have a description for this venue yet.
              </p>
            )}
          </section>

          <section aria-labelledby="venue-courts" className="space-y-3">
            <h2 id="venue-courts" className="text-2xl font-bold text-court-deep">
              Courts
            </h2>
            {venue.courts.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {venue.courts.map((court) => (
                  <li key={court.id} className="rounded-xl border bg-card p-4">
                    <p className="font-semibold text-court-deep">{court.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {[court.environment && environmentLabels[court.environment], court.surface]
                        .filter(Boolean)
                        .join(" · ") || "Details not yet listed"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                The number and type of courts here haven&apos;t been confirmed yet.
              </p>
            )}
          </section>

          <section aria-labelledby="venue-sources" className="space-y-3">
            <h2 id="venue-sources" className="text-2xl font-bold text-court-deep">
              Sources
            </h2>
            {venue.sources.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {venue.sources.map((source, index) => (
                  <li
                    key={`${source.label}-${index}`}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-court underline-offset-4 hover:underline"
                      >
                        {source.label}
                        <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="font-medium">{source.label}</span>
                    )}
                    {source.accessedAt && (
                      <span className="text-xs text-muted-foreground">
                        accessed {formatPublishedDate(source.accessedAt) ?? source.accessedAt}
                      </span>
                    )}
                    {source.note && (
                      <span className="w-full text-muted-foreground">{source.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No sources have been recorded for this listing.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <InfoCard title="Venue details">
            <InfoRow icon={MapPinIcon} label="Address">
              {venue.address ?? <Unconfirmed />}
              {venue.barangay && (
                <span className="block text-muted-foreground">Barangay {venue.barangay}</span>
              )}
              <span className="block text-muted-foreground">
                {venue.city.name} City, {venue.city.province}
              </span>
            </InfoRow>
            <InfoRow icon={LayoutGridIcon} label="Courts">
              {venue.courts.length > 0 ? venue.courts.length : <Unconfirmed />}
            </InfoRow>
            {venue.contactPhone && (
              <InfoRow icon={PhoneIcon} label="Phone">
                <a
                  href={`tel:${venue.contactPhone}`}
                  className="font-medium text-court hover:underline"
                >
                  {venue.contactPhone}
                </a>
              </InfoRow>
            )}
            {venue.contactEmail && (
              <InfoRow icon={MailIcon} label="Email">
                <a
                  href={`mailto:${venue.contactEmail}`}
                  className="font-medium text-court hover:underline"
                >
                  {venue.contactEmail}
                </a>
              </InfoRow>
            )}
            {(venue.websiteUrl || venue.facebookUrl) && (
              <InfoRow icon={GlobeIcon} label="Online">
                <span className="flex flex-col gap-1">
                  {venue.websiteUrl && <ExternalLink href={venue.websiteUrl}>Website</ExternalLink>}
                  {venue.facebookUrl && (
                    <ExternalLink href={venue.facebookUrl}>Facebook</ExternalLink>
                  )}
                </span>
              </InfoRow>
            )}
            {!hasContact && (
              <InfoRow icon={PhoneIcon} label="Contact">
                <Unconfirmed>Not yet listed</Unconfirmed>
              </InfoRow>
            )}
          </InfoCard>
          <Button asChild size="lg" className="h-12 w-full rounded-full text-base">
            <a href={directionsUrl(venue)} target="_blank" rel="noopener noreferrer">
              <NavigationIcon aria-hidden="true" />
              Find on Google Maps
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Something wrong or missing?{" "}
            <Link
              href="/contact"
              className="font-medium text-court underline-offset-2 hover:underline"
            >
              Suggest a correction
            </Link>
          </p>
        </aside>
      </div>
    </article>
  );
}

export default function VenueDetailPage({ params }: PageProps<"/venues/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <VenueDetail params={params} />
    </Suspense>
  );
}
