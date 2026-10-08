-- =============================================================================
-- Pickleball Hub — tournament platform schema (Iligan City MVP)
--
-- Adds venues (physical places) and venue courts (playable courts), multi-organization
-- tenancy, tournaments, divisions, entries, matches and score auditing.
--
-- Legacy tables from the initial schema (`courts`, `events`) are left untouched; the public
-- homepage still reads them. They will be retired in a later migration once the homepage moves
-- to venues and tournaments.
--
-- Write model:
--   * Platform admins (public.is_admin()) curate venues and venue courts.
--   * Organization owners/organizers manage tournaments, divisions, teams and registrations.
--   * Matches, games, court assignments and audit logs are written ONLY through
--     security-definer functions (added with the competition engine), never directly.
--   * The anonymous role reads published, non-test data only, with column-level grants
--     keeping personal contact details private.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.verification_status as enum ('unverified', 'verified', 'rejected');
create type public.org_role as enum ('owner', 'organizer', 'scorekeeper');
create type public.tournament_phase as enum (
  'setup', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled'
);
create type public.division_category as enum (
  'mens_singles', 'womens_singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles', 'open', 'custom'
);
create type public.bracket_format as enum ('round_robin', 'single_elimination');
create type public.division_status as enum ('setup', 'bracket_generated', 'in_progress', 'completed');
create type public.registration_status as enum ('pending', 'approved', 'waitlisted', 'rejected', 'withdrawn');
create type public.registration_source as enum ('public', 'organizer');
create type public.match_status as enum ('pending', 'scheduled', 'in_progress', 'completed', 'bye', 'cancelled');
create type public.match_slot as enum ('a', 'b');
create type public.score_audit_action as enum (
  'bracket_generated', 'bracket_reset', 'court_assigned', 'score_submitted', 'score_corrected',
  'result_confirmed', 'winner_advanced'
);

-- -----------------------------------------------------------------------------
-- Venues: the physical place. Playable courts live in venue_courts.
-- -----------------------------------------------------------------------------
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  address text,
  barangay text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  description text,
  contact_phone text,
  contact_email text,
  website_url text,
  facebook_url text,
  cover_image_path text,
  verification_status public.verification_status not null default 'unverified',
  verified_at timestamptz,
  verified_by uuid references auth.users (id) on delete set null,
  -- Provenance for imported records. source_key is a stable hash used for idempotent imports.
  source_dataset text,
  source_key text unique,
  source_references jsonb not null default '[]'::jsonb
    check (jsonb_typeof(source_references) = 'array'),
  data_notes text,
  is_test_data boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_coordinates_pair check ((latitude is null) = (longitude is null)),
  constraint venues_verified_at check (verification_status <> 'verified' or verified_at is not null)
);

create index venues_city_id_idx on public.venues (city_id);
create index venues_status_idx on public.venues (status, name);
create index venues_barangay_idx on public.venues (barangay) where barangay is not null;

create table public.venue_courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  environment public.court_environment,
  surface text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, label)
);

-- -----------------------------------------------------------------------------
-- Organizations (tenants) and membership
-- -----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  contact_email text,
  website_url text,
  facebook_url text,
  logo_path text,
  is_test_data boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members (user_id);

-- -----------------------------------------------------------------------------
-- Tournaments
-- -----------------------------------------------------------------------------
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  city_id uuid not null references public.cities (id) on delete restrict,
  venue_id uuid references public.venues (id) on delete set null,
  name text not null check (char_length(name) between 3 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Asia/Manila',
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  registration_instructions text,
  max_entries integer check (max_entries > 0),
  phase public.tournament_phase not null default 'setup',
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  is_test_data boolean not null default false,
  cover_image_path text,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournaments_dates check (ends_at is null or ends_at >= starts_at),
  constraint tournaments_registration_window check (
    registration_opens_at is null or registration_closes_at is null
    or registration_closes_at >= registration_opens_at
  ),
  -- Demo/test tournaments can never be publicly published.
  constraint tournaments_test_data_unpublished check (not (is_test_data and status = 'published'))
);

create index tournaments_organization_id_idx on public.tournaments (organization_id);
create index tournaments_public_idx on public.tournaments (status, starts_at);
create index tournaments_venue_id_idx on public.tournaments (venue_id);
create index tournaments_city_id_idx on public.tournaments (city_id);

