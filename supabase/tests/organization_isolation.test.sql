-- Organization isolation, role permissions and integrity rules for the tournament schema.
-- Fixtures are created as the superuser (bypasses RLS), then each check runs as a given role.

\set ON_ERROR_STOP 1

begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'scorer-a@example.test'),
  ('00000000-0000-0000-0000-00000000000c', 'owner-b@example.test'),
  ('00000000-0000-0000-0000-00000000000d', 'outsider@example.test');

insert into public.cities (id, name, slug, province, region, status)
values ('10000000-0000-0000-0000-000000000001', 'Test City', 'test-city', 'Test Province', 'Test Region', 'published');

insert into public.organizations (id, name, slug) values
  ('20000000-0000-0000-0000-00000000000a', 'Org A', 'org-a'),
  ('20000000-0000-0000-0000-00000000000b', 'Org B', 'org-b');

insert into public.organization_members (organization_id, user_id, role) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'owner'),
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b', 'scorekeeper'),
  ('20000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000c', 'owner');

insert into public.tournaments (id, organization_id, city_id, name, slug, starts_at, status, is_test_data) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-00000000000a',
   '10000000-0000-0000-0000-000000000001', 'A Published Open', 'a-published-open', now() + interval '7 days', 'published', false),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-00000000000a',
   '10000000-0000-0000-0000-000000000001', 'A Draft Cup', 'a-draft-cup', now() + interval '14 days', 'draft', false),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-00000000000a',
   '10000000-0000-0000-0000-000000000001', 'A Demo Classic', 'a-demo-classic', now() + interval '21 days', 'draft', true);

insert into public.tournament_divisions (id, tournament_id, name, slug, category, team_size) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Mixed Doubles', 'mixed-doubles', 'mixed_doubles', 2),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Open Singles', 'open-singles', 'open', 1);

insert into public.participants (id, organization_id, full_name, email) values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-00000000000a', 'Public Player', 'public@example.test'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-00000000000a', 'Draft Player', 'draft@example.test'),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-00000000000b', 'Org B Player', 'b@example.test');

insert into public.teams (id, tournament_id, division_id, name) values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Public Pair'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Draft Solo');

insert into public.team_members (team_id, division_id, participant_id) values
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002');

insert into public.registrations (tournament_id, division_id, source, contact_name, contact_email) values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'public', 'Applicant', 'applicant@example.test');

-- ---------------------------------------------------------------------------
-- Anonymous visitors
-- ---------------------------------------------------------------------------
savepoint anon_checks;
select tests.act_as(null);
select tests.assert_eq(
  (select count(*)::int from public.tournaments where slug like 'a-%'), 1,
  'anon sees only the published, non-test tournament');
select tests.assert_eq(
  (select count(*)::int from public.tournament_divisions), 1,
  'anon sees divisions of public tournaments only');
select tests.assert_eq(
  (select count(*)::int from public.teams), 1, 'anon sees teams of public tournaments only');
select tests.assert_eq(
  (select string_agg(full_name, ',') from public.participants), 'Public Player',
  'anon sees names of players in public tournaments only');
select tests.assert_fails('select email from public.participants',
  'anon cannot read participant email addresses');
select tests.assert_fails('select contact_email from public.registrations',
  'anon cannot read registrations');
select tests.assert_eq(
  (select string_agg(name, ',') from public.organizations), 'Org A',
  'anon sees only organizations with public tournaments');
select tests.assert_fails('select contact_email from public.organizations',
  'anon cannot read organization contact email');
select tests.assert_fails(
  $$insert into public.registrations (tournament_id, division_id, source, contact_name, contact_email)
    values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'public', 'x', 'x@example.test')$$,
  'anon cannot insert registrations directly');
select tests.assert_fails($$select public.create_organization('Anon Org', 'anon-org')$$,
  'anon cannot create organizations');
rollback to savepoint anon_checks;

-- ---------------------------------------------------------------------------
-- Owner of another organization (cross-tenant isolation)
-- ---------------------------------------------------------------------------
savepoint org_b_checks;
select tests.act_as('00000000-0000-0000-0000-00000000000c');
select tests.assert_eq(
  (select count(*)::int from public.tournaments where organization_id = '20000000-0000-0000-0000-00000000000a'), 1,
  'org B owner sees only org A''s public tournament');
select tests.assert_eq(
  (select count(*)::int from public.participants where organization_id = '20000000-0000-0000-0000-00000000000a'), 0,
  'org B owner cannot read org A participants');
select tests.assert_eq(
  (select count(*)::int from public.registrations), 0, 'org B owner cannot read org A registrations');
