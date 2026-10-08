import type { MetadataRoute } from "next";

import { getArticles } from "@/features/articles/queries";
import { getCities } from "@/features/cities/queries";
import { getClubs } from "@/features/clubs/queries";
import { getCourts } from "@/features/courts/queries";
import { getUpcomingEvents } from "@/features/events/queries";
import { getPublishedTournaments } from "@/features/tournaments/queries";
import { getVenueDirectory } from "@/features/venues/queries";
import { absoluteUrl } from "@/lib/seo";

const staticPaths: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/venues", priority: 0.9 },
  { path: "/courts", priority: 0.6 },
  { path: "/clubs", priority: 0.8 },
  { path: "/events", priority: 0.8 },
  { path: "/shop", priority: 0.6 },
  { path: "/learn", priority: 0.7 },
  { path: "/list-your-court", priority: 0.6 },
  { path: "/about", priority: 0.4 },
  { path: "/credits", priority: 0.1 },
  { path: "/contact", priority: 0.4 },
  { path: "/who-is-jesus", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, courts, clubs, events, articles, venueDirectory, tournaments] = await Promise.all([
    getCities(),
    getCourts(),
    getClubs(),
    getUpcomingEvents(),
    getArticles(),
    getVenueDirectory(),
    getPublishedTournaments(),
  ]);

  // Sample content is fictional and must not be submitted to search engines.
  const live = <T extends { isSample: boolean }>(items: T[]) =>
    items.filter((item) => !item.isSample);

  // Unverified venues are noindex until an operator confirms them.
  const verifiedVenues = venueDirectory.venues.filter(
    (venue) => venue.origin === "database" && venue.verificationStatus === "verified",
  );

  return [
    ...staticPaths.map(({ path, priority }) => ({ url: absoluteUrl(path), priority })),
    ...verifiedVenues.map((venue) => ({
      url: absoluteUrl(`/venues/${venue.slug}`),
      lastModified: venue.updatedAt ?? undefined,
      priority: 0.8,
    })),
    ...live(tournaments).map((tournament) => ({
      url: absoluteUrl(`/tournaments/${tournament.slug}`),
      lastModified: tournament.updatedAt,
      priority: 0.8,
    })),
    ...live(cities).map((city) => ({
      url: absoluteUrl(`/courts/${city.slug}`),
      priority: 0.8,
    })),
    ...live(courts).map((court) => ({
      url: absoluteUrl(`/courts/${court.city.slug}/${court.slug}`),
      lastModified: court.updatedAt,
      priority: 0.7,
    })),
    ...live(clubs).map((club) => ({
      url: absoluteUrl(`/clubs/${club.slug}`),
      lastModified: club.updatedAt,
      priority: 0.6,
    })),
    ...live(events).map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: event.updatedAt,
      priority: 0.6,
    })),
    ...live(articles).map((article) => ({
      url: absoluteUrl(`/learn/${article.slug}`),
      lastModified: article.updatedAt,
      priority: 0.5,
    })),
  ];
}
