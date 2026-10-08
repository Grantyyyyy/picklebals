import Link from "next/link";

import { type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Presentational nav list, shared by the active-aware client nav and its Suspense fallback. */
export function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-court-soft hover:text-court-deep",
                active && "bg-court-soft text-court-deep",
              )}
            >
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
