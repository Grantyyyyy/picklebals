"use client";

import { type FocusEvent, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AutoplayOptions = {
  /** Milliseconds between advances. */
  interval: number;
  /** Pause while the pointer is over the region. Off for areas people work in (e.g. a search form). */
  pauseOnHover?: boolean;
};

/**
 * Timer for auto-advancing content that stays accessible: it never runs with reduced motion,
 * pauses while the tab is hidden, while keyboard focus is inside, optionally on hover, and
 * whenever the visitor presses the pause control (WCAG 2.2.2 Pause, Stop, Hide).
 */
export function useAutoplay(
  advance: () => void,
  { interval, pauseOnHover = true }: AutoplayOptions,
) {
  const reducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [hidden, setHidden] = useState(false);

  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });

  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const running = !reducedMotion && !userPaused && !hovered && !keyboardFocus && !hidden;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => advanceRef.current(), interval);
    return () => window.clearInterval(id);
  }, [running, interval]);

  const regionProps = {
    onPointerEnter: pauseOnHover ? () => setHovered(true) : undefined,
    onPointerLeave: pauseOnHover ? () => setHovered(false) : undefined,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
    },
  };

  return {
    running,
    /** True when autoplay is off for good (reduced motion), so no pause control is needed. */
    disabled: reducedMotion,
    userPaused,
    togglePaused: () => setUserPaused((paused) => !paused),
    regionProps,
  };
}
