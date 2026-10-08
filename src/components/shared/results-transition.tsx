import { type ReactNode, ViewTransition } from "react";

/**
 * Crossfades search results when the filters in the URL change, and lets them
 * settle in when they first stream in. Pair the Suspense fallback with
 * `ResultsSkeletonTransition`. Classes are defined in globals.css.
 */
export function ResultsTransition({
  filterKey,
  children,
}: {
  filterKey: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition
      key={filterKey}
      name="search-results"
      share="results-swap"
      enter="results-in"
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}

export function ResultsSkeletonTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition exit="results-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
