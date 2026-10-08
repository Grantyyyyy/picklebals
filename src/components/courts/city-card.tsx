import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { pluralize } from "@/lib/utils/format";
import type { City } from "@/types/content";

export function CityCard({ city }: { city: City }) {
  return (
    <article className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-court p-6 text-white transition-colors hover:bg-court-deep">
      <div className="absolute inset-0 bg-court-lines opacity-60" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-ball uppercase">
            {city.province}
          </p>
          <h3 className="mt-1 text-2xl font-bold">
            <Link href={`/courts/${city.slug}`} className="after:absolute after:inset-0">
              {city.name}
            </Link>
          </h3>
        </div>
        <ArrowUpRightIcon
          className="size-5 shrink-0 text-ball transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
      <p className="relative text-sm text-white/80">{pluralize(city.courtCount, "court")} listed</p>
    </article>
  );
}