select tests.assert_fails(
  $$insert into public.tournaments (organization_id, city_id, name, slug, starts_at)
    values ('20000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 'Hijack', 'hijack', now())$$,
  'org B owner cannot create tournaments in org A');
update public.tournaments set name = 'Hacked' where id = '30000000-0000-0000-0000-000000000001';
select tests.assert_fails(
  $$insert into public.organization_members (organization_id, user_id, role)
    values ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000c', 'owner')$$,
  'org B owner cannot add themselves to org A');
rollback to savepoint org_b_checks;
select tests.assert_eq(
  (select name from public.tournaments where id = '30000000-0000-0000-0000-000000000001'), 'A Published Open',
  'org B owner update of org A tournament affected no rows');

-- ---------------------------------------------------------------------------
-- Scorekeeper: read-only on tournament setup, no direct match writes
-- ---------------------------------------------------------------------------
savepoint scorer_checks;
select tests.act_as('00000000-0000-0000-0000-00000000000b');
select tests.assert_eq(
  (select count(*)::int from public.tournaments where organization_id = '20000000-0000-0000-0000-00000000000a'), 3,
  'scorekeeper sees all of their organization''s tournaments, including drafts and test data');
update public.tournaments set name = 'Renamed by scorer' where id = '30000000-0000-0000-0000-000000000002';
select tests.assert_eq(
  (select count(*)::int from public.registrations), 0, 'scorekeeper cannot read registrations');
select tests.assert_fails(
  $$insert into public.matches (tournament_id, division_id, round, position)
    values ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 1, 1)$$,
  'scorekeeper cannot insert matches directly');
rollback to savepoint scorer_checks;
select tests.assert_eq(
  (select name from public.tournaments where id = '30000000-0000-0000-0000-000000000002'), 'A Draft Cup',
  'scorekeeper update of tournament affected no rows');

-- ---------------------------------------------------------------------------
-- Owner: manages own organization; integrity rules still apply
-- ---------------------------------------------------------------------------
savepoint owner_checks;
select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_eq(
  (select count(*)::int from public.registrations), 1, 'owner reads their registrations');
insert into public.tournament_divisions (tournament_id, name, slug, category, team_size)
values ('30000000-0000-0000-0000-000000000002', 'Mens Doubles', 'mens-doubles', 'mens_doubles', 2);
select tests.assert_fails(
  $$insert into public.team_members (team_id, division_id, participant_id)
    values ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003')$$,
  'owner cannot add a participant from another organization to a team');
select tests.assert_fails(
  $$insert into public.matches (tournament_id, division_id, round, position)
    values ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 1, 1)$$,
  'owner cannot insert matches directly either');
select tests.assert_fails(
  $$update public.tournaments set status = 'published' where id = '30000000-0000-0000-0000-000000000003'$$,
  'test-data tournaments cannot be published');
select tests.assert_fails(
  $$update public.tournaments set organization_id = '20000000-0000-0000-0000-00000000000b'
    where id = '30000000-0000-0000-0000-000000000002'$$,
  'tournaments cannot move between organizations');
select tests.assert_fails(
  $$delete from public.organization_members
    where organization_id = '20000000-0000-0000-0000-00000000000a' and user_id = '00000000-0000-0000-0000-00000000000a'$$,
  'the last owner cannot be removed');
rollback to savepoint owner_checks;

-- Team size and category rules (as superuser, constraints still apply)
select tests.assert_fails(
  $$insert into public.participants (id, organization_id, full_name)
      values ('50000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-00000000000a', 'Extra');
    insert into public.team_members (team_id, division_id, participant_id)
      values ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000009')$$,
  'a singles team cannot have two players');
select tests.assert_fails(
  $$insert into public.tournament_divisions (tournament_id, name, slug, category, team_size)
    values ('30000000-0000-0000-0000-000000000001', 'Bad', 'bad', 'mens_singles', 2)$$,
  'singles categories require team size 1');

-- ---------------------------------------------------------------------------
-- Creating an organization makes the caller its owner; deleting it cascades cleanly
-- ---------------------------------------------------------------------------
savepoint create_org_checks;
select tests.act_as('00000000-0000-0000-0000-00000000000d');
select public.create_organization('Outsider Club', 'outsider-club');
select tests.assert_eq(
  (select role::text from public.organization_members m join public.organizations o on o.id = m.organization_id
   where o.slug = 'outsider-club'), 'owner',
  'create_organization makes the caller the owner');
delete from public.organizations where slug = 'outsider-club';
select tests.assert_eq(
  (select count(*)::int from public.organizations where slug = 'outsider-club'), 0,
  'owner can delete their organization (cascade does not trip the last-owner rule)');
rollback to savepoint create_org_checks;

rollback;
