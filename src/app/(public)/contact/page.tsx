import { MailIcon, MapPinIcon } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact us",
  description: `Questions, corrections or partnership ideas? Get in touch with the ${siteConfig.name} team.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="Corrections, club or event listings, partnerships: we'd love to hear from you."
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Contact form" className="rounded-3xl border bg-card p-6 sm:p-10">
          <ContactForm />
        </section>
        <aside className="space-y-6 text-sm">
          <div className="flex gap-3">
            <MailIcon className="mt-0.5 size-5 text-court" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-court-deep">Email</h2>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="text-muted-foreground hover:underline"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPinIcon className="mt-0.5 size-5 text-court" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-court-deep">Coverage</h2>
              <p className="text-muted-foreground">
                {siteConfig.initialRegion}, {siteConfig.country}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
