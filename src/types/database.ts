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

type E<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

type VenueRow = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  address: string | null;
  barangay: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  facebook_url: string | null;
  cover_image_path: string | null;
  verification_status: E<"verification_status">;
  verified_at: string | null;
  verified_by: string | null;
  source_dataset: string | null;
  source_key: string | null;
  source_references: Json;
  data_notes: string | null;
  is_test_data: boolean;
} & Publishable &
  Timestamps;

type VenueCourtRow = {
  id: string;
  venue_id: string;
  label: string;
  environment: E<"court_environment"> | null;
  surface: string | null;
  is_active: boolean;
  sort_order: number;
} & Timestamps;

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  website_url: string | null;
  facebook_url: string | null;
  logo_path: string | null;
  is_test_data: boolean;
  created_by: string | null;
} & Timestamps;

type OrganizationMemberRow = {
  organization_id: string;
  user_id: string;
  role: E<"org_role">;
} & Timestamps;

type TournamentRow = {
  id: string;
  organization_id: string;
  city_id: string;
  venue_id: string | null;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  registration_instructions: string | null;
  max_entries: number | null;
  phase: E<"tournament_phase">;
  is_featured: boolean;
  is_test_data: boolean;
  cover_image_path: string | null;
  created_by: string | null;
} & Publishable &
  Timestamps;

type TournamentDivisionRow = {
  id: string;
  tournament_id: string;
  name: string;
  slug: string;
  category: E<"division_category">;
  team_size: number;
  skill_label: string | null;
  format: E<"bracket_format">;
  max_entries: number | null;
  points_to_win: number;
  win_by: number;
  best_of: number;
  status: E<"division_status">;
  sort_order: number;
} & Timestamps;

type ParticipantRow = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  skill_label: string | null;
  is_test_data: boolean;
} & Timestamps;

type TeamRow = {
  id: string;
  tournament_id: string;
  division_id: string;
  name: string;
  seed: number | null;
  is_test_data: boolean;
} & Timestamps;

type TeamMemberRow = {
  team_id: string;
  division_id: string;
  participant_id: string;
  created_at: string;
};

type RegistrationRow = {
  id: string;
  tournament_id: string;
  division_id: string;
  team_id: string | null;
  status: E<"registration_status">;
  source: E<"registration_source">;
  team_name: string | null;
  players: Json;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  ip_hash: string | null;
  is_test_data: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
} & Timestamps;

type MatchRow = {
  id: string;
  tournament_id: string;
  division_id: string;
  round: number;
  position: number;
  team_a_id: string | null;
  team_b_id: string | null;
  winner_team_id: string | null;
  status: E<"match_status">;
  next_match_id: string | null;
  next_match_slot: E<"match_slot"> | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  version: number;
} & Timestamps;

type MatchGameRow = {
  id: string;
  tournament_id: string;
  match_id: string;
  game_number: number;
  team_a_score: number;
  team_b_score: number;
} & Timestamps;

/** One game's score as passed to submit_match_score / correct_match_score, in game order. */
export type MatchGameScore = { team_a: number; team_b: number };

type MatchCourtAssignmentRow = {
  id: string;
  tournament_id: string;
  match_id: string;
  venue_court_id: string | null;
  court_label: string;
  scheduled_start_at: string | null;
  is_current: boolean;
  assigned_by: string | null;
  created_at: string;
};

