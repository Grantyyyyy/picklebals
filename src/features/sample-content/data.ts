import { localImage, localVenueImage } from "@/features/shared/local-images";
import type { Article, City, CityRef, Club, Court, PickleballEvent } from "@/types/content";

/**
 * LOCAL CONTENT — rendered only when Supabase is not configured, and shown as regular listings
 * (`isSample: false`, no Sample badges) by product decision.
 *
 * Courts are real Iligan venues taken from public Courtogo listings,
 * accessed 2026-10-08, used as test data. Hours, rates and amenities are as listed then and may
 * have changed; each court links to its listing. Clubs and events are placeholders written
 * for this project (not real organizations) and are deliberately not tied to any real venue;
 * replace them with real clubs and events before launch.
 */

const UPDATED_AT = "2026-10-08T00:00:00.000Z";

const iligan: CityRef = { name: "Iligan", slug: "iligan", province: "Lanao del Norte" };

type VenueFacts = Pick<
  Court,
  | "slug"
  | "name"
  | "summary"
  | "address"
  | "environment"
  | "surface"
  | "courtCount"
  | "amenities"
  | "openingHours"
  | "priceInfo"
  | "websiteUrl"
> & { isFeatured?: boolean };

function venueCourt(facts: VenueFacts, index: number): Court {
  return {
    id: `sample-court-${index + 1}`,
    description: facts.summary,
    city: iligan,
    latitude: null,
    longitude: null,
    contactPhone: null,
    contactEmail: null,
    facebookUrl: null,
    imageUrl: localVenueImage(facts.slug),
    updatedAt: UPDATED_AT,
    isSample: false,
    ...facts,
    isFeatured: facts.isFeatured ?? false,
  };
}

const COURTOGO = "https://courtogo.com/venues";

