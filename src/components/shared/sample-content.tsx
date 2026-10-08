import { FlaskConicalIcon } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold tracking-wide text-amber-800 uppercase",
        className,
      )}
      title="Sample content for preview purposes, not a real listing"
    >
      <FlaskConicalIcon className="size-3" aria-hidden="true" />
      Sample
    </span>
  );
}

/** Site-wide banner shown while the app renders sample content (Supabase not configured). */
export function SampleContentNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div role="note" className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <p className="container-page py-2 text-center text-xs sm:text-sm">
        <strong className="font-semibold">Preview mode:</strong> Supabase is not configured.
        Listings marked “Sample” are for preview only.
      </p>
    </div>
  );
}
