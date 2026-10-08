"use client";

import { PauseIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Pause/play control for auto-advancing content. */
export function AutoplayToggle({
  paused,
  onToggle,
  label,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? `Play ${label}` : `Pause ${label}`}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-3",
        className,
      )}
    >
      {paused ? (
        <PlayIcon className="size-4" aria-hidden="true" />
      ) : (
        <PauseIcon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
