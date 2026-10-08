import { MapPinnedIcon } from "lucide-react";
import { Suspense } from "react";

import { CityCard } from "@/components/courts/city-card";
import { CourtGrid } from "@/components/courts/court-card";
import { CourtSearchForm } from "@/components/courts/court-search-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ResultsSkeletonTransition,
  ResultsTransition,
} from "@/components/shared/results-transition";
import { SectionHeading } from "@/components/shared/section-heading";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { getCities } from "@/features/cities/queries";
import { getCourts } from "@/features/courts/queries";
import { buildMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils/format";
import type { City } from "@/types/content";

export const metadata = buildMetadata({
  title: "Pickleball courts in the Philippines",
  description:
    "Browse indoor, outdoor and covered pickleball courts in Cagayan de Oro, Iligan, Bukidnon and across Northern Mindanao.",
  path: "/courts",
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function CourtSearchResults({
  searchParams,
  cities,
}: {
  searchParams: PageProps<"/courts">["searchParams"];
  cities: City[];
}) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim() || undefined;
  const requestedCity = firstParam(params.city);
  const citySlug = cities.some((city) => city.slug === requestedCity) ? requestedCity : undefined;
  const courts = await getCourts({ query, citySlug });
  const cityName = cities.find((city) => city.slug === citySlug)?.name;

  return (
    <>
      <CourtSearchForm
        cities={cities}
        defaultQuery={query}
        defaultCity={citySlug}
        className="max-w-3xl border"
        keepScroll
      />
      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {pluralize(courts.length, "court")}
        {query ? ` matching “${query}”` : ""}
        {cityName ? ` in ${cityName}` : ""}
      </p>
      <ResultsTransition filterKey={`${query ?? ""}|${citySlug ?? ""}`}>
        <div className="mt-4">
          {courts.length > 0 ? (
            <CourtGrid courts={courts} />
          ) : (
            <EmptyState
              title="No courts found"
              description="Try a different name or city. Know a court we're missing? Let us know."
              action={{ label: "List a court", href: "/list-your-court" }}
            />
          )}
        </div>
      </ResultsTransition>
    </>
  );
}

export default async function CourtsPage({ searchParams }: PageProps<"/courts">) {
  const cities = await getCities();

  return (
    <>
      <PageHeader
        eyebrow="Court directory"
        title="Pickleball courts near you"
        description="Search venues across Northern Mindanao by name or city."
      />
      <section aria-label="Court search" className="container-page py-12">
        <Suspense
          fallback={
            <>
              <CourtSearchForm cities={cities} className="max-w-3xl border" />
              <ResultsSkeletonTransition>
                <div className="mt-12">
                  <CardGridSkeleton />
                </div>
              </ResultsSkeletonTransition>
            </>
          }
        >
          <CourtSearchResults searchParams={searchParams} cities={cities} />
        </Suspense>
      </section>
      {cities.length > 0 && (
        <section aria-labelledby="browse-cities" className="bg-sand py-16">
          <div className="container-page">
            <SectionHeading id="browse-cities" eyebrow="By city" title="Browse courts by city" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cities.map((city) => (
                <li key={city.id}>
                  <CityCard city={city} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {cities.length === 0 && (
        <div className="container-page pb-16">
          <EmptyState
            icon={MapPinnedIcon}
            title="No cities yet"
            description="Cities appear here once courts are published."
          />
        </div>
      )}
    </>
  );
}
