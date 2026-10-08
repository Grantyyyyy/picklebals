export const siteConfig = {
  name: "Pick n Go",
  shortName: "Pick n Go",
  tagline: "Find your next tournament.",
  description:
    "Discover pickleball tournaments and venues in Iligan City, Lanao del Norte — with brackets, schedules and results in one place.",
  locale: "en_PH",
  country: "Philippines",
  initialRegion: "Iligan City",
  /** The only market served today. The schema supports more cities; the UI does not yet. */
  market: {
    city: "Iligan",
    citySlug: "iligan",
    province: "Lanao del Norte",
    region: "Northern Mindanao",
  },
  timeZone: "Asia/Manila",
  contactEmail: "hello@example.com",
  keywords: [
    "pickleball Philippines",
    "pickleball Iligan",
    "pickleball Iligan City",
    "pickleball tournaments Iligan",
    "pickleball venues Iligan",
    "pickleball Lanao del Norte",
    "pickleball brackets",
  ],
} as const;

export type NavItem = { title: string; href: string };

export const mainNav: NavItem[] = [
  { title: "Venues", href: "/venues" },
  { title: "Clubs", href: "/clubs" },
  { title: "Events", href: "/events" },
  { title: "Shop", href: "/shop" },
  { title: "Learn", href: "/learn" },
  { title: "About", href: "/about" },
  { title: "Who is Jesus?", href: "/who-is-jesus" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Discover",
    items: [
      { title: "Venues", href: "/venues" },
      { title: "Clubs", href: "/clubs" },
      { title: "Events", href: "/events" },
      { title: "Shop", href: "/shop" },
    ],
  },
  {
    title: "Learn",
    items: [
      { title: "Guides & articles", href: "/learn" },
      { title: "About us", href: "/about" },
      { title: "Who is Jesus?", href: "/who-is-jesus" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "For venues",
    items: [{ title: "Suggest a venue", href: "/list-your-court" }],
  },
];
