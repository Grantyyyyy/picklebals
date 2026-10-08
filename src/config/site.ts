export const siteConfig = {
  name: "Pickleball Hub",
  shortName: "PB Hub",
  tagline: "Find your next game.",
  description:
    "Discover pickleball courts, clubs, and events across the Philippines — starting with Cagayan de Oro and Northern Mindanao.",
  locale: "en_PH",
  country: "Philippines",
  initialRegion: "Northern Mindanao",
  timeZone: "Asia/Manila",
  contactEmail: "hello@example.com",
  keywords: [
    "pickleball Philippines",
    "pickleball courts",
    "pickleball Cagayan de Oro",
    "pickleball Northern Mindanao",
    "pickleball clubs",
    "pickleball tournaments",
    "open play",
  ],
} as const;

export type NavItem = { title: string; href: string };

export const mainNav: NavItem[] = [
  { title: "Courts", href: "/courts" },
  { title: "Clubs", href: "/clubs" },
  { title: "Events", href: "/events" },
  { title: "Learn", href: "/learn" },
  { title: "About", href: "/about" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Discover",
    items: [
      { title: "Courts", href: "/courts" },
      { title: "Clubs", href: "/clubs" },
      { title: "Events", href: "/events" },
    ],
  },
  {
    title: "Learn",
    items: [
      { title: "Guides & articles", href: "/learn" },
      { title: "About us", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "For venues",
    items: [{ title: "List your court", href: "/list-your-court" }],
  },
];
