import { DatabaseIcon, MapPinnedIcon } from "lucide-react";
import { Suspense } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ResultsSkeletonTransition,
  ResultsTransition,
} from "@/components/shared/results-transition";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { VenueGrid } from "@/components/venues/venue-card";
import { VenueSearchForm } from "@/components/venues/venue-search-form";
import { siteConfig } from "@/config/site";
import {
  getVenueBarangays,
  getVenueDirectory,
  type VenueDirectory,
} from "@/features/venues/queries";
import { buildMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils/format";

const { city, province } = siteConfig.market;

export const metadata = buildMetadata({
  title: `Pickleball venues in ${city} City`,
  description: `Find places to play pickleball in ${city} City, ${province}. Search by name or barangay.`,
  path: "/venues",
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function NoVenues({ directory, filtered }: { directory: VenueDirectory; filtered: boolean }) {
  if (filtered) {
    return (
      <EmptyState
        title="No venues match your search"
        description="Try a different name, or clear the barangay filter."
        action={{ label: "Show all venues", href: "/venues" }}
      />
    );
  }
  if (directory.source.kind === "seed-file" && directory.source.seedStatus !== "ok") {
    return (
      <EmptyState
        icon={DatabaseIcon}
        title="Venue data is not loaded yet"
        description={
          directory.source.seedStatus === "invalid"
            ? "The local venue seed file failed validation. Run `pnpm seed:venues --check` for details."
            : "Connect Supabase, or add the curated seed file at data/seeds/iligan_pickleball_venues_seed.json to preview venues locally."
        }
      />
    );
  }
  return (
    <EmptyState
      icon={MapPinnedIcon}
      title="No venues listed yet"
      description={`We're still mapping places to play in ${city}. Know one? Tell us about it.`}
      action={{ label: "Suggest a venue", href: "/list-your-court" }}
    />
  );
}

async function VenueResults({ searchParams }: Pick<PageProps<"/venues">, "searchParams">) {
  const params = await searchParams;
  const barangays = await getVenueBarangays();
  const query = firstParam(params.q)?.trim() || undefined;
  const requestedBarangay = firstParam(params.barangay);
  const barangay = barangays.find(
    (value) => value.toLowerCase() === requestedBarangay?.toLowerCase(),
  );
  const directory = await getVenueDirectory({ query, barangay });
  const filtered = Boolean(query || barangay);

  return (
    <>
      <VenueSearchForm barangays={barangays} defaultQuery={query} defaultBarangay={barangay} />
      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {pluralize(directory.venues.length, "venue")}
        {query ? ` matching “${query}”` : ""}
        {barangay ? ` in Barangay ${barangay}` : ""}
      </p>
      <ResultsTransition filterKey={`${query ?? ""}|${barangay ?? ""}`}>
        <div className="mt-4">
          {directory.venues.length > 0 ? (
            <VenueGrid venues={directory.venues} />
          ) : (
            <NoVenues directory={directory} filtered={filtered} />
          )}
        </div>
      </ResultsTransition>
    </>
  );
}

export default function VenuesPage({ searchParams }: PageProps<"/venues">) {
  return (
    <>
      <PageHeader
        eyebrow="Venue directory"
        title={`Where to play in ${city}`}
        description={`Pickleball venues across ${city} City, ${province}. Tournament venues and open-play spots, labeled by how well each listing has been verified.`}
      />
      <section aria-label="Venue search" className="container-page py-12">
        <Suspense
          fallback={
            <>
              <VenueSearchForm barangays={[]} />
              <ResultsSkeletonTransition>
                <div className="mt-12">
                  <CardGridSkeleton />
                </div>
              </ResultsSkeletonTransition>
            </>
          }
        >
          <VenueResults searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
