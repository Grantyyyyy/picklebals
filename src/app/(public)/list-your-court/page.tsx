import { CheckCircle2Icon } from "lucide-react";

import { CourtListingForm } from "@/components/forms/court-listing-form";
import { PageHeader } from "@/components/shared/page-header";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "List your pickleball court for free",
  description:
    "Own or manage a pickleball court in the Philippines? Add your venue to the directory and get discovered by local players.",
  path: "/list-your-court",
});

const benefits = [
  "Free listing in the court directory",
  "Appear in city pages and search",
  "Reach players looking for open play",
  "We review every listing before publishing",
];

export default function ListYourCourtPage() {
  return (
    <>
      <PageHeader
        eyebrow="For venues"
        title="List your court"
        description="Tell us about your venue. Our team reviews submissions before they go live."
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Court listing form" className="rounded-3xl border bg-card p-6 sm:p-10">
          <CourtListingForm />
        </section>
        <aside>
          <h2 className="font-heading text-lg font-semibold text-court-deep">Why list with us?</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <CheckCircle2Icon
                  className="mt-0.5 size-4 shrink-0 text-court"
                  aria-hidden="true"
                />
                {benefit}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
