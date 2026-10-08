import Link from "next/link";
import { type ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Effective date shared by the terms and privacy policy; update both when either changes. */
export const LEGAL_UPDATED = "October 8, 2026";

export const legalLinkClass = "font-medium text-court underline underline-offset-4";

export function ContactEmail() {
  return (
    <a href={`mailto:${siteConfig.contactEmail}`} className={legalLinkClass}>
      {siteConfig.contactEmail}
    </a>
  );
}

/** Long-form legal text: a contents list, then sections with anchor ids. */
export function LegalPage({
  title,
  description,
  sections,
  related,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
  related: { label: string; href: string };
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          <ul className="mt-4 hidden space-y-2 text-sm lg:block">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-foreground/75 transition-colors hover:text-court"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[68ch] space-y-10">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-28 space-y-3 leading-relaxed text-foreground/90 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
            >
              <h2 id={`${section.id}-heading`} className="text-2xl font-bold text-court-deep">
                {section.title}
              </h2>
              {section.body}
            </section>
          ))}
          <p className="border-t pt-6 text-sm text-muted-foreground">
            See also our{" "}
            <Link href={related.href} className={legalLinkClass}>
              {related.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
