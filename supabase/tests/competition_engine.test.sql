-- Competition engine: bracket generation, scoring, confirmation, corrections and live updates.
-- Fixtures are created as the superuser (bypasses RLS), then each check runs as a given role.

\set ON_ERROR_STOP 1

begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'scorer@example.test'),
  ('00000000-0000-0000-0000-00000000000d', 'outsider@example.test');

insert into public.cities (id, name, slug, province, region, status)
values ('10000000-0000-0000-0000-000000000001', 'Test City', 'test-city', 'Test Province', 'Test Region', 'published');

insert into public.organizations (id, name, slug)
values ('20000000-0000-0000-0000-00000000000a', 'Org A', 'org-a');

insert into public.organization_members (organization_id, user_id, role) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'owner'),
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b', 'scorekeeper');

insert into public.tournaments (id, organization_id, city_id, name, slug, starts_at, status, phase)
values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-00000000000a',
        '10000000-0000-0000-0000-000000000001', 'Engine Open', 'engine-open', now(), 'published',
        'registration_closed');

insert into public.tournament_divisions (id, tournament_id, name, slug, category, team_size, format) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Knockout', 'knockout', 'open', 1, 'single_elimination'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
   'Pool', 'pool', 'open', 1, 'round_robin');

-- Knockout: five seeded teams plus one whose registration is still pending (excluded).
insert into public.teams (id, tournament_id, division_id, name, seed)
select ('60000000-0000-0000-0000-00000000000' || n)::uuid, '30000000-0000-0000-0000-000000000001',
       '40000000-0000-0000-0000-000000000001', 'Seed ' || n, n
from generate_series(1, 6) as n;

insert into public.registrations (tournament_id, division_id, team_id, status, source, contact_name, contact_email)
values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
        '60000000-0000-0000-0000-000000000006', 'pending', 'public', 'Pending', 'pending@example.test');

-- Pool: three teams.
insert into public.teams (id, tournament_id, division_id, name)
select ('61000000-0000-0000-0000-00000000000' || n)::uuid, '30000000-0000-0000-0000-000000000001',
       '40000000-0000-0000-0000-000000000002', 'Pool ' || n
from generate_series(1, 3) as n;

-- Shorthand for a match id by (division, round, position).
create function pg_temp.match_id(d text, r int, p int) returns uuid language sql as $$
  select id from public.matches
  where division_id = ('40000000-0000-0000-0000-00000000000' || d)::uuid and round = r and position = p
$$;
create function pg_temp.match_version(id uuid) returns int language sql as $$
  select version from public.matches where matches.id = match_version.id
$$;

-- ---------------------------------------------------------------------------
-- Who may build brackets
-- ---------------------------------------------------------------------------
savepoint denied;
select tests.act_as(null);
select tests.assert_fails($$select public.generate_bracket('40000000-0000-0000-0000-000000000001')$$,
  'anon cannot generate a bracket');
select tests.act_as('00000000-0000-0000-0000-00000000000d');
select tests.assert_fails($$select public.generate_bracket('40000000-0000-0000-0000-000000000001')$$,
  'an outsider cannot generate a bracket');
select tests.act_as('00000000-0000-0000-0000-00000000000b');
select tests.assert_fails($$select public.generate_bracket('40000000-0000-0000-0000-000000000001')$$,
  'a scorekeeper cannot generate a bracket');
select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_fails(
  $$insert into public.matches (tournament_id, division_id, round, position)
    values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 1)$$,
  'owners still cannot write matches directly');
select tests.assert_fails($$select public.match_snapshot(gen_random_uuid())$$,
  'internal helpers are not callable by clients');
rollback to savepoint denied;

-- ---------------------------------------------------------------------------
-- Single elimination: 5 teams -> 8-line draw, byes for seeds 1-3
-- ---------------------------------------------------------------------------
select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_eq(public.generate_bracket('40000000-0000-0000-0000-000000000001'), 7,
  'a 5-team knockout has 7 matches (4 + 2 + 1)');
select tests.assert_fails($$select public.generate_bracket('40000000-0000-0000-0000-000000000001')$$,
  'a bracket cannot be generated twice');
