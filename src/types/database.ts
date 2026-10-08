/**
 * Database types for the Supabase schema in `supabase/migrations`.
 *
 * Hand-written to match the shape produced by the Supabase CLI. Once a project is linked,
 * regenerate with: `pnpm dlx supabase gen types typescript --linked > src/types/database.ts`
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };
type Publishable = {
  status: Database["public"]["Enums"]["content_status"];
  published_at: string | null;
};

type CityRow = {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_path: string | null;
  sort_order: number;
} & Publishable &
  Timestamps;

type CourtRow = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  environment: Database["public"]["Enums"]["court_environment"];
  surface: string | null;
  court_count: number | null;
  amenities: string[];
  opening_hours: string | null;
  price_info: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  facebook_url: string | null;
  cover_image_path: string | null;
  is_featured: boolean;
} & Publishable &
  Timestamps;

type ClubRow = {
  id: string;
  city_id: string | null;
  home_court_id: string | null;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  skill_levels: string[];
  meeting_schedule: string | null;
  contact_email: string | null;
  facebook_url: string | null;
  website_url: string | null;
  logo_path: string | null;
  cover_image_path: string | null;
  is_featured: boolean;
} & Publishable &
  Timestamps;

type EventRow = {
  id: string;
  city_id: string | null;
  court_id: string | null;
  club_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  event_type: Database["public"]["Enums"]["event_type"];
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  registration_url: string | null;
  fee_info: string | null;
  cover_image_path: string | null;
  is_featured: boolean;
} & Publishable &
  Timestamps;

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: string;
  author_name: string | null;
  reading_minutes: number | null;
  cover_image_path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
} & Publishable &
  Timestamps;

type SubmissionRow = {
  id: string;
  type: Database["public"]["Enums"]["submission_type"];
  status: Database["public"]["Enums"]["submission_status"];
  name: string;
  email: string;
  phone: string | null;
  payload: Json;
  ip_hash: string | null;
  user_agent: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
} & Timestamps;

type AdminRow = { user_id: string; created_at: string };

/** Insert type: columns with database defaults (or nullable) become optional. */
type InsertOf<Row, Required extends keyof Row> = Pick<Row, Required> & Partial<Omit<Row, Required>>;

type Rel<FK extends string, Col extends string, Ref extends string> = {
  foreignKeyName: FK;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13" };
  public: {
    Tables: {
      admins: {
        Row: AdminRow;
        Insert: InsertOf<AdminRow, "user_id">;
        Update: Partial<AdminRow>;
        Relationships: [];
      };
      cities: {
        Row: CityRow;
        Insert: InsertOf<CityRow, "name" | "slug" | "province" | "region">;
        Update: Partial<CityRow>;
        Relationships: [];
      };
      courts: {
        Row: CourtRow;
        Insert: InsertOf<CourtRow, "city_id" | "name" | "slug">;
        Update: Partial<CourtRow>;
        Relationships: [Rel<"courts_city_id_fkey", "city_id", "cities">];
      };
      clubs: {
        Row: ClubRow;
        Insert: InsertOf<ClubRow, "name" | "slug">;
        Update: Partial<ClubRow>;
        Relationships: [
          Rel<"clubs_city_id_fkey", "city_id", "cities">,
          Rel<"clubs_home_court_id_fkey", "home_court_id", "courts">,
        ];
      };
      events: {
        Row: EventRow;
        Insert: InsertOf<EventRow, "title" | "slug" | "starts_at">;
        Update: Partial<EventRow>;
        Relationships: [
          Rel<"events_city_id_fkey", "city_id", "cities">,
          Rel<"events_court_id_fkey", "court_id", "courts">,
          Rel<"events_club_id_fkey", "club_id", "clubs">,
        ];
      };
      articles: {
        Row: ArticleRow;
        Insert: InsertOf<ArticleRow, "title" | "slug">;
        Update: Partial<ArticleRow>;
        Relationships: [];
      };
      submissions: {
        Row: SubmissionRow;
        Insert: InsertOf<SubmissionRow, "type" | "name" | "email">;
        Update: Partial<SubmissionRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      content_status: "draft" | "published" | "archived";
      court_environment: "indoor" | "outdoor" | "covered";
      event_type: "tournament" | "open_play" | "clinic" | "league" | "social";
      submission_type: "court_listing" | "contact";
      submission_status: "pending" | "reviewed" | "approved" | "rejected" | "spam";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
