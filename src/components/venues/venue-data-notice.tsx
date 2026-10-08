import { InfoIcon } from "lucide-react";
import Link from "next/link";

import type { VenueDataSource } from "@/features/venues/queries";
import { LOCAL_VENUE_SEED_PATH } from "@/features/venues/local-seed";

/** Explains where venue data comes from and how reliable it is. */
export function VenueDataNotice({ source }: { source: VenueDataSource }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p>
          Listings marked <strong>Unverified</strong> were compiled from public sources and have not
          been confirmed by the venue. Hours, fees and court availability may differ, so please
          check with the venue before you go.{" "}
          <Link href="/list-your-court" className="font-medium underline underline-offset-2">
            Run a venue? Help us verify it.
          </Link>
        </p>
        {source.kind === "seed-file" && (
          <p className="text-xs text-amber-800">
            Development preview: Supabase is not configured, so venues are read from the curated
            test dataset (<code>{LOCAL_VENUE_SEED_PATH}</code>).
          </p>
        )}
      </div>
    </div>
  );
}
