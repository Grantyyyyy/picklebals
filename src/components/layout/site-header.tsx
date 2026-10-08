import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";

import { ActiveNavLinks } from "./active-nav-links";
import { HeaderBar } from "./header-bar";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 container-page pt-3">
      <HeaderBar>
        <Logo inverted className="shrink-0" />
        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<NavLinks items={mainNav} pathname={null} />}>
            <ActiveNavLinks items={mainNav} />
          </Suspense>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            className="hidden h-10 rounded-full bg-ball px-5 font-semibold text-court-deep hover:bg-ball/85 focus-visible:ring-ball/60 sm:inline-flex"
          >
            <Link href="/list-your-court">List your court</Link>
          </Button>
          <MobileNav items={mainNav} />
        </div>
      </HeaderBar>
    </header>
  );
}
