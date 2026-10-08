import { MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { environmentLabels, pluralize } from "@/lib/utils/format";
import type { Court } from "@/types/content";

export function courtPath(court: Pick<Court, "slug" | "city">): string {
  return `/courts/${court.city.slug}/${court.slug}`;
}

export function CourtCard({ court, eager }: { court: Court; eager?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-court/10">
      <MediaImage
        src={court.imageUrl}
        alt={`${court.name} in ${court.city.name}`}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        loading={eager ? "eager" : undefined}
        className="aspect-[5/3]"
        label={environmentLabels[court.environment]}
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            {court.city.name}, {court.city.province}
          </span>
          {court.isSample && <SampleBadge />}
        </div>
        <h3 className="text-lg font-semibold text-court-deep">
          <Link href={courtPath(court)} className="after:absolute after:inset-0">
            {court.name}
          </Link>
        </h3>
        {court.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{court.summary}</p>
        )}
        {court.courtCount && (
          <p className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-court">
            <UsersIcon className="size-4" aria-hidden="true" />
            {pluralize(court.courtCount, "court")}
          </p>
        )}
      </div>
    </article>
  );
}

export function CourtGrid({ courts }: { courts: Court[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courts.map((court, index) => (
        <li key={court.id} className="grid">
          <CourtCard court={court} eager={index < 3} />
        </li>
      ))}
    </ul>
  );
}