type ScoreAuditLogRow = {
  id: string;
  organization_id: string;
  tournament_id: string;
  match_id: string | null;
  action: E<"score_audit_action">;
  previous_state: Json | null;
  new_state: Json | null;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
};

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
      venues: {
        Row: VenueRow;
        Insert: InsertOf<VenueRow, "city_id" | "name" | "slug">;
        Update: Partial<VenueRow>;
        Relationships: [Rel<"venues_city_id_fkey", "city_id", "cities">];
      };
      venue_courts: {
        Row: VenueCourtRow;
        Insert: InsertOf<VenueCourtRow, "venue_id" | "label">;
        Update: Partial<VenueCourtRow>;
        Relationships: [Rel<"venue_courts_venue_id_fkey", "venue_id", "venues">];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: InsertOf<OrganizationRow, "name" | "slug">;
        Update: Partial<OrganizationRow>;
        Relationships: [];
      };
      organization_members: {
        Row: OrganizationMemberRow;
        Insert: InsertOf<OrganizationMemberRow, "organization_id" | "user_id" | "role">;
        Update: Partial<OrganizationMemberRow>;
        Relationships: [
          Rel<"organization_members_organization_id_fkey", "organization_id", "organizations">,
        ];
      };
      tournaments: {
        Row: TournamentRow;
        Insert: InsertOf<
          TournamentRow,
          "organization_id" | "city_id" | "name" | "slug" | "starts_at"
        >;
        Update: Partial<TournamentRow>;
        Relationships: [
          Rel<"tournaments_organization_id_fkey", "organization_id", "organizations">,
          Rel<"tournaments_city_id_fkey", "city_id", "cities">,
          Rel<"tournaments_venue_id_fkey", "venue_id", "venues">,
        ];
      };
      tournament_divisions: {
        Row: TournamentDivisionRow;
        Insert: InsertOf<
          TournamentDivisionRow,
          "tournament_id" | "name" | "slug" | "category" | "team_size"
        >;
        Update: Partial<TournamentDivisionRow>;
        Relationships: [
          Rel<"tournament_divisions_tournament_id_fkey", "tournament_id", "tournaments">,
        ];
      };
      participants: {
        Row: ParticipantRow;
        Insert: InsertOf<ParticipantRow, "organization_id" | "full_name">;
        Update: Partial<ParticipantRow>;
        Relationships: [
          Rel<"participants_organization_id_fkey", "organization_id", "organizations">,
        ];
      };
      teams: {
        Row: TeamRow;
        Insert: InsertOf<TeamRow, "tournament_id" | "division_id" | "name">;
        Update: Partial<TeamRow>;
        Relationships: [
          Rel<"teams_division_id_tournament_id_fkey", "division_id", "tournament_divisions">,
        ];
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: InsertOf<TeamMemberRow, "team_id" | "division_id" | "participant_id">;
        Update: Partial<TeamMemberRow>;
        Relationships: [
          Rel<"team_members_team_id_division_id_fkey", "team_id", "teams">,
          Rel<"team_members_participant_id_fkey", "participant_id", "participants">,
        ];
      };
      registrations: {
        Row: RegistrationRow;
        Insert: InsertOf<
          RegistrationRow,
          "tournament_id" | "division_id" | "source" | "contact_name"
        >;
        Update: Partial<RegistrationRow>;
        Relationships: [
          Rel<
            "registrations_division_id_tournament_id_fkey",
            "division_id",
            "tournament_divisions"
          >,
          Rel<"registrations_team_id_fkey", "team_id", "teams">,
        ];
      };
      matches: {
        Row: MatchRow;
        Insert: InsertOf<MatchRow, "tournament_id" | "division_id" | "round" | "position">;
        Update: Partial<MatchRow>;
        Relationships: [
          Rel<"matches_division_id_tournament_id_fkey", "division_id", "tournament_divisions">,
          Rel<"matches_team_a_id_division_id_fkey", "team_a_id", "teams">,
          Rel<"matches_team_b_id_division_id_fkey", "team_b_id", "teams">,
          Rel<"matches_winner_team_id_fkey", "winner_team_id", "teams">,
        ];
      };
      match_games: {
        Row: MatchGameRow;
        Insert: InsertOf<
          MatchGameRow,
          "tournament_id" | "match_id" | "game_number" | "team_a_score" | "team_b_score"
        >;
        Update: Partial<MatchGameRow>;
        Relationships: [Rel<"match_games_match_id_tournament_id_fkey", "match_id", "matches">];
      };
      match_court_assignments: {
        Row: MatchCourtAssignmentRow;
        Insert: InsertOf<MatchCourtAssignmentRow, "tournament_id" | "match_id" | "court_label">;
        Update: Partial<MatchCourtAssignmentRow>;
        Relationships: [
          Rel<"match_court_assignments_match_id_tournament_id_fkey", "match_id", "matches">,
          Rel<"match_court_assignments_venue_court_id_fkey", "venue_court_id", "venue_courts">,
        ];
      };
      score_audit_logs: {
        Row: ScoreAuditLogRow;
        Insert: InsertOf<ScoreAuditLogRow, "organization_id" | "tournament_id" | "action">;
        Update: Partial<ScoreAuditLogRow>;
        Relationships: [Rel<"score_audit_logs_match_id_fkey", "match_id", "matches">];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_public_tournament: { Args: { t_id: string }; Returns: boolean };
      can_manage_tournament: { Args: { t_id: string }; Returns: boolean };
      can_view_tournament: { Args: { t_id: string }; Returns: boolean };
      is_org_member: { Args: { org_id: string }; Returns: boolean };
      create_organization: { Args: { p_name: string; p_slug: string }; Returns: string };
      can_score_tournament: { Args: { t_id: string }; Returns: boolean };
      generate_bracket: { Args: { p_division_id: string }; Returns: number };
      reset_bracket: { Args: { p_division_id: string; p_reason?: string }; Returns: undefined };
      assign_match_court: {
        Args: {
          p_match_id: string;
          p_court_label?: string;
          p_venue_court_id?: string;
          p_scheduled_start_at?: string;
        };
        Returns: string;
      };
      start_match: { Args: { p_match_id: string; p_expected_version: number }; Returns: number };
      submit_match_score: {
        Args: { p_match_id: string; p_games: MatchGameScore[]; p_expected_version: number };
        Returns: number;
      };
      confirm_match_result: {
        Args: { p_match_id: string; p_expected_version: number };
        Returns: number;
      };
      correct_match_score: {
        Args: {
          p_match_id: string;
          p_games: MatchGameScore[];
          p_expected_version: number;
          p_reason: string;
        };
        Returns: number;
      };
    };
    Enums: {
      content_status: "draft" | "published" | "archived";
      court_environment: "indoor" | "outdoor" | "covered";
      event_type: "tournament" | "open_play" | "clinic" | "league" | "social";
      submission_type: "court_listing" | "contact" | "event_registration";
      submission_status: "pending" | "reviewed" | "approved" | "rejected" | "spam";
      verification_status: "unverified" | "verified" | "rejected";
      org_role: "owner" | "organizer" | "scorekeeper";
      tournament_phase:
        | "setup"
        | "registration_open"
        | "registration_closed"
        | "in_progress"
        | "completed"
        | "cancelled";
      division_category:
        | "mens_singles"
        | "womens_singles"
        | "mens_doubles"
        | "womens_doubles"
        | "mixed_doubles"
        | "open"
        | "custom";
      bracket_format: "round_robin" | "single_elimination";
      division_status: "setup" | "bracket_generated" | "in_progress" | "completed";
      registration_status: "pending" | "approved" | "waitlisted" | "rejected" | "withdrawn";
      registration_source: "public" | "organizer";
      match_status: "pending" | "scheduled" | "in_progress" | "completed" | "bye" | "cancelled";
      match_slot: "a" | "b";
      score_audit_action:
        | "bracket_generated"
        | "bracket_reset"
        | "court_assigned"
        | "score_submitted"
        | "score_corrected"
        | "result_confirmed"
        | "winner_advanced";
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
