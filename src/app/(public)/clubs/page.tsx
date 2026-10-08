import { UsersRoundIcon } from "lucide-react";
import { Suspense } from "react";

import { ClubCard } from "@/components/clubs/club-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { getClubs } from "@/features/clubs/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pickleball clubs in the Philippines",
  description:
    "Join a pickleball club in Cagayan de Oro, Iligan, Bukidnon and Northern Mindanao — open play, clinics and leagues for every level.",
  path: "/clubs",
});

async function ClubList() {
  const clubs = await getClubs();
  return (
    <>
      {clubs.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <li key={club.id}>
              <ClubCard club={club} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UsersRoundIcon}
          title="No clubs listed yet"
          description="Run a club? Get in touch and we'll add it to the directory."
          action={{ label: "Contact us", href: "/contact" }}
        />
      )}
    </>
  );
}

export default function ClubsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Club directory"
        title="Find your pickleball community"
        description="Clubs host regular open play, clinics and friendly competition for every skill level."
      />
      <section aria-label="Clubs" className="container-page py-12">
        <Suspense fallback={<CardGridSkeleton />}>
          <ClubList />
        </Suspense>
      </section>
    </>
  );
}