create table public.tournament_divisions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category public.division_category not null,
  team_size smallint not null check (team_size in (1, 2)),
  skill_label text check (char_length(skill_label) <= 60),
  format public.bracket_format not null default 'round_robin',
  max_entries integer check (max_entries >= 2),
  points_to_win smallint not null default 11 check (points_to_win between 1 and 50),
  win_by smallint not null default 2 check (win_by between 1 and 5),
  best_of smallint not null default 1 check (best_of in (1, 3, 5)),
  status public.division_status not null default 'setup',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, slug),
  unique (id, tournament_id),
  constraint tournament_divisions_team_size check (
    (category in ('mens_singles', 'womens_singles') and team_size = 1)
    or (category in ('mens_doubles', 'womens_doubles', 'mixed_doubles') and team_size = 2)
    or category in ('open', 'custom')
  )
);

-- -----------------------------------------------------------------------------
-- Participants (players, no accounts required), teams and entries
-- -----------------------------------------------------------------------------
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  skill_label text check (char_length(skill_label) <= 60),
  is_test_data boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index participants_organization_id_idx on public.participants (organization_id);

-- A team is one entry in one division: a single player (singles) or a pair (doubles).
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  division_id uuid not null,
  name text not null check (char_length(name) between 1 and 120),
  seed smallint check (seed > 0),
  is_test_data boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (division_id, tournament_id)
    references public.tournament_divisions (id, tournament_id) on delete cascade,
  unique (id, division_id),
  unique (division_id, name),
  unique (division_id, seed)
);

create index teams_tournament_id_idx on public.teams (tournament_id);

create table public.team_members (
  team_id uuid not null,
  division_id uuid not null,
  participant_id uuid not null references public.participants (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (team_id, participant_id),
  foreign key (team_id, division_id) references public.teams (id, division_id) on delete cascade,
  -- A player can enter a division only once.
  unique (division_id, participant_id)
);

create index team_members_participant_id_idx on public.team_members (participant_id);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  division_id uuid not null,
  team_id uuid unique references public.teams (id) on delete set null,
  status public.registration_status not null default 'pending',
  source public.registration_source not null,
  team_name text check (char_length(team_name) <= 120),
  -- Submitted player details: [{ "full_name": "...", "email": "...", "phone": "...", "skill_label": "..." }]
  players jsonb not null default '[]'::jsonb check (jsonb_typeof(players) = 'array'),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  contact_email text check (char_length(contact_email) <= 254),
  contact_phone text check (char_length(contact_phone) <= 40),
  notes text check (char_length(notes) <= 2000),
  ip_hash text,
  is_test_data boolean not null default false,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (division_id, tournament_id)
    references public.tournament_divisions (id, tournament_id) on delete cascade,
  constraint registrations_contact check (contact_email is not null or contact_phone is not null)
);

create index registrations_tournament_status_idx on public.registrations (tournament_id, status);
create index registrations_division_id_idx on public.registrations (division_id);
create index registrations_rate_limit_idx on public.registrations (ip_hash, created_at desc);

-- -----------------------------------------------------------------------------
-- Matches and scoring
-- -----------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  division_id uuid not null,
  round smallint not null check (round > 0),
  position smallint not null check (position > 0),
  team_a_id uuid,
  team_b_id uuid,
  winner_team_id uuid references public.teams (id) on delete restrict,
  status public.match_status not null default 'pending',
  next_match_id uuid references public.matches (id) on delete set null,
  next_match_slot public.match_slot,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (division_id, tournament_id)
    references public.tournament_divisions (id, tournament_id) on delete cascade,
  foreign key (team_a_id, division_id) references public.teams (id, division_id) on delete restrict,
  foreign key (team_b_id, division_id) references public.teams (id, division_id) on delete restrict,
  unique (division_id, round, position),
  unique (id, tournament_id),
  constraint matches_distinct_teams check (team_a_id is null or team_b_id is null or team_a_id <> team_b_id),
  constraint matches_winner_is_participant check (
    winner_team_id is null or winner_team_id = team_a_id or winner_team_id = team_b_id
  ),
  constraint matches_completed_has_winner check (status not in ('completed', 'bye') or winner_team_id is not null),
  constraint matches_next_slot_pair check ((next_match_id is null) = (next_match_slot is null)),
  constraint matches_confirmed_requires_completed check (confirmed_at is null or status in ('completed', 'bye'))
);