reset role;

select tests.assert_eq(
  (select count(*)::int from public.matches
   where division_id = '40000000-0000-0000-0000-000000000001' and status = 'bye'), 3,
  'three first-round byes');
select tests.assert_eq(
  (select count(*)::int from public.matches
   where team_a_id = '60000000-0000-0000-0000-000000000006' or team_b_id = '60000000-0000-0000-0000-000000000006'), 0,
  'the team with a pending registration is left out');
select tests.assert_eq(
  (select team_a_id from public.matches where id = pg_temp.match_id('1', 1, 2)),
  '60000000-0000-0000-0000-000000000004'::uuid, 'seed 4 plays seed 5 in the first round');
select tests.assert_eq(
  (select (team_a_id, team_b_id, status)::text from public.matches where id = pg_temp.match_id('1', 2, 1)),
  ('60000000-0000-0000-0000-000000000001'::uuid, null::uuid, 'pending'::public.match_status)::text,
  'seed 1 advanced on a bye and waits for the 4/5 winner');
select tests.assert_eq(
  (select status from public.matches where id = pg_temp.match_id('1', 2, 2)),
  'scheduled'::public.match_status, 'two byes meet in a ready semifinal (seed 2 v seed 3)');
select tests.assert_eq(
  (select status from public.tournament_divisions where id = '40000000-0000-0000-0000-000000000001'),
  'bracket_generated'::public.division_status, 'division is marked bracket_generated');

-- ---------------------------------------------------------------------------
-- Scoring by a scorekeeper
-- ---------------------------------------------------------------------------
select tests.act_as('00000000-0000-0000-0000-00000000000b');
select tests.assert_fails(
  format($$select public.submit_match_score(%L, '[{"team_a": 11, "team_b": 7}]', 99)$$, pg_temp.match_id('1', 1, 2)),
  'a stale version is rejected');
select tests.assert_fails(
  format($$select public.submit_match_score(%L, '[{"team_a": 14, "team_b": 10}]', %s)$$,
    pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2))),
  'an impossible final score is rejected');
select tests.assert_fails(
  format($$select public.submit_match_score(%L, '[{"team_a": 11, "team_b": 7}, {"team_a": 3, "team_b": 0}]', %s)$$,
    pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2))),
  'no games after the deciding game');
select tests.assert_fails(
  format($$select public.submit_match_score(%L, '[{"team_a": 1, "team_b": 0}]', 1)$$, pg_temp.match_id('1', 2, 1)),
  'a match waiting for a team cannot be scored');

select public.start_match(pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2)));
reset role;
select tests.assert_eq(
  (select phase from public.tournaments where id = '30000000-0000-0000-0000-000000000001'),
  'in_progress'::public.tournament_phase, 'starting a match puts the tournament in progress');
select tests.act_as('00000000-0000-0000-0000-00000000000b');

select public.submit_match_score(pg_temp.match_id('1', 1, 2), '[{"team_a": 8, "team_b": 6}]',
  pg_temp.match_version(pg_temp.match_id('1', 1, 2)));
select tests.assert_eq(
  (select status from public.matches where id = pg_temp.match_id('1', 1, 2)),
  'in_progress'::public.match_status, 'an unfinished game keeps the match in progress');

-- Seed 5 comes back to win 13-11.
select public.submit_match_score(pg_temp.match_id('1', 1, 2), '[{"team_a": 11, "team_b": 13}]',
  pg_temp.match_version(pg_temp.match_id('1', 1, 2)));
select tests.assert_eq(
  (select (status, winner_team_id)::text from public.matches where id = pg_temp.match_id('1', 1, 2)),
  ('completed'::public.match_status, '60000000-0000-0000-0000-000000000005'::uuid)::text,
  'a decided match is completed with a winner');
select tests.assert_fails(
  format($$select public.confirm_match_result(%L, %s)$$,
    pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2))),
  'a scorekeeper cannot confirm a result');

-- ---------------------------------------------------------------------------
-- Confirmation, advancement and corrections by the owner
-- ---------------------------------------------------------------------------
select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_fails($$select public.reset_bracket('40000000-0000-0000-0000-000000000001')$$,
  'a bracket with scores cannot be reset');

