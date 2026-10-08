import { CalendarClockIcon, GlobeIcon, MailIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DetailLayout, ExternalLink, InfoCard, InfoRow } from "@/components/shared/detail-layout";
import { JsonLd } from "@/components/shared/json-ld";
import { NextMeetupStatus } from "@/components/shared/live-status";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { getClubBySlug, getClubs } from "@/features/clubs/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { isLogoImage } from "@/lib/utils/images";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";

export async function generateStaticParams() {
  const clubs = await getClubs();
  return ensureStaticParams(
    clubs.map((club) => ({ slug: club.slug })),
    { slug: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/clubs/[slug]">) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) {
    return buildMetadata({
      title: "Club not found",
      description: "",
      path: "/clubs",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: club.city ? `${club.name} — Pickleball club in ${club.city.name}` : club.name,
    description: club.summary ?? `${club.name} is a pickleball club in the Philippines.`,
    path: `/clubs/${club.slug}`,
    image: club.imageUrl,
  });
}

async function ClubDetail({ params }: Pick<PageProps<"/clubs/[slug]">, "params">) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  return (
    <>
      {!club.isSample && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsOrganization",
            name: club.name,
            sport: "Pickleball",
            description: club.description ?? club.summary ?? undefined,
            url: absoluteUrl(`/clubs/${club.slug}`),
            ...(club.city && {
              address: {
                "@type": "PostalAddress",
                addressLocality: club.city.name,
                addressRegion: club.city.province,
                addressCountry: "PH",
              },
            }),
          }}
        />
      )}
      <DetailLayout
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Clubs", path: "/clubs" },
          { name: club.name, path: `/clubs/${club.slug}` },
        ]}
        eyebrow={<span>Pickleball club</span>}
        title={club.name}
        summary={club.summary}
        imageUrl={club.imageUrl}
        imageAlt={club.name}
        imageFit={isLogoImage(club.imageUrl) ? "contain" : "cover"}
        imageLabel={club.city?.name}
        isSample={club.isSample}
        aside={
          <InfoCard title="Club details">
            {club.city && (
              <InfoRow icon={MapPinIcon} label="Based in">
                <Link href={`/courts/${club.city.slug}`} className="hover:underline">
                  {club.city.name}, {club.city.province}
                </Link>
              </InfoRow>
            )}
            {club.homeCourt && (
              <InfoRow icon={MapPinIcon} label="Home court">
                <Link
                  href={`/courts/${club.homeCourt.citySlug}/${club.homeCourt.slug}`}
                  className="font-medium text-court hover:underline"
                >
                  {club.homeCourt.name}
                </Link>
              </InfoRow>
            )}
            {club.meetingSchedule && (
              <InfoRow icon={CalendarClockIcon} label="Schedule">
                {club.meetingSchedule}
                <NextMeetupStatus schedule={club.meetingSchedule} className="mt-1 flex" />
              </InfoRow>
            )}
            {club.contactEmail && (
              <InfoRow icon={MailIcon} label="Email">
                <a href={`mailto:${club.contactEmail}`} className="hover:underline">
                  {club.contactEmail}
                </a>
              </InfoRow>
            )}
            {(club.websiteUrl || club.facebookUrl) && (
              <InfoRow icon={GlobeIcon} label="Online">
                <span className="flex flex-col gap-1">
                  {club.websiteUrl && <ExternalLink href={club.websiteUrl}>Website</ExternalLink>}
                  {club.facebookUrl && (
                    <ExternalLink href={club.facebookUrl}>Facebook page</ExternalLink>
                  )}
                </span>
              </InfoRow>
            )}
          </InfoCard>
        }
      >
        <section aria-labelledby="about-club" className="space-y-3">
          <h2 id="about-club" className="text-2xl font-bold text-court-deep">
            About the club
          </h2>
          <p className="leading-relaxed text-foreground/90">
            {club.description ?? "More details about this club are coming soon."}
          </p>
        </section>
        {club.skillLevels.length > 0 && (
          <section aria-labelledby="skill-levels" className="space-y-3">
            <h2 id="skill-levels" className="text-2xl font-bold text-court-deep">
              Skill levels
            </h2>
            <ul className="flex flex-wrap gap-2">
              {club.skillLevels.map((level) => (
                <li
                  key={level}
                  className="rounded-full bg-court-soft px-3 py-1 text-sm font-medium text-court-deep"
                >
                  {level}
                </li>
              ))}
            </ul>
          </section>
        )}
      </DetailLayout>
    </>
  );
}

export default function ClubDetailPage({ params }: PageProps<"/clubs/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ClubDetail params={params} />
    </Suspense>
  );
}
