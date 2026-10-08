import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CourtGrid } from "@/components/courts/court-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { getCities, getCityBySlug } from "@/features/cities/queries";
import { getCourts } from "@/features/courts/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";

export async function generateStaticParams() {
  const cities = await getCities();
  return ensureStaticParams(
    cities.map((city) => ({ city: city.slug })),
    { city: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/courts/[city]">) {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city)
    return buildMetadata({
      title: "City not found",
      description: "",
      path: "/courts",
      noIndex: true,
    });

  return buildMetadata({
    title: `Pickleball courts in ${city.name}, ${city.province}`,
    description: `Find ${pluralize(city.courtCount, "pickleball court")} in ${city.name}, ${city.province} — locations, hours, amenities and open play.`,
    path: `/courts/${city.slug}`,
  });
}

async function CityCourts({ params }: Pick<PageProps<"/courts/[city]">, "params">) {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const courts = await getCourts({ citySlug: city.slug });

  return (
    <>
      <PageHeader
        eyebrow={`${city.province} · ${city.region}`}
        title={`Pickleball courts in ${city.name}`}
        description={city.description ?? undefined}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Pickleball courts in ${city.name}`,
          itemListElement: courts.map((court, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/courts/${city.slug}/${court.slug}`),
            name: court.name,
          })),
        }}
      />
      <div className="container-page space-y-8 py-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Courts", path: "/courts" },
            { name: city.name, path: `/courts/${city.slug}` },
          ]}
        />
        {courts.length > 0 ? (
          <CourtGrid courts={courts} />
        ) : (
          <EmptyState
            title={`No courts listed in ${city.name} yet`}
            description="Know a venue here? Help players find it."
            action={{ label: "List a court", href: "/list-your-court" }}
          />
        )}
      </div>
    </>
  );
}

export default function CityCourtsPage({ params }: PageProps<"/courts/[city]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CityCourts params={params} />
    </Suspense>
  );
}
