import { LayoutGridIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/shared/media-image";
import { pluralize } from "@/lib/utils/format";
import type { Venue } from "@/types/content";

import { VerificationBadge } from "./verification-badge";

export function venuePath(venue: Pick<Venue, "slug">): string {
  return `/venues/${venue.slug}`;
}

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-court/10">
      <div className="relative">
        <MediaImage
          src={venue.imageUrl}
          alt={`${venue.name} in ${venue.city.name}`}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
        />
        <VerificationBadge
          status={venue.verificationStatus}
          className="absolute top-3 right-3 bg-white/95"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-court-deep">
          <Link href={venuePath(venue)} className="after:absolute after:inset-0">
            {venue.name}
          </Link>
        </h3>
        <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-court" aria-hidden="true" />
          {venue.address ?? <span className="italic">Address not yet confirmed</span>}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
          {venue.barangay && (
            <span className="rounded-full bg-court-soft px-2.5 py-1 text-court-deep">
              Brgy. {venue.barangay}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <LayoutGridIcon className="size-3.5" aria-hidden="true" />
            {venue.courts.length > 0
              ? pluralize(venue.courts.length, "court")
              : "Courts not listed"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function VenueGrid({ venues }: { venues: Venue[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <li key={venue.id} className="grid">
          <VenueCard venue={venue} />
        </li>
      ))}
    </ul>
  );
}
