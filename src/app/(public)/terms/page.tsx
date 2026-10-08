import Link from "next/link";

import {
  ContactEmail,
  LegalPage,
  legalLinkClass,
  type LegalSection,
} from "@/components/shared/legal-page";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of use",
  description: `The rules for using ${siteConfig.name}: listings, event registration, the shop and your responsibilities.`,
  path: "/terms",
});

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Using this site",
    body: (
      <p>
        By using {siteConfig.name} you agree to these terms. If you don&rsquo;t agree, please
        don&rsquo;t use the site. The site is free to use and doesn&rsquo;t require an account.
      </p>
    ),
  },
  {
    id: "listings",
    title: "Venue, club and event information",
    body: (
      <>
        <p>
          We list courts, clubs, events and tournaments to help you find a game. Some information
          comes from venues, clubs and organizers, and some from public sources. Hours, rates,
          amenities and schedules change, so please confirm the details with the venue or organizer
          before you go.
        </p>
        <p>
          A listing doesn&rsquo;t mean we own, run or endorse that venue, club or event, and we
          aren&rsquo;t responsible for what happens there.
        </p>
      </>
    ),
  },
  {
    id: "events",
    title: "Event registration",
    body: (
      <p>
        When you register for an event on {siteConfig.name}, your registration goes to the
        organizer, who confirms your spot. Fees, refunds, pairings, schedules and the rules of play
        are set by the organizer, not by us. Registering doesn&rsquo;t guarantee a spot until the
        organizer confirms it.
      </p>
    ),
  },
  {
    id: "scores",
    title: "Live scores and brackets",
    body: (
      <p>
        Scores and brackets are entered by tournament organizers and may lag behind play or contain
        mistakes. The organizer&rsquo;s official results take precedence over anything shown here.
      </p>
    ),
  },
  {
    id: "shop",
    title: "The shop",
    body: (
      <p>
        Items in the shop are sold by clubs and players, not by {siteConfig.name}. We don&rsquo;t
        take payments or handle delivery. You arrange price, payment and pickup directly with the
        seller, and any sale is between you and them.
      </p>
    ),
  },
  {
    id: "submissions",
    title: "What you send us",
    body: (
      <>
        <p>
          When you suggest a venue or send us information, you confirm that it&rsquo;s accurate and
          that you&rsquo;re allowed to share it. You let us use, edit and publish it on{" "}
          {siteConfig.name}. We may decline or remove any submission.
        </p>
        <p>
          How we handle personal information is explained in our{" "}
          <Link href="/privacy" className={legalLinkClass}>
            privacy policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Fair use",
    body: (
      <>
        <p>Please don&rsquo;t:</p>
        <ul>
          <li>send false registrations, spam or misleading listings;</li>
          <li>
            impersonate someone else or submit other people&rsquo;s details without permission;
          </li>
          <li>scrape the site in bulk, overload it or try to break its security.</li>
        </ul>
      </>
    ),
  },
  {
    id: "content",
    title: "Our content",
    body: (
      <p>
        The site&rsquo;s design, text and code belong to {siteConfig.name}. Photos belong to their
        owners and are credited on our{" "}
        <Link href="/credits" className={legalLinkClass}>
          photo credits
        </Link>{" "}
        page. If you think something here uses your work without permission, email <ContactEmail />{" "}
        and we&rsquo;ll review it promptly.
      </p>
    ),
  },
  {
    id: "liability",
    title: "No guarantees",
    body: (
      <p>
        We provide {siteConfig.name} as is. We work to keep it accurate and available but
        can&rsquo;t promise it will always be either. To the extent the law allows, we aren&rsquo;t
        liable for losses that come from using the site or relying on its information. Pickleball is
        a physical sport: play within your limits.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: <p>These terms are governed by the laws of the Republic of the Philippines.</p>,
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms; the date at the top shows the latest version. Questions? Email{" "}
        <ContactEmail />.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      description="The ground rules for using the site, registering for events and buying from the shop."
      sections={sections}
      related={{ label: "Privacy policy", href: "/privacy" }}
    />
  );
}
