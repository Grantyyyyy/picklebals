import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { courtPath } from "@/components/courts/court-card";
import { type CourtCrop, CourtMarkings } from "@/components/shared/court-markings";
import { OpenNowStatus } from "@/components/shared/live-status";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { cn } from "@/lib/utils";
import { environmentLabels, pluralize } from "@/lib/utils/format";
import type { Court } from "@/types/content";

const MAX_TAGS = 3;
/** Each card without a photo frames a different part of the court. */
const ART: { crop: CourtCrop; ball: string }[] = [
  { crop: "kitchen", ball: "top-[38%] left-[64%]" },
  { crop: "corner", ball: "top-[30%] left-[30%]" },
  { crop: "service", ball: "top-[44%] left-[52%]" },
];

/**
 * Home-page showcase card: a tall portrait (photo, or a court drawing until a
 * photo exists) with a frosted info panel that opens on hover to show more.
 */
export function FeaturedCourtCard({
  court,
  eager,
  index = 0,
}: {
  court: Court;
  eager?: boolean;
  index?: number;
}) {
  const tags = court.amenities.slice(0, MAX_TAGS);
  const hiddenTags = court.amenities.length - tags.length;
  const art = ART[index % ART.length];
  const hasMore = Boolean(court.summary) || tags.length > 0;

  return (
    <article className="group relative isolate flex min-h-[28rem] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-court text-white has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/60 has-[a:focus-visible]:ring-offset-2 sm:aspect-[3/4]">
      {court.imageUrl ? (
        <MediaImage
          src={court.imageUrl}
          alt={`${court.name} in ${court.city.name}`}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading={eager ? "eager" : undefined}
          className="absolute inset-0 -z-20 transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 -z-20 transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-court-grain opacity-70" />
          <CourtMarkings crop={art.crop} />
          <span
            className={cn(
              "absolute size-5 rounded-full bg-ball shadow-[0_4px_6px_oklch(0.18_0.018_165/0.35)]",
              art.ball,
            )}
          />
        </div>
      )}
      <div
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/10 to-ink/20"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-2 p-4">
        <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-court-deep">
          {environmentLabels[court.environment]}
          {court.courtCount ? ` · ${pluralize(court.courtCount, "court")}` : ""}
        </span>
        {court.isSample && <SampleBadge />}
      </div>

      <div className="m-3 rounded-[1.1rem] bg-ink/60 p-5 ring-1 ring-white/15 backdrop-blur-md">
        <h3 className="font-heading text-2xl leading-[1.05] font-extrabold uppercase font-stretch-condensed sm:text-[1.75rem]">
          <Link
            href={courtPath(court)}
            className="outline-none after:absolute after:inset-0 after:rounded-[1.5rem]"
          >
            {court.name}
          </Link>
        </h3>
        <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-white/75">
          <MapPinIcon className="size-3.5 shrink-0 text-ball" aria-hidden="true" />
          {court.city.name}, {court.city.province}
        </p>
        {court.openingHours && (
          <OpenNowStatus hours={court.openingHours} onDark className="mt-2 flex" />
        )}

        {hasMore && (
          <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-has-[a:focus-visible]:grid-rows-[1fr] [@media(hover:hover)]:grid-rows-[0fr]">
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-4 opacity-100 transition-opacity duration-300 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100 [@media(hover:hover)]:opacity-0">
                {court.summary && (
                  <p className="line-clamp-2 text-sm text-white/80">{court.summary}</p>
                )}
                {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Amenities">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/15"
                      >
                        {tag}
                      </li>
                    ))}
                    {hiddenTags > 0 && (
                      <li className="rounded-full px-1 py-0.5 text-xs font-medium text-white/60">
                        +{hiddenTags} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
          <p className="min-w-0 truncate text-sm font-semibold">{court.priceInfo ?? ""}</p>
          <span
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-court-deep transition-colors group-hover:bg-ball"
            aria-hidden="true"
          >
            View court
            <ArrowRightIcon className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
