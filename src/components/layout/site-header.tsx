import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";

import { ActiveNavLinks } from "./active-nav-links";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur-md supports-[backdrop-filter]:bg-ink/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo inverted />
        <nav aria-label="Main" className="hidden md:block">
          <Suspense fallback={<NavLinks items={mainNav} pathname={null} />}>
            <ActiveNavLinks items={mainNav} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden h-11 rounded-full bg-ball px-5 font-semibold text-court-deep hover:bg-ball/85 sm:inline-flex"
          >
            <Link href="/list-your-court">List your court</Link>
          </Button>
          <MobileNav items={mainNav} />
        </div>
      </div>
    </header>
  );
}