create index matches_tournament_id_idx on public.matches (tournament_id);
create index matches_division_status_idx on public.matches (division_id, status);
create index matches_next_match_id_idx on public.matches (next_match_id);

create table public.match_games (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  match_id uuid not null,
  game_number smallint not null check (game_number between 1 and 5),
  team_a_score smallint not null check (team_a_score between 0 and 99),
  team_b_score smallint not null check (team_b_score between 0 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (match_id, tournament_id) references public.matches (id, tournament_id) on delete cascade,
  unique (match_id, game_number)
);

create index match_games_tournament_id_idx on public.match_games (tournament_id);

-- Court assignment history; exactly one current assignment per match.
create table public.match_court_assignments (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  match_id uuid not null,
  venue_court_id uuid references public.venue_courts (id) on delete set null,
  -- Display label; copied from the venue court or entered by the organizer.
  court_label text not null check (char_length(court_label) between 1 and 60),
  scheduled_start_at timestamptz,
  is_current boolean not null default true,
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (match_id, tournament_id) references public.matches (id, tournament_id) on delete cascade
);

create unique index match_court_assignments_current_idx
  on public.match_court_assignments (match_id) where is_current;
create index match_court_assignments_tournament_id_idx on public.match_court_assignments (tournament_id);

-- Append-only audit trail for bracket and score changes.
create table public.score_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  match_id uuid references public.matches (id) on delete cascade,
  action public.score_audit_action not null,
  previous_state jsonb,
  new_state jsonb,
  reason text check (char_length(reason) <= 500),
  performed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint score_audit_logs_correction_reason check (action <> 'score_corrected' or reason is not null)
);

create index score_audit_logs_tournament_idx on public.score_audit_logs (tournament_id, created_at desc);
create index score_audit_logs_match_idx on public.score_audit_logs (match_id);

