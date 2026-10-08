"use client";

import { useInView, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

// Adapted from React Bits CountUp (https://reactbits.dev/text-animations/count-up).
// Unlike the original, the final number is server-rendered, so the count is
// readable without JavaScript, with reduced motion, and when already on screen.

interface CountUpProps {
  to: number;
  from?: number;
  /** Seconds before the count starts once the number scrolls into view. */
  delay?: number;
  /** Roughly how long the count takes, in seconds. */
  duration?: number;
  /** Minimum digits, zero-padded (2 renders 7 as "07"). */
  pad?: number;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 2,
  pad = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useRef(false);
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  });
  const isInView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  const format = useCallback(
    (value: number) => String(Math.round(value)).padStart(pad, "0"),
    [pad],
  );

  // Rewind to `from` only when the count will visibly play: motion is allowed
  // and the number is still below the fold.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.textContent = format(from);
    armed.current = true;
    const unsubscribe = springValue.on("change", (latest) => {
      el.textContent = format(latest);
    });
    return () => {
      armed.current = false;
      unsubscribe();
      el.textContent = format(to);
    };
  }, [from, to, format, springValue]);

  useEffect(() => {
    if (!isInView || !armed.current) return;
    const timeoutId = setTimeout(() => motionValue.set(to), delay * 1000);
    return () => clearTimeout(timeoutId);
  }, [isInView, motionValue, to, delay]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
