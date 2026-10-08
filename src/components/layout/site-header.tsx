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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <Suspense fallback={<NavLinks items={mainNav} pathname={null} />}>
            <ActiveNavLinks items={mainNav} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden h-10 rounded-full px-5 sm:inline-flex">
            <Link href="/list-your-court">List your court</Link>
          </Button>
          <MobileNav items={mainNav} />
        </div>
      </div>
    </header>
  );
}
