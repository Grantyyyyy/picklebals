import { Hero } from "@/components/home/hero";
import {
  ClubSpotlight,
  ExploreByLocation,
  FeaturedCourts,
  FindCourtCta,
  HomeStats,
  UpcomingEvents,
} from "@/components/home/sections";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: absoluteUrl("/"),
            logo: absoluteUrl("/icon.svg"),
            areaServed: { "@type": "Country", name: siteConfig.country },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: absoluteUrl("/"),
            inLanguage: "en-PH",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${absoluteUrl("/courts")}?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
      <Hero />
      <HomeStats />
      <FeaturedCourts />
      <ClubSpotlight />
      <ExploreByLocation />
      <UpcomingEvents />
      <FindCourtCta />
    </>
  );
}
