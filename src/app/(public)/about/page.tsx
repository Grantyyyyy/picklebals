import { CalendarDaysIcon, MapPinnedIcon, UsersRoundIcon } from "lucide-react";

import { ListYourCourtCta } from "@/components/home/sections";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description: `${siteConfig.name} helps players across the Philippines discover pickleball courts, clubs and events, starting in ${siteConfig.initialRegion}.`,
  path: "/about",
});

const pillars = [
  {
    icon: MapPinnedIcon,
    title: "Discover courts",
    description:
      "An accurate, up-to-date directory of places to play: indoor, outdoor and covered.",
  },
  {
    icon: UsersRoundIcon,
    title: "Connect with clubs",
    description: "Find communities that match your level, schedule and vibe.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Never miss a game",
    description: "Open play, clinics, socials and tournaments in one calendar.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Built for the Philippine pickleball community"
        description={`We're starting in ${siteConfig.initialRegion} and growing city by city.`}
      />
      <section aria-labelledby="mission" className="container-page py-16">
        <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-foreground/90">
          <h2 id="mission" className="text-3xl font-bold text-court-deep">
            Our mission
          </h2>
          <p>
            Pickleball is growing fast across the Philippines, but finding a court, a club or a game
            still depends on word of mouth and scattered social media posts. {siteConfig.name}{" "}
            brings it all together in one place.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <li key={title} className="rounded-2xl border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-ball text-court-deep">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-court-deep">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </section>
      <ListYourCourtCta />
    </>
  );
}
