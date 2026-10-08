"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { getEventTiming, getNextMeetup, getOpenStatus } from "@/lib/utils/live-time";

/* A shared minute clock. The server snapshot is null, so these badges render
   nothing in cached HTML and appear once the browser knows the real time. */
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((notify) => notify());
  }, 60_000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}

function useNow(): Date | null {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return value ? new Date(value) : null;
}

const pill = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold";

function Dot({ className }: { className: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", className)} aria-hidden="true" />;
}

export function EventTimingBadge({
  startsAt,
  endsAt,
  onDark,
}: {
  startsAt: string;
  endsAt: string | null;
  onDark?: boolean;
}) {
  const current = useNow();
  const timing = current && getEventTiming(startsAt, endsAt, current);
  if (!timing) return null;

  if (timing.tone === "live") {
    return (
      <span className={cn(pill, "animate-status-in bg-ink text-ball ring-1 ring-ball/40")}>
        <Dot className="bg-ball" />
        {timing.label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        pill,
        "animate-status-in",
        timing.tone === "soon"
          ? onDark
            ? "bg-ball text-court-deep"
            : "bg-court-deep text-white"
          : onDark
            ? "bg-white/10 text-white"
            : "bg-court-soft text-court-deep",
      )}
    >
      {timing.label}
    </span>
  );
}

export function OpenNowStatus({
  hours,
  onDark,
  className,
}: {
  hours: string;
  onDark?: boolean;
  className?: string;
}) {
  const current = useNow();
  const status = current && getOpenStatus(hours, current);
  if (!status) return null;
  const openText = onDark ? "text-ball" : "text-court";
  const closedText = onDark ? "text-white/65" : "text-muted-foreground";
  const openDot = onDark ? "bg-ball ring-2 ring-ball/25" : "bg-court ring-2 ring-court/20";
  return (
    <span
      className={cn(
        "inline-flex animate-status-in items-center gap-1.5 text-xs font-semibold",
        status.open ? openText : closedText,
        className,
      )}
    >
      <Dot
        className={cn(
          status.open ? openDot : onDark ? "bg-white/35" : "bg-muted-foreground/40",
          status.closingSoon && "opacity-60",
        )}
      />
      {status.label}
    </span>
  );
}

export function NextMeetupStatus({
  schedule,
  className,
}: {
  schedule: string;
  className?: string;
}) {
  const current = useNow();
  const label = current && getNextMeetup(schedule, current);
  if (!label) return null;
  const live = label === "Playing right now";
  return (
    <span
      className={cn(
        "inline-flex animate-status-in items-center gap-1.5 text-xs font-semibold text-court",
        className,
      )}
    >
      <Dot className={live ? "bg-ball ring-2 ring-court/30" : "bg-court"} />
      {label}
    </span>
  );
}
