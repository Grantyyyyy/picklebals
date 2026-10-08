import { BadgeCheckIcon, CircleHelpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/content";

export function VerificationBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const verified = status === "verified";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        verified
          ? "border-court/30 bg-court-soft text-court-deep"
          : "border-amber-300 bg-amber-50 text-amber-800",
        className,
      )}
      title={
        verified
          ? "Details confirmed by the venue operator"
          : "Compiled from public sources; not yet confirmed by the venue operator"
      }
    >
      {verified ? (
        <BadgeCheckIcon className="size-3" aria-hidden="true" />
      ) : (
        <CircleHelpIcon className="size-3" aria-hidden="true" />
      )}
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}
