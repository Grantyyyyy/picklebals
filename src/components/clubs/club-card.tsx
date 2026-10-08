import { CalendarClockIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import type { Club } from "@/types/content";

export function ClubCard({ club }: { club: Club }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-court/10">
      <MediaImage
        src={club.imageUrl}
        alt={club.name}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[5/2]"
        label="Club"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          {club.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden="true" />
              {club.city.name}
            </span>
          ) : (
            <span />
          )}
          {club.isSample && <SampleBadge />}
        </div>
        <h3 className="text-lg font-semibold text-court-deep">
          <Link href={`/clubs/${club.slug}`} className="after:absolute after:inset-0">
            {club.name}
          </Link>
        </h3>
        {club.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{club.summary}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {club.skillLevels.map((level) => (
            <span
              key={level}
              className="rounded-full bg-court-soft px-2.5 py-0.5 text-xs font-medium text-court-deep"
            >
              {level}
            </span>
          ))}
        </div>
        {club.meetingSchedule && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClockIcon className="size-3.5" aria-hidden="true" />
            {club.meetingSchedule}
          </p>
        )}
      </div>
    </article>
  );
}
