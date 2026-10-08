import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { courtPath } from "@/components/courts/court-card";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { environmentLabels, pluralize } from "@/lib/utils/format";
import type { Court } from "@/types/content";

const MAX_TAGS = 3;

/** Home-page variant of the court card, styled as a showcase tile. */
export function FeaturedCourtCard({ court, eager }: { court: Court; eager?: boolean }) {
  const tags = court.amenities.slice(0, MAX_TAGS);
  const hiddenTags = court.amenities.length - tags.length;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-dashed border-court/35 bg-card p-5 transition-[border-color,box-shadow] hover:border-court/70 hover:shadow-xl hover:shadow-court/10 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-wider text-court uppercase">
          {environmentLabels[court.environment]}
          {court.courtCount ? ` · ${pluralize(court.courtCount, "court")}` : ""}
        </p>
        {court.isSample && <SampleBadge />}
      </div>
      <h3 className="mt-2 font-heading text-xl leading-tight font-extrabold text-court-deep uppercase font-stretch-condensed sm:text-2xl">
        <Link
          href={courtPath(court)}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl"
        >
          {court.name}
        </Link>
      </h3>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
        {court.city.name}, {court.city.province}
      </p>
      {court.priceInfo && (
        <p className="mt-3 text-base font-semibold text-court-deep">{court.priceInfo}</p>
      )}
      <MediaImage
        src={court.imageUrl}
        alt={`${court.name} in ${court.city.name}`}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        loading={eager ? "eager" : undefined}
        className="mt-4 aspect-[16/10] rounded-xl"
      />
      <div className="mt-4 flex flex-1 flex-col justify-end gap-4">
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Amenities">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-court-soft px-2.5 py-0.5 text-xs font-medium text-court-deep"
              >
                {tag}
              </li>
            ))}
            {hiddenTags > 0 && (
              <li className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                +{hiddenTags} more
              </li>
            )}
          </ul>
        )}
        <span
          className="inline-flex items-center gap-1 text-sm font-bold text-court uppercase"
          aria-hidden="true"
        >
          View court
          <ArrowRightIcon className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
