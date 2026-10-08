"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { type CSSProperties, useEffect, useState } from "react";

import { CourtMarkings } from "@/components/shared/court-markings";
import { Logo } from "@/components/shared/logo";
import { type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav-links";

const exploreLinks: NavItem[] = [
  { title: "Court directory", href: "/courts" },
  { title: "Contact", href: "/contact" },
];

/** Hamburger: two bars, the lower one shorter. */
function MenuGlyph() {
  return (
    <span className="relative block h-3 w-5" aria-hidden="true">
      <span className="absolute top-0 left-0 h-0.5 w-5 rounded-full bg-current" />
      <span className="absolute top-2.5 left-0 h-0.5 w-3.5 rounded-full bg-current" />
    </span>
  );
}

/** Close: the same two bars, which cross into an X as the panel opens. */
function CloseGlyph() {
  return (
    <span className="relative block h-3 w-5" aria-hidden="true">
      <span className="absolute top-[5px] left-0 h-0.5 w-5 rotate-45 menu-bar-a rounded-full bg-current" />
      <span className="absolute top-[5px] left-0 h-0.5 w-5 -rotate-45 menu-bar-b rounded-full bg-current" />
    </span>
  );
}

/**
 * Mobile menu: a rounded ink panel that grows out of its own round close
 * button in the top-right corner, then fills with big staggered links.
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  // The panel is mobile-only; close it if the viewport grows past the breakpoint.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const close = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="flex size-11 items-center justify-center rounded-full text-white transition-colors outline-none hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ball/70 lg:hidden"
        aria-label="Open menu"
      >
        <MenuGlyph />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 menu-scrim bg-ink/45 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-2 z-50 flex menu-panel flex-col overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-2xl shadow-ink/40 outline-none sm:left-auto sm:w-[26rem] lg:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-court-grain opacity-60" />
            <CourtMarkings
              crop="kitchen"
              paint={false}
              className="top-auto h-[60%] menu-lines mask-t-from-30% mask-t-to-100%"
            />
          </div>

          <div className="flex shrink-0 items-start justify-between gap-4 p-3 pl-6">
            <Logo inverted className="mt-2.5" onClick={() => setOpen(false)} />
            <Dialog.Close
              className="flex size-12 items-center justify-center rounded-full bg-white text-ink transition-[background-color,scale] outline-none hover:bg-ball focus-visible:ring-3 focus-visible:ring-ball/70 active:scale-95"
              aria-label="Close menu"
            >
              <CloseGlyph />
            </Dialog.Close>
          </div>

          <MenuLinks items={items} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MenuLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const step = (index: number) => ({ "--i": index }) as CSSProperties;

  return (
    <nav
      aria-label="Mobile"
      className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pt-8 pb-6"
    >
      <ul className="flex flex-col">
        {items.map((item, index) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="menu-item" style={step(index)}>
              <Dialog.Close asChild>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-1 font-heading text-[clamp(2.75rem,13vw,3.75rem)] leading-[0.95] font-extrabold uppercase font-stretch-condensed transition-colors outline-none hover:text-ball focus-visible:text-ball",
                    active ? "text-white" : "text-white/75",
                  )}
                >
                  {item.title}
                  {active && (
                    <span className="size-2.5 shrink-0 rounded-full bg-ball" aria-hidden="true" />
                  )}
                </Link>
              </Dialog.Close>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-10">
        <div className="menu-item" style={step(items.length)}>
          <Dialog.Close asChild>
            <Link
              href="/list-your-court"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ball text-base font-semibold text-court-deep transition-colors outline-none hover:bg-ball/85 focus-visible:ring-3 focus-visible:ring-white/70"
            >
              List your court
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Dialog.Close>
        </div>

        <div
          className="mt-8 menu-item border-t border-white/10 pt-6 text-sm"
          style={step(items.length + 1)}
        >
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {exploreLinks.map((item) => (
              <li key={item.href}>
                <Dialog.Close asChild>
                  <Link
                    href={item.href}
                    className="bg-linear-to-r from-ball to-ball bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/70 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-white focus-visible:bg-[length:100%_1px] focus-visible:text-white focus-visible:outline-none"
                  >
                    {item.title}
                  </Link>
                </Dialog.Close>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
