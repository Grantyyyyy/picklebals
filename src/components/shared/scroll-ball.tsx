"use client";

import { ArrowUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Degrees of spin per pixel scrolled: one full turn every ~900px. */
const SPIN_PER_PX = 0.4;
/** Show the back-to-top ball once the visitor is past the first screen. */
const SHOW_AFTER_PX = 640;

/**
 * Spins every `[data-scroll-spin]` element with the page scroll, and shows a
 * small rolling pickleball that returns the visitor to the top.
 * One passive listener, one write per animation frame, nothing with reduced motion.
 */
export function ScrollBall() {
  const [visible, setVisible] = useState(false);
  const ballRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setVisible(y > SHOW_AFTER_PX);
      if (reduced.matches) return;
      const turn = `${(y * SPIN_PER_PX) % 360}deg`;
      if (ballRef.current) ballRef.current.style.rotate = turn;
      document.querySelectorAll<SVGElement | HTMLElement>("[data-scroll-spin]").forEach((el) => {
        el.style.rotate = turn;
      });
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function backToTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={backToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 size-14 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-court/60 focus-visible:ring-offset-2 sm:right-6 sm:bottom-6",
        "transition-[opacity,translate,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-6 scale-75 opacity-0",
      )}
    >
      <svg
        viewBox="0 0 56 56"
        className="size-full drop-shadow-[0_6px_10px_oklch(0.18_0.018_165/0.28)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="scroll-ball-shade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="55%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <circle cx="28" cy="28" r="26" className="fill-ball" />
        <g ref={ballRef} className="origin-center fill-court-deep/30 [transform-box:view-box]">
          <circle cx="28" cy="10.5" r="2.4" />
          <circle cx="43.2" cy="19.3" r="2.4" />
          <circle cx="43.2" cy="36.8" r="2.4" />
          <circle cx="28" cy="45.5" r="2.4" />
          <circle cx="12.8" cy="36.8" r="2.4" />
          <circle cx="12.8" cy="19.3" r="2.4" />
          <circle cx="28" cy="28" r="2.6" />
          <circle cx="20" cy="24" r="1.7" />
          <circle cx="36" cy="32" r="1.7" />
        </g>
        <circle cx="28" cy="28" r="26" fill="url(#scroll-ball-shade)" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex size-7 items-center justify-center rounded-full bg-court-deep text-ball">
          <ArrowUpIcon className="size-4" />
        </span>
      </span>
    </button>
  );
}
