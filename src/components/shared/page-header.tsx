import { type ReactNode } from "react";

import { CourtMarkings } from "@/components/shared/court-markings";
import { Pickleball } from "@/components/shared/pickleball";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, children, className }: PageHeaderProps) {
  return (
    <section
      className={cn("relative overflow-hidden bg-court-deep text-white", className)}
      aria-labelledby="page-title"
    >
      <div className="absolute inset-0 bg-court-grain opacity-70" aria-hidden="true" />
      <CourtMarkings
        crop="full"
        className="left-auto w-full mask-l-from-40% mask-l-to-95% sm:w-4/5 lg:w-3/5"
      />
      <Pickleball className="absolute -right-10 -bottom-14 hidden size-40 animate-ball-drop sm:block lg:right-[10%] lg:size-48" />
      <div className="relative container-page py-14 sm:py-20">
        <div className="max-w-3xl space-y-4">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-wider text-ball uppercase">{eyebrow}</p>
          )}
          <h1 id="page-title" className="animate-title-in text-4xl font-bold sm:text-5xl">
            {title}
          </h1>
          {description && <p className="text-lg text-white/75">{description}</p>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