-- -----------------------------------------------------------------------------
-- Timestamps
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'venues', 'venue_courts', 'organizations', 'organization_members', 'tournaments',
    'tournament_divisions', 'participants', 'teams', 'registrations', 'matches', 'match_games'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;

  foreach t in array array['venues', 'tournaments'] loop
    execute format(
      'create trigger %I before insert or update of status on public.%I for each row execute function public.set_published_at()',
      t || '_set_published_at', t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Authorization helpers (security definer so policies never recurse through RLS)
-- -----------------------------------------------------------------------------
create or replace function public.has_org_role(org_id uuid, roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and m.role = any (roles)
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(org_id, enum_range(null::public.org_role));
$$;

create or replace function public.tournament_org_id(t_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id from public.tournaments where id = t_id;
$$;

create or replace function public.is_public_tournament(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tournaments
    where id = t_id and status = 'published' and not is_test_data
  );
$$;

create or replace function public.can_manage_tournament(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(public.tournament_org_id(t_id), array['owner', 'organizer']::public.org_role[]);
$$;

create or replace function public.can_view_tournament(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_org_member(public.tournament_org_id(t_id));
$$;

create or replace function public.is_public_participant(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.teams t on t.id = tm.team_id
    where tm.participant_id = p_id and public.is_public_tournament(t.tournament_id)
  );
$$;

create or replace function public.org_has_public_tournament(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tournaments
    where organization_id = org_id and status = 'published' and not is_test_data
  );
$$;

revoke all on function public.has_org_role(uuid, public.org_role[]) from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.tournament_org_id(uuid) from public;
revoke all on function public.is_public_tournament(uuid) from public;
revoke all on function public.can_manage_tournament(uuid) from public;
revoke all on function public.can_view_tournament(uuid) from public;
revoke all on function public.is_public_participant(uuid) from public;
revoke all on function public.org_has_public_tournament(uuid) from public;

grant execute on function public.has_org_role(uuid, public.org_role[]) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.tournament_org_id(uuid) to authenticated;
grant execute on function public.can_manage_tournament(uuid) to authenticated;
grant execute on function public.can_view_tournament(uuid) to authenticated;
grant execute on function public.is_public_tournament(uuid) to anon, authenticated;
grant execute on function public.is_public_participant(uuid) to anon, authenticated;
grant execute on function public.org_has_public_tournament(uuid) to anon, authenticated;

-- Creates an organization and makes the caller its owner, atomically.
create or replace function public.create_organization(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_org uuid;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (p_name, p_slug, v_user)
  returning id into v_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org, v_user, 'owner');

  return v_org;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Integrity triggers
-- -----------------------------------------------------------------------------

-- An organization must always keep at least one owner (unless the organization is being deleted).
create or replace function public.ensure_org_keeps_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner' or new.organization_id <> old.organization_id)
     and exists (select 1 from public.organizations where id = old.organization_id)
     and not exists (
       select 1 from public.organization_members
       where organization_id = old.organization_id and role = 'owner' and user_id <> old.user_id
     )
  then
    raise exception 'An organization must keep at least one owner' using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger organization_members_keep_owner
  before update or delete on public.organization_members
  for each row execute function public.ensure_org_keeps_owner();

-- Team members must belong to the tournament's organization, and teams cannot exceed the
-- division's team size.
create or replace function public.validate_team_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_team_size smallint;
begin
  select t.organization_id, d.team_size
    into v_org, v_team_size
  from public.teams tm
  join public.tournament_divisions d on d.id = tm.division_id
  join public.tournaments t on t.id = d.tournament_id
  where tm.id = new.team_id;

  if (select organization_id from public.participants where id = new.participant_id) is distinct from v_org then
    raise exception 'Participant belongs to a different organization' using errcode = '23514';
  end if;

  if (
    select count(*) from public.team_members
    where team_id = new.team_id and participant_id <> new.participant_id
  ) >= v_team_size then
    raise exception 'Team already has the maximum number of players for this division'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger team_members_validate
  before insert or update on public.team_members
  for each row execute function public.validate_team_member();

-- Keep a tournament inside its organization.
create or replace function public.prevent_tournament_org_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.organization_id <> old.organization_id then
    raise exception 'Tournaments cannot be moved between organizations' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger tournaments_keep_org
  before update of organization_id on public.tournaments
  for each row execute function public.prevent_tournament_org_change();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.venues enable row level security;
alter table public.venue_courts enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_divisions enable row level security;
alter table public.participants enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.registrations enable row level security;
alter table public.matches enable row level security;
alter table public.match_games enable row level security;
alter table public.match_court_assignments enable row level security;
alter table public.score_audit_logs enable row level security;

-- Venues: public reads published; platform admins curate.
create policy "Public can read published venues"
  on public.venues for select to anon, authenticated
  using (status = 'published');
create policy "Admins can read all venues"
  on public.venues for select to authenticated
  using ((select public.is_admin()));
create policy "Admins can insert venues"
  on public.venues for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update venues"
  on public.venues for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete venues"
  on public.venues for delete to authenticated
  using ((select public.is_admin()));

create policy "Public can read courts of published venues"
  on public.venue_courts for select to anon, authenticated
  using (exists (select 1 from public.venues v where v.id = venue_id and v.status = 'published'));
create policy "Admins can read all venue courts"
  on public.venue_courts for select to authenticated
  using ((select public.is_admin()));
create policy "Admins can insert venue courts"
  on public.venue_courts for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update venue courts"
  on public.venue_courts for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete venue courts"
  on public.venue_courts for delete to authenticated
  using ((select public.is_admin()));

-- Organizations: members read; owners update/delete; creation via create_organization().
create policy "Public can read organizers of published tournaments"
  on public.organizations for select to anon
  using (public.org_has_public_tournament(id));
create policy "Members can read their organizations"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));
create policy "Owners can update their organizations"
  on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner']::public.org_role[]))
  with check (public.has_org_role(id, array['owner']::public.org_role[]));
create policy "Owners can delete their organizations"
  on public.organizations for delete to authenticated
  using (public.has_org_role(id, array['owner']::public.org_role[]));

create policy "Members can read their organization's members"
  on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id));
create policy "Owners can add members"
  on public.organization_members for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner']::public.org_role[]));
create policy "Owners can change member roles"
  on public.organization_members for update to authenticated
  using (public.has_org_role(organization_id, array['owner']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner']::public.org_role[]));
create policy "Owners can remove members"
  on public.organization_members for delete to authenticated
  using (public.has_org_role(organization_id, array['owner']::public.org_role[]));

-- Tournaments
create policy "Public can read published tournaments"
  on public.tournaments for select to anon, authenticated
  using (status = 'published' and not is_test_data);
create policy "Members can read their tournaments"
  on public.tournaments for select to authenticated
  using (public.is_org_member(organization_id));
create policy "Organizers can create tournaments"
  on public.tournaments for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]));
