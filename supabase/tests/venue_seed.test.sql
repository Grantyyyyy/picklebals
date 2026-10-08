-- Checks the result of importing the example venue seed three times (see scripts/db-test.sh).
\set ON_ERROR_STOP 1

begin;

select tests.assert_eq(
  (select count(*)::int from public.venues where source_dataset = 'iligan_pickleball_venues_seed_example@1'), 2,
  'repeated imports do not duplicate venues');
select tests.assert_eq(
  (select name from public.venues where slug = 'example-venue-a-placeholder'), 'Admin Edited Name',
  're-import does not overwrite a verified venue');
select tests.assert_eq(
  (select verification_status::text from public.venues where slug = 'example-venue-b-placeholder'), 'unverified',
  'imported venues are unverified');
select tests.assert_eq(
  (select address from public.venues where slug = 'example-venue-b-placeholder'), null::text,
  'missing addresses stay missing');
select tests.assert_eq(
  (select count(*)::int from public.venue_courts vc join public.venues v on v.id = vc.venue_id
   where v.source_dataset like 'iligan_pickleball_venues_seed_example%'), 0,
  'no court inventory is invented');
select tests.assert_eq(
  (select source_references -> 0 ->> 'url' from public.venues where source_key is not null
   and source_references <> '[]'::jsonb limit 1), 'https://example.com/venue-a',
  'source references are preserved');
select tests.assert_eq(
  (select (select slug from public.cities c where c.id = v.city_id) from public.venues v
   where slug = 'example-venue-b-placeholder'), 'iligan',
  'venues are attached to Iligan');

select tests.act_as(null);
select tests.assert_eq(
  (select count(*)::int from public.venues where slug like 'example-venue-%'), 2,
  'anon can read published (unverified) venues');
select tests.assert_fails($$update public.venues set name = 'x'$$, 'anon cannot modify venues');

rollback;
