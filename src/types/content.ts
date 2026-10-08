import type { Enums } from "./database";

/**
 * Presentation-facing content models. The data layer maps database rows (or sample content)
 * into these shapes, so components never depend on raw table columns.
 */

export type CourtEnvironment = Enums<"court_environment">;
export type EventType = Enums<"event_type">;
export type VerificationStatus = Enums<"verification_status">;

export type CityRef = { name: string; slug: string; province: string };

export type City = CityRef & {
  id: string;
  region: string;
  description: string | null;
  courtCount: number;
  isSample: boolean;
};

export type Court = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  city: CityRef;
  latitude: number | null;
  longitude: number | null;
  environment: CourtEnvironment;
  surface: string | null;
  courtCount: number | null;
  amenities: string[];
  openingHours: string | null;
  priceInfo: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  updatedAt: string;
  isSample: boolean;
};

export type Club = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  city: CityRef | null;
  homeCourt: { name: string; slug: string; citySlug: string } | null;
  skillLevels: string[];
  meetingSchedule: string | null;
  contactEmail: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  updatedAt: string;
  isSample: boolean;
};

export type PickleballEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  eventType: EventType;
  startsAt: string;
  endsAt: string | null;
  venueName: string | null;
  city: CityRef | null;
  court: { name: string; slug: string; citySlug: string } | null;
  club: { name: string; slug: string } | null;
  registrationUrl: string | null;
  feeInfo: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  updatedAt: string;
  isSample: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: string;
  authorName: string | null;
  readingMinutes: number | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  isSample: boolean;
};

export type VenueSource = {
  label: string;
  url: string | null;
  type: string | null;
  accessedAt: string | null;
  note: string | null;
};

export type VenueCourt = {
  id: string;
  label: string;
  environment: CourtEnvironment | null;
  surface: string | null;
};

export type Venue = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  barangay: string | null;
  city: CityRef;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  imageUrl: string | null;
  verificationStatus: VerificationStatus;
  sources: VenueSource[];
  dataNotes: string | null;
  /** Only courts recorded by an admin; never inferred. */
  courts: VenueCourt[];
  isTestData: boolean;
  /** "seed-file" when read from the local curated JSON because Supabase is not configured. */
  origin: "database" | "seed-file";
  updatedAt: string | null;
};
