-- =============================================================================
-- Pickleball Hub — on-site event registration
--
-- Players register for events that have no external registration link through the same
-- submissions pipeline as contact and court listing forms. The event slug, skill level and
-- partner live in `payload`; organizers review them alongside other submissions.
-- =============================================================================

alter type public.submission_type add value if not exists 'event_registration';
