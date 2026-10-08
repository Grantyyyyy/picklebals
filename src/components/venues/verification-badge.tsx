import { BadgeCheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/content";

export function VerificationBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  // Only confirmed venues get a badge; unconfirmed ones are shown as regular listings.
  if (status !== "verified") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        "border-court/30 bg-court-soft text-court-deep",
        className,
      )}
      title="Details confirmed by the venue operator"
    >
      <BadgeCheckIcon className="size-3" aria-hidden="true" />
      Verified
    </span>
  );
}
