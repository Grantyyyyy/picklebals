import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { type BreadcrumbItem } from "@/lib/seo";
import { cn } from "@/lib/utils";

type DetailLayoutProps = {
  breadcrumbs: BreadcrumbItem[];
  eyebrow?: ReactNode;
  title: string;
  summary?: string | null;
  imageUrl: string | null;
  imageAlt: string;
  imageLabel?: string;
  /** `contain` for logos, so they are shown whole on an ink panel. */
  imageFit?: "cover" | "contain";
  isSample: boolean;
  aside: ReactNode;
  children: ReactNode;
};

export function DetailLayout({
  breadcrumbs,
  eyebrow,
  title,
  summary,
  imageUrl,
  imageAlt,
  imageLabel,
  imageFit = "cover",
  isSample,
  aside,
  children,
}: DetailLayoutProps) {
  return (
    <article className="container-page py-10 sm:py-14">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mt-6 max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-court">
          {eyebrow}
          {isSample && <SampleBadge />}
        </div>
        <h1 className="text-4xl font-bold text-court-deep sm:text-5xl">{title}</h1>
        {summary && <p className="text-lg text-muted-foreground">{summary}</p>}
      </header>
      <MediaImage
        src={imageUrl}
        alt={imageAlt}
        label={imageLabel}
        sizes="(min-width: 1280px) 1216px, 100vw"
        preload
        fit={imageUrl ? imageFit : "cover"}
        className={cn(
          "mt-8 aspect-[16/9] rounded-3xl sm:aspect-[21/9]",
          imageUrl && imageFit === "contain" && "bg-ink",
        )}
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">{children}</div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{aside}</aside>
      </div>
    </article>
  );
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="text-base font-semibold text-court-deep">{title}</h2>
      <dl className="mt-4 space-y-4 text-sm">{children}</dl>
    </section>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-court" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 break-words text-foreground">{children}</dd>
      </div>
    </div>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-court underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}
