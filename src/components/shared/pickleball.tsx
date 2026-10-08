import { cn } from "@/lib/utils";

/**
 * The lime ball. Its holes turn with the page scroll (see `ScrollBall`), so
 * every ball on a page rolls together.
 */
export function Pickleball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("pointer-events-none", className)} aria-hidden="true">
      <circle cx="50" cy="50" r="48" className="fill-ball" />
      <g data-scroll-spin className="origin-center fill-court-deep/25 [transform-box:view-box]">
        <circle cx="32" cy="32" r="5" />
        <circle cx="68" cy="32" r="5" />
        <circle cx="50" cy="50" r="5" />
        <circle cx="32" cy="68" r="5" />
        <circle cx="68" cy="68" r="5" />
        <circle cx="50" cy="16" r="4" />
        <circle cx="50" cy="84" r="4" />
        <circle cx="16" cy="50" r="4" />
        <circle cx="84" cy="50" r="4" />
      </g>
    </svg>
  );
}
