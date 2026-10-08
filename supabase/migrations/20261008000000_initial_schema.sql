-- =============================================================================
-- Pickleball Hub — initial schema (Phase 1: public directory + admin foundation)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.court_environment as enum ('indoor', 'outdoor', 'covered');
create type public.event_type as enum ('tournament', 'open_play', 'clinic', 'league', 'social');
create type public.submission_type as enum ('court_listing', 'contact');
create type public.submission_status as enum ('pending', 'reviewed', 'approved', 'rejected', 'spam');

-- -----------------------------------------------------------------------------
-- Shared trigger functions
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Stamps published_at the first time a record is published.
create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Administrators
-- Membership is managed manually (SQL editor / service role), never from the app.
-- -----------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Cities
-- -----------------------------------------------------------------------------
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  province text not null,
  region text not null,
  description text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  cover_image_path text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cities_status_idx on public.cities (status, sort_order);

-- -----------------------------------------------------------------------------
-- Courts
-- -----------------------------------------------------------------------------
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text,
  description text,
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  environment public.court_environment not null default 'outdoor',
  surface text,
  court_count smallint check (court_count > 0),
  amenities text[] not null default '{}',
  opening_hours text,
  price_info text,
  contact_phone text,
  contact_email text,
  website_url text,
  facebook_url text,
  cover_image_path text,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courts_city_id_idx on public.courts (city_id);
create index courts_status_idx on public.courts (status, published_at desc);
create index courts_featured_idx on public.courts (is_featured) where status = 'published';

-- -----------------------------------------------------------------------------
-- Clubs
-- -----------------------------------------------------------------------------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities (id) on delete set null,
  home_court_id uuid references public.courts (id) on delete set null,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text,
  description text,
  skill_levels text[] not null default '{}',
  meeting_schedule text,
  contact_email text,
  facebook_url text,
  website_url text,
  logo_path text,
  cover_image_path text,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clubs_city_id_idx on public.clubs (city_id);
create index clubs_home_court_id_idx on public.clubs (home_court_id);
create index clubs_status_idx on public.clubs (status, published_at desc);

-- -----------------------------------------------------------------------------
-- Events
-- -----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities (id) on delete set null,
  court_id uuid references public.courts (id) on delete set null,
  club_id uuid references public.clubs (id) on delete set null,
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text,
  description text,
  event_type public.event_type not null default 'open_play',
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  registration_url text,
  fee_info text,
  cover_image_path text,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_check check (ends_at is null or ends_at >= starts_at)
);

create index events_starts_at_idx on public.events (starts_at) where status = 'published';
create index events_city_id_idx on public.events (city_id);
create index events_court_id_idx on public.events (court_id);
create index events_club_id_idx on public.events (club_id);

-- -----------------------------------------------------------------------------
-- Articles (Learn)
-- -----------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  body text not null default '',
  category text not null default 'basics',
  author_name text,
  reading_minutes smallint check (reading_minutes > 0),
  cover_image_path text,
  seo_title text,
  seo_description text,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status, published_at desc);
create index articles_category_idx on public.articles (category);

-- -----------------------------------------------------------------------------
-- Submissions (public court listings + contact messages)
-- Written only by the server endpoint using the secret key; no public insert policy.
-- -----------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  type public.submission_type not null,
  status public.submission_status not null default 'pending',
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 40),
  payload jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_status_idx on public.submissions (status, created_at desc);
create index submissions_rate_limit_idx on public.submissions (ip_hash, created_at desc);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['cities', 'courts', 'clubs', 'events', 'articles', 'submissions'] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;

  foreach t in array array['cities', 'courts', 'clubs', 'events', 'articles'] loop
    execute format(
      'create trigger %I before insert or update of status on public.%I for each row execute function public.set_published_at()',
      t || '_set_published_at', t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.cities enable row level security;
alter table public.courts enable row level security;
alter table public.clubs enable row level security;
alter table public.events enable row level security;
alter table public.articles enable row level security;
alter table public.submissions enable row level security;

-- Admins: a signed-in user may see only their own membership row.
create policy "Users can read their own admin membership"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Content tables: public reads published rows; admins manage everything.
do $$
declare
  t text;
begin
  foreach t in array array['cities', 'courts', 'clubs', 'events', 'articles'] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (status = ''published'')',
      'Public can read published ' || t, t
    );
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select public.is_admin()))',
      'Admins can read all ' || t, t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))',
      'Admins can insert ' || t, t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      'Admins can update ' || t, t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))',
      'Admins can delete ' || t, t
    );
  end loop;
end;
$$;

-- Submissions: admins only. Public inserts go through the server endpoint.
create policy "Admins can read submissions"
  on public.submissions for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update submissions"
  on public.submissions for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete submissions"
  on public.submissions for delete
  to authenticated
  using ((select public.is_admin()));

-- Defense in depth: anonymous role has no write privileges at all.
revoke insert, update, delete on all tables in schema public from anon;
revoke all on public.submissions from anon;
revoke all on public.admins from anon;

-- -----------------------------------------------------------------------------
-- Storage: public "media" bucket for court/club/event/article images
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "Public can read media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
