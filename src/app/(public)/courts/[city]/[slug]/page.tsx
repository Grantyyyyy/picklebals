import {
  BadgeDollarSignIcon,
  ClockIcon,
  GlobeIcon,
  LayoutGridIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";

import { courtPath } from "@/components/courts/court-card";
import { DetailLayout, ExternalLink, InfoCard, InfoRow } from "@/components/shared/detail-layout";
import { JsonLd } from "@/components/shared/json-ld";
import { OpenNowStatus } from "@/components/shared/live-status";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { getCourtBySlug, getCourtStaticParams } from "@/features/courts/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { environmentLabels, pluralize } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";
import type { Court } from "@/types/content";

export async function generateStaticParams() {
  return ensureStaticParams(await getCourtStaticParams(), {
    city: PLACEHOLDER_SLUG,
    slug: PLACEHOLDER_SLUG,
  });
}

export async function generateMetadata({ params }: PageProps<"/courts/[city]/[slug]">) {
  const { slug } = await params;
  const court = await getCourtBySlug(slug);
  if (!court) {
    return buildMetadata({
      title: "Court not found",
      description: "",
      path: "/courts",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${court.name}: Pickleball court in ${court.city.name}`,
    description:
      court.summary ??
      `${court.name} is a pickleball venue in ${court.city.name}, ${court.city.province}.`,
    path: courtPath(court),
    image: court.imageUrl,
  });
}

function courtJsonLd(court: Court) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: court.name,
    description: court.description ?? court.summary ?? undefined,
    url: absoluteUrl(courtPath(court)),
    image: court.imageUrl ?? undefined,
    telephone: court.contactPhone ?? undefined,
    sport: "Pickleball",
    address: {
      "@type": "PostalAddress",
      streetAddress: court.address ?? undefined,
      addressLocality: court.city.name,
      addressRegion: court.city.province,
      addressCountry: "PH",
    },
    ...(court.latitude != null &&
      court.longitude != null && {
        geo: { "@type": "GeoCoordinates", latitude: court.latitude, longitude: court.longitude },
      }),
    amenityFeature: court.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };
}

async function CourtDetail({ params }: Pick<PageProps<"/courts/[city]/[slug]">, "params">) {
  const { city, slug } = await params;
  const court = await getCourtBySlug(slug);
  if (!court) notFound();
  if (court.city.slug !== city) permanentRedirect(courtPath(court));

  const mapsUrl =
    court.latitude != null && court.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${court.latitude},${court.longitude}`
      : null;

  return (
    <>
      {!court.isSample && <JsonLd data={courtJsonLd(court)} />}
      <DetailLayout
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Courts", path: "/courts" },
          { name: court.city.name, path: `/courts/${court.city.slug}` },
          { name: court.name, path: courtPath(court) },
        ]}
        eyebrow={<span>{environmentLabels[court.environment]} court</span>}
        title={court.name}
        summary={court.summary}
        imageUrl={court.imageUrl}
        imageAlt={`${court.name} pickleball court`}
        imageLabel={court.city.name}
        isSample={court.isSample}
        aside={
          <InfoCard title="Venue details">
            {court.address && (
              <InfoRow icon={MapPinIcon} label="Address">
                {court.address}
                {mapsUrl && (
                  <span className="mt-1 block">
                    <ExternalLink href={mapsUrl}>Open in Google Maps</ExternalLink>
                  </span>
                )}
              </InfoRow>
            )}
            {court.openingHours && (
              <InfoRow icon={ClockIcon} label="Hours">
                {court.openingHours}
                <OpenNowStatus hours={court.openingHours} className="mt-1 flex" />
              </InfoRow>
            )}
            {court.courtCount && (
              <InfoRow icon={LayoutGridIcon} label="Courts">
                {pluralize(court.courtCount, "court")}
                {court.surface ? ` · ${court.surface}` : ""}
              </InfoRow>
            )}
            {court.priceInfo && (
              <InfoRow icon={BadgeDollarSignIcon} label="Rates">
                {court.priceInfo}
              </InfoRow>
            )}
            {court.contactPhone && (
              <InfoRow icon={PhoneIcon} label="Phone">
                <a href={`tel:${court.contactPhone}`} className="hover:underline">
                  {court.contactPhone}
                </a>
              </InfoRow>
            )}
            {court.contactEmail && (
              <InfoRow icon={MailIcon} label="Email">
                <a href={`mailto:${court.contactEmail}`} className="hover:underline">
                  {court.contactEmail}
                </a>
              </InfoRow>
            )}
            {(court.websiteUrl || court.facebookUrl) && (
              <InfoRow icon={GlobeIcon} label="Online">
                <span className="flex flex-col gap-1">
                  {court.websiteUrl && <ExternalLink href={court.websiteUrl}>Website</ExternalLink>}
                  {court.facebookUrl && (
                    <ExternalLink href={court.facebookUrl}>Facebook page</ExternalLink>
                  )}
                </span>
              </InfoRow>
            )}
          </InfoCard>
        }
      >
        <section aria-labelledby="about-court" className="space-y-3">
          <h2 id="about-court" className="text-2xl font-bold text-court-deep">
            About this court
          </h2>
          <p className="leading-relaxed text-foreground/90">
            {court.description ?? "More details about this venue are coming soon."}
          </p>
        </section>
        {court.amenities.length > 0 && (
          <section aria-labelledby="amenities" className="space-y-3">
            <h2 id="amenities" className="text-2xl font-bold text-court-deep">
              Amenities
            </h2>
            <ul className="flex flex-wrap gap-2">
              {court.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full bg-court-soft px-3 py-1 text-sm font-medium text-court-deep"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </section>
        )}
      </DetailLayout>
    </>
  );
}

export default function CourtDetailPage({ params }: PageProps<"/courts/[city]/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CourtDetail params={params} />
    </Suspense>
  );
}