create policy "Organizers can update tournaments"
  on public.tournaments for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]));
create policy "Owners can delete tournaments"
  on public.tournaments for delete to authenticated
  using (public.has_org_role(organization_id, array['owner']::public.org_role[]));

-- Tournament-scoped tables readable publicly when the tournament is public, by members always.
do $$
declare
  t text;
begin
  foreach t in array array[
    'tournament_divisions', 'teams', 'matches', 'match_games', 'match_court_assignments'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (public.is_public_tournament(tournament_id))',
      t || ': public read (published tournaments)', t
    );
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.can_view_tournament(tournament_id))',
      t || ': members read', t
    );
  end loop;

  -- Organizers write divisions and teams directly. Matches, games and court assignments are
  -- written only through security-definer functions.
  foreach t in array array['tournament_divisions', 'teams'] loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.can_manage_tournament(tournament_id))',
      t || ': organizers insert', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.can_manage_tournament(tournament_id)) with check (public.can_manage_tournament(tournament_id))',
      t || ': organizers update', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.can_manage_tournament(tournament_id))',
      t || ': organizers delete', t
    );
  end loop;
end;
$$;

-- Team members (scoped through the team's tournament)
create policy "Public can read team members of published tournaments"
  on public.team_members for select to anon, authenticated
  using (exists (
    select 1 from public.teams t
    where t.id = team_id and public.is_public_tournament(t.tournament_id)
  ));
create policy "Members can read team members"
  on public.team_members for select to authenticated
  using (exists (
    select 1 from public.teams t where t.id = team_id and public.can_view_tournament(t.tournament_id)
  ));
create policy "Organizers can insert team members"
  on public.team_members for insert to authenticated
  with check (exists (
    select 1 from public.teams t where t.id = team_id and public.can_manage_tournament(t.tournament_id)
  ));
create policy "Organizers can delete team members"
  on public.team_members for delete to authenticated
  using (exists (
    select 1 from public.teams t where t.id = team_id and public.can_manage_tournament(t.tournament_id)
  ));

-- Participants: anon sees only names of players in public tournaments (column grants below).
create policy "Public can read participants of published tournaments"
  on public.participants for select to anon
  using (public.is_public_participant(id));
create policy "Members can read their participants"
  on public.participants for select to authenticated
  using (public.is_org_member(organization_id));
create policy "Organizers can insert participants"
  on public.participants for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]));
create policy "Organizers can update participants"
  on public.participants for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]));
create policy "Organizers can delete participants"
  on public.participants for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'organizer']::public.org_role[]));

-- Registrations: organizers only. Public registrations are inserted by the server endpoint.
create policy "Organizers can read registrations"
  on public.registrations for select to authenticated
  using (public.can_manage_tournament(tournament_id));
create policy "Organizers can insert registrations"
  on public.registrations for insert to authenticated
  with check (public.can_manage_tournament(tournament_id));
create policy "Organizers can update registrations"
  on public.registrations for update to authenticated
  using (public.can_manage_tournament(tournament_id))
  with check (public.can_manage_tournament(tournament_id));
create policy "Organizers can delete registrations"
  on public.registrations for delete to authenticated
  using (public.can_manage_tournament(tournament_id));

-- Audit logs: members read; writes only via functions.
create policy "Members can read score audit logs"
  on public.score_audit_logs for select to authenticated
  using (public.is_org_member(organization_id));

-- -----------------------------------------------------------------------------
-- Privileges (defense in depth on top of RLS)
-- -----------------------------------------------------------------------------
revoke insert, update, delete on all tables in schema public from anon;

-- Competition records are written exclusively through security-definer functions.
revoke insert, update, delete on public.matches, public.match_games,
  public.match_court_assignments, public.score_audit_logs from authenticated;
revoke insert on public.organizations from authenticated;

-- Anonymous visitors never see private columns.
revoke select on public.organizations, public.participants, public.registrations,
  public.organization_members, public.score_audit_logs from anon;
grant select (id, name, slug, description, website_url, facebook_url, logo_path)
  on public.organizations to anon;
grant select (id, full_name, skill_label) on public.participants to anon;
