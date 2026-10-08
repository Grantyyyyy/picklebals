"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

// Adapted from React Bits SplitText (https://reactbits.dev/text-animations/split-text).
// Plays once on mount instead of on scroll, keeps a plain-text copy for screen
// readers, does nothing under reduced motion, and hides the word with the
// `split-pending` utility until it is split so it never flashes whole.

gsap.registerPlugin(GSAPSplitText, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  /** Milliseconds between characters. */
  delay?: number;
  /** Seconds per character. */
  duration?: number;
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
}

export function SplitText({
  text,
  className,
  delay = 45,
  duration = 0.9,
  ease = "expo.out",
  from = { opacity: 0, yPercent: 45 },
  to = { opacity: 1, yPercent: 0 },
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontsReady, setFontsReady] = useState(false);

  // Split only after the display face loads, so characters measure correctly.
  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => active && setFontsReady(true));
    return () => {
      active = false;
    };
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !fontsReady) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = new GSAPSplitText(el, { type: "chars", tag: "span", aria: "none" });
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(split.chars, from, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => split.revert(),
      });

      return () => split.revert();
    },
    { dependencies: [fontsReady, text], scope: ref },
  );

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true" className="split-pending block">
        {text}
      </span>
    </span>
  );
}
