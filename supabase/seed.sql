-- =============================================================================
-- LOCAL DEVELOPMENT SEED — FICTIONAL SAMPLE DATA. DO NOT RUN AGAINST PRODUCTION.
-- Mirrors src/features/sample-content/data.ts. Venue, club and event names are made up.
--
-- Runs automatically with `supabase db reset` (local stack).
--
-- Bootstrapping an administrator (local or production):
--   1. Create a user: Supabase Dashboard -> Authentication -> Users -> "Add user"
--      (or `supabase` Studio locally at http://localhost:54323).
--   2. In the SQL editor, grant admin access:
--        insert into public.admins (user_id)
--        select id from auth.users where email = 'you@example.com';
--   3. Sign in at /admin/login.
-- =============================================================================

insert into public.cities (name, slug, province, region, description, latitude, longitude, sort_order, status)
values
  ('Cagayan de Oro', 'cagayan-de-oro', 'Misamis Oriental', 'Northern Mindanao',
   'The City of Golden Friendship and the region''s busiest pickleball scene.', 8.4542, 124.6319, 1, 'published'),
  ('Iligan', 'iligan', 'Lanao del Norte', 'Northern Mindanao',
   'The City of Majestic Waterfalls, with a fast-growing open-play community.', 8.228, 124.2452, 2, 'published'),
  ('Malaybalay', 'malaybalay', 'Bukidnon', 'Northern Mindanao',
   'Cool highland weather that makes outdoor games a pleasure year-round.', 8.1575, 125.1278, 3, 'published'),
  ('Valencia', 'valencia', 'Bukidnon', 'Northern Mindanao',
   'Bukidnon''s commercial hub with a friendly, beginner-heavy crowd.', 7.9064, 125.0928, 4, 'published'),
  ('Ozamiz', 'ozamiz', 'Misamis Occidental', 'Northern Mindanao',
   'A coastal city where weekend social games are picking up quickly.', 8.1462, 123.8444, 5, 'published')
on conflict (slug) do nothing;

insert into public.courts (
  city_id, name, slug, summary, description, address, latitude, longitude, environment, surface,
  court_count, amenities, opening_hours, price_info, is_featured, status
)
select c.id, v.name, v.slug, v.summary, v.description, v.address, v.lat, v.lng,
       v.environment::public.court_environment, v.surface, v.court_count, v.amenities,
       v.opening_hours, v.price_info, v.is_featured, 'published'
from (values
  ('cagayan-de-oro', 'Uptown Rally Courts', 'uptown-rally-courts',
   'Four covered hard courts with lights for evening open play.',
   'A covered four-court facility with permanent nets, LED lighting and a shaded waiting area.',
   'Sample address, Cagayan de Oro', 8.4542, 124.6319, 'covered', 'Acrylic hard court', 4,
   array['Lights', 'Parking', 'Restrooms', 'Paddle rental'], 'Daily, 6:00 AM – 10:00 PM',
   'Sample rate: ₱150 per player per session', true),
  ('cagayan-de-oro', 'Riverside Kitchen Club', 'riverside-kitchen-club',
   'Outdoor courts near the river with morning and late-afternoon sessions.',
   'Two outdoor courts with portable nets.', 'Sample address, Cagayan de Oro', 8.4822, 124.6472,
   'outdoor', 'Concrete with court paint', 2, array['Parking', 'Water station'],
   'Daily, 5:30 AM – 9:00 AM and 3:30 PM – 7:00 PM', 'Sample rate: free open play', true),
  ('iligan', 'Waterfall City Sports Hall', 'waterfall-city-sports-hall',
   'Indoor gym converted for pickleball on weekday evenings.',
   'A multi-purpose indoor hall with three taped pickleball courts.', 'Sample address, Iligan',
   8.228, 124.2452, 'indoor', 'Hardwood', 3, array['Air-conditioned', 'Restrooms', 'Seating'],
   'Mon–Fri, 5:00 PM – 10:00 PM', 'Sample rate: ₱200 per hour per court', true),
  ('malaybalay', 'Highland Dink Park', 'highland-dink-park',
   'Cool-weather outdoor courts with mountain views.',
   'Two outdoor courts in the highlands.', 'Sample address, Malaybalay', 8.1575, 125.1278,
   'outdoor', 'Acrylic hard court', 2, array['Parking', 'Café nearby'], 'Daily, 6:00 AM – 6:00 PM',
   'Sample rate: ₱100 per player', true),
  ('valencia', 'Valencia Community Courts', 'valencia-community-courts',
   'Covered barangay courts shared with basketball on weekends.',
   'Lines for two pickleball courts painted over a covered basketball court.',
   'Sample address, Valencia', 7.9064, 125.0928, 'covered', 'Concrete', 2,
   array['Lights', 'Restrooms'], 'Tue–Sun, 4:00 PM – 9:00 PM', null, false),
  ('ozamiz', 'Bayview Paddle Courts', 'bayview-paddle-courts',
   'Breezy seaside courts with weekend social play.',
   'Two outdoor courts by the bay.', 'Sample address, Ozamiz', 8.1462, 123.8444, 'outdoor',
   'Acrylic hard court', 2, array['Parking', 'Seating'], 'Sat–Sun, 6:00 AM – 6:00 PM',
   'Sample rate: ₱120 per player', false)
) as v(city_slug, name, slug, summary, description, address, lat, lng, environment, surface,
       court_count, amenities, opening_hours, price_info, is_featured)
join public.cities c on c.slug = v.city_slug
on conflict (slug) do nothing;

insert into public.clubs (
  city_id, home_court_id, name, slug, summary, description, skill_levels, meeting_schedule,
  is_featured, status
)
select c.id, ct.id, v.name, v.slug, v.summary, v.description, v.skill_levels, v.schedule, true, 'published'
from (values
  ('cagayan-de-oro', 'uptown-rally-courts', 'Golden Friendship Picklers', 'golden-friendship-picklers',
   'A welcoming community club with weekly open play and beginner clinics.',
   'Hosts weekly open play and monthly beginner clinics.',
   array['Beginner', 'Intermediate'], 'Tuesdays & Thursdays, 6:00 PM'),
  ('iligan', 'waterfall-city-sports-hall', 'Iligan Third Shot Society', 'iligan-third-shot-society',
   'Competitive drills and ladder play for intermediate and advanced players.',
   'Structured drilling sessions followed by ladder play every week.',
   array['Intermediate', 'Advanced'], 'Mondays & Wednesdays, 7:00 PM'),
  ('malaybalay', 'highland-dink-park', 'Bukidnon Highland Paddlers', 'bukidnon-highland-paddlers',
   'Weekend social games and family-friendly sessions in the highlands.',
   'A social-first club focused on fun games and introducing new players.',
   array['All levels'], 'Saturdays, 7:00 AM')
) as v(city_slug, court_slug, name, slug, summary, description, skill_levels, schedule)
join public.cities c on c.slug = v.city_slug
join public.courts ct on ct.slug = v.court_slug
on conflict (slug) do nothing;

-- Events are scheduled relative to the time the seed runs so they always appear upcoming.
insert into public.events (
  city_id, court_id, club_id, title, slug, summary, description, event_type, starts_at, ends_at,
  venue_name, fee_info, is_featured, status
)
select c.id, ct.id, cl.id, v.title, v.slug, v.summary, v.description,
       v.event_type::public.event_type,
       date_trunc('day', now()) + v.starts_in,
       date_trunc('day', now()) + v.starts_in + v.duration,
       ct.name, v.fee_info, v.is_featured, 'published'
from (values
  ('cagayan-de-oro', 'uptown-rally-courts', 'golden-friendship-picklers', 'CDO Weekend Open Play',
   'cdo-weekend-open-play', 'Rotating doubles for all levels. Bring a paddle — or borrow one.',
   'Casual rotating doubles with a paddle-stack queue.', 'open_play',
   interval '3 days 23 hours', interval '4 hours', 'Sample fee: ₱150', true),
  ('iligan', 'waterfall-city-sports-hall', 'iligan-third-shot-society', 'Beginner Clinic: Dinks & Drops',
   'beginner-clinic-iligan', 'A two-hour clinic covering the kitchen, dinks and the third-shot drop.',
   'Coached drills for new players.', 'clinic', interval '8 days 10 hours', interval '2 hours',
   'Sample fee: ₱300', true),
  ('cagayan-de-oro', 'uptown-rally-courts', null, 'Northern Mindanao Doubles Classic',
   'northern-mindanao-doubles-classic',
   'A regional doubles tournament with novice, intermediate and open brackets.',
   'Men''s, women''s and mixed doubles brackets.', 'tournament', interval '21 days',
   interval '33 hours', 'Sample fee: ₱800 per team', true),
  ('malaybalay', 'highland-dink-park', 'bukidnon-highland-paddlers', 'Highland Social Mixer',
   'highland-social-mixer', 'Mixed partners every game, coffee after.',
   'Partners rotate each game.', 'social', interval '12 days 23 hours', interval '4 hours', null, false)
) as v(city_slug, court_slug, club_slug, title, slug, summary, description, event_type,
       starts_in, duration, fee_info, is_featured)
join public.cities c on c.slug = v.city_slug
join public.courts ct on ct.slug = v.court_slug
left join public.clubs cl on cl.slug = v.club_slug
on conflict (slug) do nothing;

insert into public.articles (title, slug, excerpt, body, category, author_name, reading_minutes, status)
values
  ('What is pickleball? A quick guide for first-timers', 'what-is-pickleball',
   'The fastest-growing paddle sport explained in five minutes — court, rules and gear.',
   E'Pickleball combines elements of tennis, badminton and table tennis.\n\n## The court\n\nA pickleball court measures 20 by 44 feet. The seven-foot zone on each side of the net is the kitchen.\n\n## Basic rules\n\n- Serves are underhand and diagonal.\n- The ball must bounce once on each side before volleys are allowed.\n- You cannot volley while standing in the kitchen.',
   'Basics', 'Pick n Go (sample)', 5, 'published'),
  ('Pickleball scoring explained (without the headache)', 'pickleball-scoring-explained',
   'Why players call out three numbers, and how side-outs work in doubles.',
   E'Traditional doubles scoring uses three numbers.\n\n## Only the serving team scores\n\nPoints are won only on your own serve.\n\n## Games to 11\n\nMost recreational games are played to 11, win by 2.',
   'Rules', 'Pick n Go (sample)', 4, 'published'),
  ('Open play etiquette: how to join a game at a new court', 'open-play-etiquette',
   'Paddle stacks, rotations and the unwritten rules that keep open play fun.',
   E'Open play is the heart of pickleball culture.\n\n## Look for the paddle stack\n\nAdd your paddle to the end of the queue.\n\n## Mix it up\n\nRotate partners and keep games moving.',
   'Community', 'Pick n Go (sample)', 3, 'published')
on conflict (slug) do nothing;
