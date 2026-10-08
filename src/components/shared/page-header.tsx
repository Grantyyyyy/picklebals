import { type ReactNode } from "react";

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
      <div className="absolute inset-0 bg-court-lines" aria-hidden="true" />
      <div
        className="absolute -top-24 -right-24 size-72 rounded-full bg-ball/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative container-page py-14 sm:py-20">
        <div className="max-w-3xl space-y-4">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-wider text-ball uppercase">{eyebrow}</p>
          )}
          <h1 id="page-title" className="text-4xl font-bold sm:text-5xl">
            {title}
          </h1>
          {description && <p className="text-lg text-white/75">{description}</p>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
