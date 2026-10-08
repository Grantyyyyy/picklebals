import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wider text-court uppercase">{eyebrow}</p>
        )}
        <h2 id={id} className="text-3xl font-bold text-court-deep sm:text-4xl">
          {title}
        </h2>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-court hover:text-court-deep"
        >
          {action.label}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
