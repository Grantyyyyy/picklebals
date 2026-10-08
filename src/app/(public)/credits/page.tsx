import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Photo credits",
  description: "Sources and licenses for the photos used on this site.",
  path: "/credits",
});

type Credit = { image: string; title: string; author: string; source: string };

const commonsCredits: (Credit & { license: string; licenseUrl: string })[] = [
  {
    image: "Majestic Falls Picklers",
    title: "Pickleball Players",
    author: "TheVillagesFL",
    source: "https://commons.wikimedia.org/wiki/File:Pickleball_Players.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    image: "Iligan Third Shot Society",
    title: "Pickleball Pros",
    author: "Picklerpeej",
    source: "https://commons.wikimedia.org/wiki/File:Pickleball_Pros.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    image: "Lanao Kitchen Club",
    title: "Sports Court Harmony of the Seas 2025",
    author: "Larry D. Moore",
    source: "https://commons.wikimedia.org/wiki/File:Sports_Court_Harmony_of_the_Seas_2025.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    image: "Iligan Weekend Open Play",
    title: "Outdoor pickleball courts",
    author: "Wikideas1",
    source: "https://commons.wikimedia.org/wiki/File:Outdoor_pickleball_courts.jpg",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    image: "Iligan Doubles Classic",
    title: "Aerial Pickleball Courts",
    author: "TheVillagesFL",
    source: "https://commons.wikimedia.org/wiki/File:Aerial_Pickleball_Courts.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    image: "Beginner Clinic: Dinks & Drops",
    title: "Pickleball balls and paddles",
    author: "E is for Ian",
    source: "https://commons.wikimedia.org/wiki/File:Pickleball_balls_and_paddles.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    image: "Friday Night Social Mixer",
    title: "A pickleball paddle with two pickleballs",
    author: "OvertAnalyzer",
    source: "https://commons.wikimedia.org/wiki/File:A_pickleball_paddle_with_two_pickleballs.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
];

const linkClass = "font-medium text-court underline-offset-4 hover:underline";

export default function CreditsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Credits"
        title="Photo credits"
        description="Where the photos on this site come from."
      />
      <div className="container-page max-w-3xl space-y-12 py-16">
        <section aria-labelledby="commons-heading" className="space-y-4">
          <h2 id="commons-heading" className="text-2xl font-bold text-court-deep">
            Wikimedia Commons
          </h2>
          <ul className="divide-y rounded-2xl border bg-card">
            {commonsCredits.map((credit) => (
              <li key={credit.source} className="space-y-1 p-5 text-sm">
                <p className="font-semibold text-court-deep">{credit.image}</p>
                <p className="text-muted-foreground">
                  <a href={credit.source} className={linkClass} rel="noopener noreferrer">
                    {credit.title}
                  </a>{" "}
                  by {credit.author},{" "}
                  <a
                    href={credit.licenseUrl}
                    className={linkClass}
                    rel="noopener noreferrer license"
                  >
                    {credit.license}
                  </a>
                  .
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="venues-heading" className="space-y-3">
          <h2 id="venues-heading" className="text-2xl font-bold text-court-deep">
            Venues and clubs
          </h2>
          <p className="leading-relaxed text-foreground/90">
            Venue photos come from each venue&rsquo;s listing on{" "}
            <a href="https://courtogo.com" className={linkClass} rel="noopener noreferrer">
              Courtogo
            </a>
            . The Match Point Pickleball Club logo comes from its{" "}
            <a
              href="https://reclub.co/clubs/@matchpoint-pickl"
              className={linkClass}
              rel="noopener noreferrer"
            >
              Reclub page
            </a>
            . If one of these is yours and you&rsquo;d like it changed or removed,{" "}
            <Link href="/contact" className={linkClass}>
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
