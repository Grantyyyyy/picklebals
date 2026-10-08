-- Minimal stand-ins for the Supabase platform objects our migrations depend on.
-- Used only by scripts/db-test.sh against a throwaway local Postgres cluster.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

-- Mirrors Supabase: the caller's user id comes from the request JWT `sub` claim.
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant execute on function auth.uid() to anon, authenticated, service_role;

create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text
);

alter table storage.objects enable row level security;

-- Assertion helpers for SQL tests.
create schema tests;
grant usage on schema tests to anon, authenticated, service_role;

create function tests.assert_eq(actual anyelement, expected anyelement, message text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'ASSERTION FAILED: % (expected %, got %)', message, expected, actual;
  end if;
end;
$$;

create function tests.assert_fails(statement text, message text)
returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    return;
  end;
  raise exception 'ASSERTION FAILED: % (statement succeeded: %)', message, statement;
end;
$$;

-- Switch the current transaction to act as a given user (or anonymous when null).
create function tests.act_as(user_id uuid) returns void language plpgsql as $$
begin
  if user_id is null then
    perform set_config('request.jwt.claim.sub', '', true);
    execute 'set local role anon';
  else
    perform set_config('request.jwt.claim.sub', user_id::text, true);
    execute 'set local role authenticated';
  end if;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;
