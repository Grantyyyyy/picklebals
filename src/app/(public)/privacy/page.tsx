import {
  ContactEmail,
  LegalPage,
  legalLinkClass,
  type LegalSection,
} from "@/components/shared/legal-page";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy policy",
  description: `What ${siteConfig.name} collects when you use the site, why, and the choices you have.`,
  path: "/privacy",
});

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "The short version",
    body: (
      <ul>
        <li>You can browse {siteConfig.name} without an account and without giving us anything.</li>
        <li>
          We only collect what you type into a form, plus a little technical data to stop spam.
        </li>
        <li>We don&rsquo;t sell your data, run ads or use analytics or tracking cookies.</li>
        <li>If you register for an event, the organizer sees your registration.</li>
      </ul>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>We collect information only when you send it to us through a form:</p>
        <ul>
          <li>
            <strong>Contact form:</strong> your name, email, optional mobile number, subject and
            message.
          </li>
          <li>
            <strong>List your court:</strong> your name, email, optional mobile number, your role,
            and the venue details you share (name, city, address, number of courts, notes).
          </li>
          <li>
            <strong>Event registration:</strong> your name, email, optional mobile number, skill
            level, and optionally your partner&rsquo;s name and notes for the organizer.
          </li>
        </ul>
        <p>
          With each form we also store your browser&rsquo;s user agent and a one-way hash of your IP
          address. We never store the IP address itself; the hash only lets us limit how many forms
          one connection can send in an hour.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>To reply to your message.</li>
        <li>To review and publish venue listings you suggest.</li>
        <li>To pass your event registration to the organizer so they can confirm your spot.</li>
        <li>To prevent spam and abuse of our forms.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>
          <strong>Event organizers</strong> receive the registrations for their own events. They use
          them to run the event and contact you about it.
        </p>
        <p>
          <strong>Service providers</strong> store and serve the site for us: our database runs on
          Supabase, and the site is served by our hosting provider. They process data only to
          provide that service.
        </p>
        <p>
          Listings in the shop are sold by clubs and players, not by us. If you contact a seller,
          that conversation happens on the seller&rsquo;s own channel, under their terms.
        </p>
        <p>We don&rsquo;t sell or rent personal information to anyone.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        Public pages set no cookies. The only cookies we use keep our own staff signed in to the
        admin area.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep form submissions only as long as we need them to respond, review a listing or run an
        event, and for a reasonable period afterwards in case of follow-up questions. You can ask us
        to delete yours sooner.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), you can ask to
          access, correct or delete your personal information, object to how we use it, or get a
          copy of it. Email <ContactEmail /> and we&rsquo;ll respond as soon as we can.
        </p>
        <p>
          If you&rsquo;re not satisfied with our answer, you can complain to the{" "}
          <a href="https://privacy.gov.ph" className={legalLinkClass} rel="noopener noreferrer">
            National Privacy Commission
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Submissions are stored in a database that only our staff can read, over encrypted
        connections. No system is perfectly secure, so please don&rsquo;t send sensitive information
        such as ID numbers or payment details through our forms.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        {siteConfig.name} is meant for a general audience. If you&rsquo;re under 18, please ask a
        parent or guardian before sending us your details or registering for an event.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        If we change this policy, we&rsquo;ll update the date at the top of this page. Questions?
        Email <ContactEmail />.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      description="What we collect, why we collect it, and what you can ask us to do with it."
      sections={sections}
      related={{ label: "Terms of use", href: "/terms" }}
    />
  );
}