select public.confirm_match_result(pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2)));
select tests.assert_eq(
  (select (team_b_id, status)::text from public.matches where id = pg_temp.match_id('1', 2, 1)),
  ('60000000-0000-0000-0000-000000000005'::uuid, 'scheduled'::public.match_status)::text,
  'the confirmed winner advances and the semifinal is ready');

select tests.act_as('00000000-0000-0000-0000-00000000000b');
select tests.assert_fails(
  format($$select public.submit_match_score(%L, '[{"team_a": 11, "team_b": 2}]', %s)$$,
    pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2))),
  'a confirmed result cannot be resubmitted');

select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_fails(
  format($$select public.correct_match_score(%L, '[{"team_a": 11, "team_b": 9}]', %s, '  ')$$,
    pg_temp.match_id('1', 1, 2), pg_temp.match_version(pg_temp.match_id('1', 1, 2))),
  'a correction needs a reason');
select public.correct_match_score(pg_temp.match_id('1', 1, 2), '[{"team_a": 11, "team_b": 9}]',
  pg_temp.match_version(pg_temp.match_id('1', 1, 2)), 'Score sheet was read backwards');
select tests.assert_eq(
  (select team_b_id from public.matches where id = pg_temp.match_id('1', 2, 1)),
  '60000000-0000-0000-0000-000000000004'::uuid, 'a corrected winner replaces the advanced team');

select public.assign_match_court(pg_temp.match_id('1', 2, 1), 'Court 3');
select public.assign_match_court(pg_temp.match_id('1', 2, 1), 'Court 1');
reset role;
select tests.assert_eq(
  (select string_agg(court_label, ',') from public.match_court_assignments
   where match_id = pg_temp.match_id('1', 2, 1) and is_current), 'Court 1',
  'reassigning a court keeps one current assignment');
select tests.assert_eq(
  (select string_agg(action::text, ',' order by created_at, action::text)
   from public.score_audit_logs where match_id = pg_temp.match_id('1', 1, 2)),
  'result_confirmed,score_corrected,score_submitted,score_submitted',
  'every score change on the match is audited');

-- Anonymous viewers can read the live bracket of a published tournament.
select tests.act_as(null);
select tests.assert_eq((select count(*)::int from public.matches), 7, 'anon can read published matches');
select tests.assert_eq((select count(*)::int from public.match_games), 1, 'anon can read published games');
reset role;

-- ---------------------------------------------------------------------------
-- Round robin: three teams -> three rounds, one resting team per round
-- ---------------------------------------------------------------------------
select tests.act_as('00000000-0000-0000-0000-00000000000a');
select tests.assert_eq(public.generate_bracket('40000000-0000-0000-0000-000000000002'), 3,
  'three teams play three round-robin matches');
reset role;
select tests.assert_eq(
  (select count(distinct least(team_a_id, team_b_id)::text || greatest(team_a_id, team_b_id)::text)::int
   from public.matches where division_id = '40000000-0000-0000-0000-000000000002'), 3,
  'every pairing is played exactly once');

select tests.act_as('00000000-0000-0000-0000-00000000000a');
select public.submit_match_score(m.id, '[{"team_a": 11, "team_b": 5}]', m.version)
from public.matches m where m.division_id = '40000000-0000-0000-0000-000000000002';
select public.confirm_match_result(m.id, m.version)
from public.matches m where m.division_id = '40000000-0000-0000-0000-000000000002';
reset role;
select tests.assert_eq(
  (select status from public.tournament_divisions where id = '40000000-0000-0000-0000-000000000002'),
  'completed'::public.division_status, 'the division completes when every result is confirmed');

-- ---------------------------------------------------------------------------
-- Live updates
-- ---------------------------------------------------------------------------
select tests.assert_eq(
  (select string_agg(tablename::text, ',' order by tablename) from pg_publication_tables
   where pubname = 'supabase_realtime'),
  'match_court_assignments,match_games,matches,tournament_divisions',
  'competition tables stream through Supabase Realtime');

rollback;
