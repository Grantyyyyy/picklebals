import { type LucideIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";

import { CourtMarkings } from "@/components/shared/court-markings";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
};

/** An empty court, one ball left by the kitchen line: nothing here yet, but you could play. */
export function EmptyState({
  title,
  description,
  icon: Icon = SearchXIcon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-court/30 bg-sand px-6 py-14 text-center">
      <div
        className="relative isolate h-28 w-52 overflow-hidden rounded-xl bg-court"
        aria-hidden="true"
      >
        <div className="absolute inset-0 -z-10 bg-court-grain opacity-60" />
        <CourtMarkings crop="full" />
        <span className="absolute top-[64%] left-[69%] size-3 rounded-full bg-ball shadow-[0_2px_3px_oklch(0.18_0.018_165/0.45)]" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-court-deep text-ball ring-4 ring-court">
            <Icon className="size-5" />
          </span>
        </span>
      </div>
      <h3 className="mt-6 font-heading text-2xl font-extrabold text-court-deep uppercase font-stretch-condensed">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button
          asChild
          className="mt-6 h-10 rounded-full bg-court-deep px-5 hover:bg-court-deep/90"
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