const sampleCourts: Court[] = (
  [
    {
      slug: "pal-pickleball-homecourt",
      name: "PAL Pickleball Homecourt",
      summary: "One covered and one half-shaded court on a silica-sand surface in Tubod.",
      address: "F.G. Reuyan Street, Baraas Laville Subdivision, Tubod, Iligan City",
      environment: "covered",
      surface: "Silica-sand textured",
      courtCount: 2,
      amenities: ["Paddle rental", "Balls for sale", "Instant booking"],
      openingHours: "Daily, 7:00 AM – 11:00 PM",
      priceInfo: "From ₱200/hr",
      websiteUrl: `${COURTOGO}/pal-pickleball-homecourt`,
      isFeatured: true,
    },
    {
      slug: "meadow-rally",
      name: "Meadow Rally",
      summary: "Two outdoor courts in Franklin Hills, open from early morning until late.",
      address: "Cor. Beltran–Franklin Hills St., Iligan City",
      environment: "outdoor",
      surface: null,
      courtCount: 2,
      amenities: [],
      openingHours: "Daily, 5:00 AM – 2:00 AM",
      priceInfo: "From ₱200/hr",
      websiteUrl: `${COURTOGO}/meadow-rally`,
      isFeatured: true,
    },
    {
      slug: "kingple-dink-yard",
      name: "Kingple Dink Yard",
      summary: "A single open court in Suarez with food stalls and its own comfort room.",
      address: "Zone Meteor, Ishaii, Suarez, Iligan City",
      environment: "outdoor",
      surface: null,
      courtCount: 1,
      amenities: ["Comfort room", "Food stalls", "Water vending", "Seating"],
      openingHours: "Daily, 6:00 AM – 12:00 AM",
      priceInfo: "From ₱200/hr",
      websiteUrl: `${COURTOGO}/kingple-dink-yard`,
    },
    {
      slug: "sweat-rally",
      name: "Sweat Rally",
      summary:
        "A private indoor court off Circumferential Road in Ubaldo Laya, with a KTV room on site.",
      address: "Rajah Village, near Circumferential Road 3, Ubaldo Laya, Iligan City",
      environment: "indoor",
      surface: null,
      courtCount: 1,
      amenities: ["KTV room"],
      openingHours: "Open 24 hours",
      priceInfo: "From ₱300/hr",
      websiteUrl: `${COURTOGO}/sweat-rally`,
    },
    {
      slug: "kmpnd",
      name: "KMPND",
      summary: "A private, fully roofed court along Camague Highway.",
      address: "#9 Purok 1, Camague Highway, Iligan City",
      environment: "covered",
      surface: null,
      courtCount: 1,
      amenities: [],
      openingHours: "Daily, 9:00 AM – 12:00 AM",
      priceInfo: "From ₱400/hr",
      websiteUrl: `${COURTOGO}/kmpnd`,
    },
    {
      slug: "la-pickleball-court",
      name: "LA Pickleball Court",
      summary: "Two open courts behind Iprep Play and Learn, with parking and a snack corner.",
      address: "At the back of Iprep Play and Learn, Iligan City",
      environment: "outdoor",
      surface: null,
      courtCount: 2,
      amenities: ["Parking", "Snack corner"],
      openingHours: "Open 24 hours",
      priceInfo: "From ₱300/hr",
      websiteUrl: `${COURTOGO}/la-pickleball-court-mu2a7rm4`,
      isFeatured: true,
    },
    {
      slug: "jm-s-dink-n-drive",
      name: "Jm's Dink N Drive",
      summary: "An outdoor court in Doña Maria Subdivision, listed as coming soon.",
      address: "Phase 1 Doña Maria Subdivision, Purok 14, Iligan City",
      environment: "outdoor",
      surface: null,
      courtCount: 1,
      amenities: [],
      openingHours: "Daily, 6:00 AM – 11:00 PM",
      priceInfo: "₱300/hr",
      websiteUrl: `${COURTOGO}/jms-dink-n-drive`,
    },
    {
      slug: "siradj-pickleball",
      name: "Siradj Pickleball",
      summary:
        "One open court at Siradj Beach Resort on the Linamon highway, just outside the city.",
      address: "Siradj Beach Resort, Linamon National Highway, Lanao del Norte",
      environment: "outdoor",
      surface: null,
      courtCount: 1,
      amenities: ["Beach resort", "Swimming"],
      openingHours: "Open 24 hours",
      priceInfo: "From ₱250/hr",
      websiteUrl: `${COURTOGO}/siradj-pickleball`,
    },
  ] satisfies VenueFacts[]
).map(venueCourt);

const sampleCities: City[] = [
  {
    ...iligan,
    id: "sample-city-1",
    region: "Northern Mindanao",
    description: "The City of Majestic Waterfalls, with a fast-growing open-play community.",
    courtCount: sampleCourts.length,
    isSample: false,
  },
];

