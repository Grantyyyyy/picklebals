"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadTournamentSnapshot } from "@/features/tournaments/snapshot";
import type { TournamentSnapshot } from "@/features/tournaments/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type LiveConnection = "preview" | "connecting" | "live" | "offline";

/** Tables whose changes can move a bracket; all are in the `supabase_realtime` publication. */
const WATCHED_TABLES = [
  "matches",
  "match_games",
  "match_court_assignments",
  "tournament_divisions",
] as const;

/** Bursts of changes (a score plus its match row) collapse into one reload. */
const RELOAD_DEBOUNCE_MS = 250;
/** While Realtime is down, fall back to polling. */
const POLL_MS = 30_000;

/**
 * Keeps a tournament snapshot current. Realtime events only signal that something changed;
 * the snapshot is then reloaded whole, which also covers deletes that Realtime cannot filter.
 */
export function useLiveSnapshot(
  tournamentId: string,
  initial: TournamentSnapshot,
  enabled: boolean,
) {
  const [snapshot, setSnapshot] = useState(initial);
  const [connection, setConnection] = useState<LiveConnection>(enabled ? "connecting" : "preview");
  const reloadRef = useRef<() => void>(() => {});

  useEffect(() => {
    const supabase = enabled ? createBrowserSupabaseClient() : null;
    if (!supabase) return;

    let cancelled = false;
    let inFlight = false;
    let queued = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let status: LiveConnection = "connecting";

    const reload = async () => {
      if (inFlight) {
        queued = true;
        return;
      }
      inFlight = true;
      try {
        const next = await loadTournamentSnapshot(supabase, tournamentId);
        if (!cancelled) setSnapshot(next);
      } catch {
        // Keep showing the last good snapshot; the status line says how old it is.
      } finally {
        inFlight = false;
        if (queued && !cancelled) {
          queued = false;
          schedule();
        }
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(reload, RELOAD_DEBOUNCE_MS);
    };
    reloadRef.current = schedule;

    const channel = supabase.channel(`tournament:${tournamentId}`);
    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `tournament_id=eq.${tournamentId}` },
        schedule,
      );
    }
    channel.subscribe((state) => {
      if (cancelled) return;
      if (state === "SUBSCRIBED") {
        // Catch up on anything that changed between the server render and the subscription.
        if (status !== "live") schedule();
        status = "live";
      } else {
        status = "offline";
      }
      setConnection(status);
    });

    const poll = setInterval(() => {
      if (status !== "live" && document.visibilityState === "visible") schedule();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      reloadRef.current = () => {};
      void supabase.removeChannel(channel);
    };
  }, [tournamentId, enabled]);

  const refresh = useCallback(() => reloadRef.current(), []);

  return { snapshot, connection, refresh };
}
