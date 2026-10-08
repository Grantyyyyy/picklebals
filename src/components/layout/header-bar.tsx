"use client";

import { type ReactNode, useEffect, useState } from "react";

/** Distance scrolled before the bar tightens into its floating state. */
const SCROLL_THRESHOLD = 24;

/**
 * The floating ink capsule. At rest it spans the page container; once the page
 * scrolls it narrows, shortens and picks up a shadow so it reads as floating
 * above the content passing underneath.
 */
export function HeaderBar({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      data-scrolled={scrolled || undefined}
      className="mx-auto flex h-14 max-w-full items-center justify-between gap-4 rounded-full bg-ink/85 pr-1.5 pl-4 text-white ring-1 ring-white/10 backdrop-blur-md transition-[max-width,height,padding,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] data-scrolled:bg-ink/95 data-scrolled:shadow-lg data-scrolled:shadow-ink/25 motion-reduce:transition-none sm:pl-5 lg:h-16 lg:pr-3 lg:data-scrolled:h-14 lg:data-scrolled:max-w-5xl lg:data-scrolled:pr-2"
    >
      {children}
    </div>
  );
}
