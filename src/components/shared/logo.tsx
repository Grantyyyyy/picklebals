import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-court" />
      <circle cx="16" cy="16" r="8.5" className="fill-ball" />
      <g className="fill-court-deep/70">
        <circle cx="13" cy="13" r="1.3" />
        <circle cx="19" cy="13" r="1.3" />
        <circle cx="16" cy="16" r="1.3" />
        <circle cx="13" cy="19" r="1.3" />
        <circle cx="19" cy="19" r="1.3" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
  onClick,
}: {
  className?: string;
  inverted?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex items-center gap-2.5 rounded-lg outline-offset-4", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark />
      <span
        className={cn(
          "font-heading text-lg font-bold tracking-tight",
          inverted ? "text-white" : "text-court-deep",
        )}
      >
        Pick n <span className={inverted ? "text-ball" : "text-court"}>Go</span>
      </span>
    </Link>
  );
}
