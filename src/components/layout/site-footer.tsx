import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-court-deep text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm space-y-4">
          <Logo inverted />
          <p className="text-sm leading-relaxed text-white/70">{siteConfig.description}</p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-heading text-sm font-semibold tracking-wide text-ball uppercase">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.name} · Made for the pickleball community in the {siteConfig.country}.
          </p>
          <p>Starting in {siteConfig.initialRegion}.</p>
        </div>
      </div>
    </footer>
  );
}
