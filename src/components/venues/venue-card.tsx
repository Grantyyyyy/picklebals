import { LayoutGridIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { pluralize } from "@/lib/utils/format";
import type { Venue } from "@/types/content";

import { VerificationBadge } from "./verification-badge";

export function venuePath(venue: Pick<Venue, "slug">): string {
  return `/venues/${venue.slug}`;
}

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-court/10">
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-court text-ball"
          aria-hidden="true"
        >
          <MapPinIcon className="size-5" />
        </span>
        <VerificationBadge status={venue.verificationStatus} />
      </div>
      <h3 className="text-lg font-semibold text-court-deep">
        <Link href={venuePath(venue)} className="after:absolute after:inset-0">
          {venue.name}
        </Link>
      </h3>
      <p className="text-sm text-muted-foreground">
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
          {venue.courts.length > 0 ? pluralize(venue.courts.length, "court") : "Courts not listed"}
        </span>
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