const sampleClubs: Club[] = [
  {
    // Real club, from its public Reclub page (accessed 2026-10-08).
    id: "club-match-point",
    slug: "match-point-pickleball-club",
    name: "Match Point Pickleball Club",
    summary:
      "A community club in Iligan running open plays, DUPR events and social games for every level and age.",
    description:
      "A community-driven club based in Iligan City that welcomes players of all skill levels and ages. It runs regular open plays, DUPR-rated events and social games, with weekly sessions on Fridays at 7 PM and on Mondays or Sundays (times vary).",
    city: iligan,
    homeCourt: null,
    skillLevels: ["All levels", "DUPR events"],
    meetingSchedule: "Fridays, 7:00 PM",
    contactEmail: null,
    facebookUrl: null,
    websiteUrl: "https://reclub.co/clubs/@matchpoint-pickl",
    imageUrl: localImage("clubs", "match-point-pickleball-club"),
    isFeatured: true,
    updatedAt: UPDATED_AT,
    isSample: false,
  },
  {
    id: "sample-club-1",
    slug: "majestic-falls-picklers",
    name: "Majestic Falls Picklers",
    summary: "A welcoming community club with weekly open play and beginner clinics.",
    description: "Weekly open play and monthly beginner clinics for new players.",
    city: iligan,
    homeCourt: null,
    skillLevels: ["Beginner", "Intermediate"],
    meetingSchedule: "Tuesdays & Thursdays, 6:00 PM",
    contactEmail: null,
    facebookUrl: null,
    websiteUrl: null,
    imageUrl: localImage("clubs", "majestic-falls-picklers"),
    isFeatured: true,
    updatedAt: UPDATED_AT,
    isSample: false,
  },
  {
    id: "sample-club-2",
    slug: "iligan-third-shot-society",
    name: "Iligan Third Shot Society",
    summary: "Competitive drills and ladder play for intermediate and advanced players.",
    description: "Structured drilling followed by ladder play every week.",
    city: iligan,
    homeCourt: null,
    skillLevels: ["Intermediate", "Advanced"],
    meetingSchedule: "Mondays & Wednesdays, 7:00 PM",
    contactEmail: null,
    facebookUrl: null,
    websiteUrl: null,
    imageUrl: localImage("clubs", "iligan-third-shot-society"),
    isFeatured: true,
    updatedAt: UPDATED_AT,
    isSample: false,
  },
  {
    id: "sample-club-3",
    slug: "lanao-kitchen-club",
    name: "Lanao Kitchen Club",
    summary: "Weekend social games and family-friendly sessions for every level.",
    description: "A social-first club focused on fun games and introducing new players.",
    city: iligan,
    homeCourt: null,
    skillLevels: ["All levels"],
    meetingSchedule: "Saturdays, 7:00 AM",
    contactEmail: null,
    facebookUrl: null,
    websiteUrl: null,
    imageUrl: localImage("clubs", "lanao-kitchen-club"),
    isFeatured: true,
    updatedAt: UPDATED_AT,
    isSample: false,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Local events are generated relative to `now` so they always appear upcoming.
 * They are placeholders and name no venue.
 */
export function buildSampleEvents(now: Date): PickleballEvent[] {
  const at = (days: number, hourUtc: number) => {
    const date = new Date(now.getTime() + days * DAY_MS);
    date.setUTCHours(hourUtc, 0, 0, 0);
    return date.toISOString();
  };

  const base = {
    venueName: null,
    city: iligan,
    court: null,
    registrationUrl: null,
    updatedAt: UPDATED_AT,
    isSample: false,
  } as const;

  const events: PickleballEvent[] = [
    {
      ...base,
      id: "sample-event-1",
      slug: "iligan-weekend-open-play",
      imageUrl: localImage("events", "iligan-weekend-open-play"),
      title: "Iligan Weekend Open Play",
      summary: "Rotating doubles for all levels. Bring a paddle — or borrow one.",
      description: "Casual rotating doubles with a paddle-stack queue. All levels welcome.",
      eventType: "open_play",
      startsAt: at(3, 23),
      endsAt: at(4, 3),
      club: { name: "Majestic Falls Picklers", slug: "majestic-falls-picklers" },
      feeInfo: "₱150",
      isFeatured: true,
    },
    {
      ...base,
      id: "sample-event-2",
      slug: "beginner-clinic-iligan",
      imageUrl: localImage("events", "beginner-clinic-iligan"),
      title: "Beginner Clinic: Dinks & Drops",
      summary: "A two-hour clinic covering the kitchen, dinks and the third-shot drop.",
      description: "Coached drills for new players with small groups and plenty of reps.",
      eventType: "clinic",
      startsAt: at(8, 10),
      endsAt: at(8, 12),
      club: { name: "Iligan Third Shot Society", slug: "iligan-third-shot-society" },
      feeInfo: "₱300",
      isFeatured: true,
    },
    {
      ...base,
      id: "sample-event-3",
      slug: "iligan-doubles-classic",
      imageUrl: localImage("events", "iligan-doubles-classic"),
      title: "Iligan Doubles Classic",
      summary: "A city doubles tournament with novice, intermediate and open brackets.",
      description: "Men's, women's and mixed doubles brackets across three skill divisions.",
      eventType: "tournament",
      startsAt: at(21, 0),
      endsAt: at(22, 9),
      club: null,
      feeInfo: "₱800 per team",
      isFeatured: true,
    },
    {
      ...base,
      id: "sample-event-4",
      slug: "friday-night-social-mixer",
      imageUrl: localImage("events", "friday-night-social-mixer"),
      title: "Friday Night Social Mixer",
      summary: "Mixed partners every game, snacks after. Great for meeting new players.",
      description: "Partners rotate each game. Light snacks afterwards.",
      eventType: "social",
      startsAt: at(12, 23),
      endsAt: at(13, 3),
      club: { name: "Lanao Kitchen Club", slug: "lanao-kitchen-club" },
      feeInfo: null,
      isFeatured: false,
    },
  ];
  return events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// Article covers are free-license Unsplash photos (Brendan Sapp, Laura Tang, Lesli Whitecotton).
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const sampleArticles: Article[] = [
  {
    id: "sample-article-1",
    slug: "what-is-pickleball",
    title: "What is pickleball? A quick guide for first-timers",
    excerpt: "The fastest-growing paddle sport explained in five minutes — court, rules and gear.",
    body: [
      "Pickleball combines elements of tennis, badminton and table tennis. It is played with solid paddles and a perforated plastic ball on a court roughly a third the size of a tennis court.",
      "## The court",
      "A pickleball court measures 20 by 44 feet. The seven-foot zone on each side of the net is the non-volley zone, better known as the kitchen.",
      "## Basic rules",
      "- Serves are underhand and diagonal.\n- The ball must bounce once on each side before volleys are allowed.\n- You cannot volley while standing in the kitchen.",
      "## What you need",
      "A paddle, a few outdoor or indoor balls, and comfortable court shoes. Many venues rent paddles for beginners.",
    ].join("\n\n"),
    category: "Basics",
    authorName: "Pickleball Hub (sample)",
    readingMinutes: 5,
    imageUrl: unsplash("1659318006095-4d44845f3a1b"),
    seoTitle: null,
    seoDescription: null,
    publishedAt: "2026-09-15T00:00:00.000Z",
    updatedAt: UPDATED_AT,
    isSample: false,
  },
  {
    id: "sample-article-2",
    slug: "pickleball-scoring-explained",
    title: "Pickleball scoring explained (without the headache)",
    excerpt: "Why players call out three numbers, and how side-outs work in doubles.",
    body: [
      "Traditional doubles scoring uses three numbers: the serving team's score, the receiving team's score, and the server number (1 or 2).",
      "## Only the serving team scores",
      "Points are won only on your own serve. When the serving team loses a rally, the serve passes to the partner or, after both partners have served, to the other team.",
      "## Games to 11",
      "Most recreational games are played to 11, win by 2. Tournaments may play to 15 or 21.",
    ].join("\n\n"),
    category: "Rules",
    authorName: "Pickleball Hub (sample)",
    readingMinutes: 4,
    imageUrl: unsplash("1711996151738-657bd95b7cdb"),
    seoTitle: null,
    seoDescription: null,
    publishedAt: "2026-09-22T00:00:00.000Z",
    updatedAt: UPDATED_AT,
    isSample: false,
  },
  {
    id: "sample-article-3",
    slug: "open-play-etiquette",
    title: "Open play etiquette: how to join a game at a new court",
    excerpt: "Paddle stacks, rotations and the unwritten rules that keep open play fun.",
    body: [
      "Open play is the heart of pickleball culture. Here is how to slot in smoothly at a court you have never visited.",
      "## Look for the paddle stack",
      "Many courts queue players by placing paddles in a rack or line. Add yours to the end and wait for the next four to be called.",
      "## Mix it up",
      "Rotate partners, play with all levels, and keep games moving so everyone gets court time.",
    ].join("\n\n"),
    category: "Community",
    authorName: "Pickleball Hub (sample)",
    readingMinutes: 3,
    imageUrl: unsplash("1665855031742-a87f5964adf1"),
    seoTitle: null,
    seoDescription: null,
    publishedAt: "2026-09-29T00:00:00.000Z",
    updatedAt: UPDATED_AT,
    isSample: false,
  },
];

export const sampleContent = {
  cities: sampleCities,
  courts: sampleCourts,
  clubs: sampleClubs,
  articles: sampleArticles,
};
