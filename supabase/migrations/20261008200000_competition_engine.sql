-- =============================================================================
-- Pickleball Hub — competition engine and live updates
--
-- The only write path for matches, match games and court assignments (see the tournament
-- platform migration). Every function is security definer, checks the caller's organization
-- role itself and records bracket and score changes in score_audit_logs.
--
-- Roles:
--   * owner / organizer: generate and reset brackets, assign courts, confirm and correct results.
--   * scorekeeper (and the above): start matches and submit scores.
--
-- Concurrency: calls that change a match take its `version` and fail when it has moved on, so
-- two scorekeepers on the same match cannot silently overwrite each other.
--
-- Live updates: competition tables join the `supabase_realtime` publication. Realtime applies
-- the same RLS select policies, so anonymous viewers only receive published tournaments.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Authorization helper
-- -----------------------------------------------------------------------------
create or replace function public.can_score_tournament(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(
    public.tournament_org_id(t_id), array['owner', 'organizer', 'scorekeeper']::public.org_role[]
  );
$$;

-- -----------------------------------------------------------------------------
-- Internal helpers (not callable by clients)
-- -----------------------------------------------------------------------------

-- Snapshot of a match for the audit log.
create or replace function public.match_snapshot(p_match_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'status', m.status,
    'team_a_id', m.team_a_id,
    'team_b_id', m.team_b_id,
    'winner_team_id', m.winner_team_id,
    'version', m.version,
    'games', coalesce((
      select jsonb_agg(
        jsonb_build_object('game', g.game_number, 'team_a', g.team_a_score, 'team_b', g.team_b_score)
        order by g.game_number
      )
      from public.match_games g
      where g.match_id = m.id
    ), '[]'::jsonb)
  )
  from public.matches m
  where m.id = p_match_id;
$$;

-- Validates game scores against the division's rules and returns the winning slot, or null
-- while the match is undecided. Games look like [{ "team_a": 11, "team_b": 7 }, ...]; only the
-- last game may be unfinished, and no game may follow the deciding one.
create or replace function public.evaluate_match_games(
  p_games jsonb,
  p_points_to_win smallint,
  p_win_by smallint,
  p_best_of smallint
)
returns public.match_slot
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_needed int := p_best_of / 2 + 1;
  v_count int;
  v_game jsonb;
  v_a int;
  v_b int;
  v_high int;
  v_diff int;
  v_wins_a int := 0;
  v_wins_b int := 0;
begin
  if p_games is null or jsonb_typeof(p_games) <> 'array' then
    raise exception 'Games must be a JSON array' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_games);
  if v_count = 0 or v_count > p_best_of then
    raise exception 'A best-of-% match has between 1 and % games', p_best_of, p_best_of
      using errcode = '22023';
  end if;

  for i in 0 .. v_count - 1 loop
    v_game := p_games -> i;

    if v_wins_a = v_needed or v_wins_b = v_needed then
      raise exception 'Game % comes after the match was already decided', i + 1 using errcode = '22023';
    end if;

    if jsonb_typeof(v_game -> 'team_a') is distinct from 'number'
       or jsonb_typeof(v_game -> 'team_b') is distinct from 'number' then
      raise exception 'Game % needs numeric team_a and team_b scores', i + 1 using errcode = '22023';
    end if;

    v_a := (v_game ->> 'team_a')::int;
    v_b := (v_game ->> 'team_b')::int;
    if v_a not between 0 and 99 or v_b not between 0 and 99 then
      raise exception 'Game % scores must be between 0 and 99', i + 1 using errcode = '22023';
    end if;

    v_high := greatest(v_a, v_b);
    v_diff := abs(v_a - v_b);

    if v_high >= p_points_to_win and v_diff >= p_win_by then
      -- Past the target score a game ends the moment the lead reaches win_by.
      if v_high > p_points_to_win and v_diff <> p_win_by then
        raise exception 'Game %: %-% is not a possible final score', i + 1, v_a, v_b
          using errcode = '22023';
      end if;
      if v_a > v_b then
        v_wins_a := v_wins_a + 1;
      else
        v_wins_b := v_wins_b + 1;
      end if;
    elsif i < v_count - 1 then
      raise exception 'Game % is unfinished; only the last game can be in progress', i + 1
        using errcode = '22023';
    end if;
  end loop;

  return case
    when v_wins_a = v_needed then 'a'::public.match_slot
    when v_wins_b = v_needed then 'b'::public.match_slot
  end;
end;
$$;

-- Replaces a match's games with the given (already validated) list, touching only changed rows.
create or replace function public.write_match_games(p_match_id uuid, p_tournament_id uuid, p_games jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.match_games
  where match_id = p_match_id and game_number > jsonb_array_length(p_games);

  insert into public.match_games (tournament_id, match_id, game_number, team_a_score, team_b_score)
  select p_tournament_id, p_match_id, g.ordinality::smallint,
         (g.value ->> 'team_a')::smallint, (g.value ->> 'team_b')::smallint
  from jsonb_array_elements(p_games) with ordinality as g
  on conflict (match_id, game_number) do update
    set team_a_score = excluded.team_a_score,
        team_b_score = excluded.team_b_score
    where (public.match_games.team_a_score, public.match_games.team_b_score)
      is distinct from (excluded.team_a_score, excluded.team_b_score);
end;
$$;

create or replace function public.log_score_event(
  p_tournament_id uuid,
  p_match_id uuid,
  p_action public.score_audit_action,
  p_previous jsonb,
  p_new jsonb,
  p_reason text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.score_audit_logs (
    organization_id, tournament_id, match_id, action, previous_state, new_state, reason, performed_by
  )
  values (
    public.tournament_org_id(p_tournament_id), p_tournament_id, p_match_id, p_action,
    p_previous, p_new, p_reason, (select auth.uid())
  );
$$;

-- Puts a decided match's winner into its slot of the next match. Returns the next match id.
create or replace function public.advance_match_winner(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.next_match_id is null or v_match.winner_team_id is null then
    return null;
  end if;

  update public.matches n
  set team_a_id = case when v_match.next_match_slot = 'a' then v_match.winner_team_id else n.team_a_id end,
      team_b_id = case when v_match.next_match_slot = 'b' then v_match.winner_team_id else n.team_b_id end,
      status = case
        when n.status = 'pending'
         and (v_match.next_match_slot = 'a' or n.team_a_id is not null)
         and (v_match.next_match_slot = 'b' or n.team_b_id is not null)
        then 'scheduled'::public.match_status
        else n.status
      end,
      version = n.version + 1
  where n.id = v_match.next_match_id;

  return v_match.next_match_id;
end;
$$;

-- Moves a division (and its tournament) into play once its first match starts.
create or replace function public.mark_division_in_progress(p_division_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.tournament_divisions
  set status = 'in_progress'
  where id = p_division_id and status = 'bracket_generated';

  update public.tournaments t
  set phase = 'in_progress'
  from public.tournament_divisions d
  where d.id = p_division_id and t.id = d.tournament_id
    and t.phase in ('setup', 'registration_open', 'registration_closed');
$$;

-- Completes a division once every match is a bye, cancelled or a confirmed result.
create or replace function public.refresh_division_completion(p_division_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.tournament_divisions d
  set status = 'completed'
  where d.id = p_division_id
    and d.status <> 'completed'
    and not exists (
      select 1 from public.matches m
      where m.division_id = d.id
        and m.status not in ('bye', 'cancelled')
        and not (m.status = 'completed' and m.confirmed_at is not null)
    );
$$;

-- Locks a match for a write and checks the caller's role and the expected version.
create or replace function public.lock_match_for_write(
  p_match_id uuid,
  p_expected_version integer,
  p_require_manager boolean
)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
begin
  select * into v_match from public.matches where id = p_match_id for update;

  if not found
     or (select auth.uid()) is null
     or not (case when p_require_manager
                  then public.can_manage_tournament(v_match.tournament_id)
                  else public.can_score_tournament(v_match.tournament_id) end) then
    raise exception 'Match not found or not allowed' using errcode = '42501';
  end if;

  if p_expected_version is distinct from v_match.version then
    raise exception 'This match was updated by someone else. Reload and try again.'
      using errcode = '40001';
  end if;

  return v_match;
end;
$$;

-- -----------------------------------------------------------------------------
-- Brackets
-- -----------------------------------------------------------------------------

-- Builds every match for a division from its approved teams and returns the number created.
--   * single_elimination: standard seeding (1 v 16, 8 v 9, ...); byes go to the top seeds and
--     advance immediately. Unseeded teams are drawn at random below the seeded ones.
--   * round_robin: circle method, every team plays every other team once.
create or replace function public.generate_bracket(p_division_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_division public.tournament_divisions;
  v_teams uuid[];
  v_slots uuid[];
  v_order int[];
  v_next int[];
  v_n int;
  v_size int;
  v_rounds int;
  v_slot_count int;
  v_position int;
  v_a uuid;
  v_b uuid;
  v_match_id uuid;
  v_created int := 0;
begin
  select * into v_division from public.tournament_divisions where id = p_division_id for update;
  if not found
     or (select auth.uid()) is null
     or not public.can_manage_tournament(v_division.tournament_id) then
    raise exception 'Division not found or not allowed' using errcode = '42501';
  end if;

  if v_division.status <> 'setup'
     or exists (select 1 from public.matches where division_id = p_division_id) then
    raise exception 'This division already has a bracket' using errcode = '55000';
  end if;

  if (select phase from public.tournaments where id = v_division.tournament_id)
     in ('completed', 'cancelled') then
    raise exception 'This tournament is closed' using errcode = '55000';
  end if;

  -- Organizer-created teams count; teams that came from a registration count once approved.
  select array_agg(t.id order by t.seed asc nulls last, random())
    into v_teams
  from public.teams t
  where t.division_id = p_division_id
    and not exists (
      select 1 from public.registrations r where r.team_id = t.id and r.status <> 'approved'
    );

  v_n := coalesce(array_length(v_teams, 1), 0);
  if v_n < 2 then
    raise exception 'A bracket needs at least two approved teams' using errcode = '23514';
  end if;

  if v_division.format = 'single_elimination' then
    v_size := 2;
    v_rounds := 1;
    while v_size < v_n loop
      v_size := v_size * 2;
      v_rounds := v_rounds + 1;
    end loop;

    -- Seed order for each first-round line: [1, 2] -> [1, 4, 2, 3] -> [1, 8, 4, 5, 2, 7, 3, 6] ...
    v_order := array[1, 2];
    while array_length(v_order, 1) < v_size loop
      v_next := '{}';
      foreach v_position in array v_order loop
        v_next := v_next || v_position || (array_length(v_order, 1) * 2 + 1 - v_position);
      end loop;
      v_order := v_next;
    end loop;

    -- Build from the final backwards so each match can point at the one its winner feeds.
    for r in reverse v_rounds .. 1 loop
      for p in 1 .. (v_size >> r) loop
        v_a := case when r = 1 then v_teams[v_order[2 * p - 1]] end;
        v_b := case when r = 1 then v_teams[v_order[2 * p]] end;

        insert into public.matches (
          tournament_id, division_id, round, position, team_a_id, team_b_id, winner_team_id,
          status, next_match_id, next_match_slot, completed_at, confirmed_at
        )
        values (
          v_division.tournament_id, p_division_id, r, p, v_a, v_b,
          case when r = 1 and (v_a is null) <> (v_b is null) then coalesce(v_a, v_b) end,
          case
            when r > 1 then 'pending'
            when v_a is not null and v_b is not null then 'scheduled'
            else 'bye'
          end::public.match_status,
          (select id from public.matches
           where division_id = p_division_id and round = r + 1 and position = (p + 1) / 2),
          case when r < v_rounds then (case when p % 2 = 1 then 'a' else 'b' end)::public.match_slot end,
          case when r = 1 and (v_a is null) <> (v_b is null) then now() end,
          case when r = 1 and (v_a is null) <> (v_b is null) then now() end
        )
        returning id into v_match_id;

        v_created := v_created + 1;
        if r = 1 and (v_a is null) <> (v_b is null) then
          perform public.advance_match_winner(v_match_id);
        end if;
      end loop;
    end loop;
  else
    -- Circle method: fix the first slot and rotate the rest; an odd field gets a resting slot.
    v_slots := v_teams;
    if v_n % 2 = 1 then
      v_slots := array_append(v_slots, null::uuid);
    end if;
    v_slot_count := array_length(v_slots, 1);

    for r in 1 .. v_slot_count - 1 loop
      v_position := 0;
      for i in 1 .. v_slot_count / 2 loop
        v_a := v_slots[i];
        v_b := v_slots[v_slot_count + 1 - i];
        if v_a is not null and v_b is not null then
          v_position := v_position + 1;
          insert into public.matches (tournament_id, division_id, round, position, team_a_id, team_b_id, status)
          values (v_division.tournament_id, p_division_id, r, v_position, v_a, v_b, 'scheduled');
          v_created := v_created + 1;
        end if;
      end loop;
      v_slots := array[v_slots[1], v_slots[v_slot_count]] || v_slots[2 : v_slot_count - 1];
    end loop;
  end if;

  update public.tournament_divisions set status = 'bracket_generated' where id = p_division_id;

  perform public.log_score_event(
    v_division.tournament_id, null, 'bracket_generated', null,
    jsonb_build_object(
      'division_id', p_division_id, 'format', v_division.format, 'teams', v_n, 'matches', v_created
    )
  );

  return v_created;
end;
$$;

-- Deletes a division's bracket so it can be regenerated. Refused once any score is recorded,
-- because deleting matches would also delete their audit history.
create or replace function public.reset_bracket(p_division_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_division public.tournament_divisions;
  v_count int;
begin
  select * into v_division from public.tournament_divisions where id = p_division_id for update;
  if not found
     or (select auth.uid()) is null
     or not public.can_manage_tournament(v_division.tournament_id) then
    raise exception 'Division not found or not allowed' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.matches m
    where m.division_id = p_division_id
      and (m.status in ('in_progress', 'completed')
           or exists (select 1 from public.match_games g where g.match_id = m.id))
  ) then
    raise exception 'Scores are already recorded; correct results instead of resetting'
      using errcode = '55000';
  end if;

  delete from public.matches where division_id = p_division_id;
  get diagnostics v_count = row_count;

  update public.tournament_divisions set status = 'setup' where id = p_division_id;

  perform public.log_score_event(
    v_division.tournament_id, null, 'bracket_reset',
    jsonb_build_object('division_id', p_division_id, 'matches', v_count),
    jsonb_build_object('division_id', p_division_id, 'matches', 0),
    nullif(btrim(p_reason), '')
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Courts
-- -----------------------------------------------------------------------------

-- Assigns (or reassigns) a match to a court. The label defaults to the venue court's label.
create or replace function public.assign_match_court(
  p_match_id uuid,
  p_court_label text default null,
  p_venue_court_id uuid default null,
  p_scheduled_start_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
  v_label text := nullif(btrim(p_court_label), '');
  v_previous jsonb;
  v_assignment uuid;
begin
  select * into v_match from public.matches where id = p_match_id for update;
  if not found
     or (select auth.uid()) is null
     or not public.can_manage_tournament(v_match.tournament_id) then
    raise exception 'Match not found or not allowed' using errcode = '42501';
  end if;

  if v_match.status in ('completed', 'bye', 'cancelled') then
    raise exception 'Finished matches cannot be assigned a court' using errcode = '55000';
  end if;

  if p_venue_court_id is not null then
    select coalesce(v_label, vc.label) into v_label
    from public.venue_courts vc
    join public.tournaments t on t.venue_id = vc.venue_id
    where vc.id = p_venue_court_id and t.id = v_match.tournament_id;

    if not found then
      raise exception 'That court is not at this tournament''s venue' using errcode = '23514';
    end if;
  end if;

  if v_label is null then
    raise exception 'A court label is required' using errcode = '23514';
  end if;

  select jsonb_build_object(
    'court_label', court_label, 'venue_court_id', venue_court_id, 'scheduled_start_at', scheduled_start_at
  ) into v_previous
  from public.match_court_assignments
  where match_id = p_match_id and is_current;

  update public.match_court_assignments set is_current = false where match_id = p_match_id and is_current;

  insert into public.match_court_assignments (
    tournament_id, match_id, venue_court_id, court_label, scheduled_start_at, assigned_by
  )
  values (
    v_match.tournament_id, p_match_id, p_venue_court_id, v_label, p_scheduled_start_at, (select auth.uid())
  )
  returning id into v_assignment;

  perform public.log_score_event(
    v_match.tournament_id, p_match_id, 'court_assigned', v_previous,
    jsonb_build_object(
      'court_label', v_label, 'venue_court_id', p_venue_court_id, 'scheduled_start_at', p_scheduled_start_at
    )
  );

  return v_assignment;
end;
$$;

-- -----------------------------------------------------------------------------
-- Scoring
-- -----------------------------------------------------------------------------

-- Marks a ready match as being played. Returns the new version.
create or replace function public.start_match(p_match_id uuid, p_expected_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
  v_version integer;
begin
  v_match := public.lock_match_for_write(p_match_id, p_expected_version, false);

  if v_match.status <> 'scheduled' then
    raise exception 'Only a scheduled match with both teams can start' using errcode = '55000';
  end if;

  update public.matches
  set status = 'in_progress', started_at = now(), version = version + 1
  where id = p_match_id
  returning version into v_version;

  perform public.mark_division_in_progress(v_match.division_id);
  return v_version;
end;
$$;

-- Records the games played so far. A decided match becomes `completed` and waits for an
-- organizer to confirm it before the winner advances. Returns the new version.
create or replace function public.submit_match_score(
  p_match_id uuid,
  p_games jsonb,
  p_expected_version integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
  v_division public.tournament_divisions;
  v_winner public.match_slot;
  v_previous jsonb;
  v_version integer;
begin
  v_match := public.lock_match_for_write(p_match_id, p_expected_version, false);

  if v_match.confirmed_at is not null then
    raise exception 'This result is confirmed; an organizer must correct it' using errcode = '55000';
  end if;
  if v_match.status not in ('scheduled', 'in_progress', 'completed')
     or v_match.team_a_id is null or v_match.team_b_id is null then
    raise exception 'This match is not ready to be scored' using errcode = '55000';
  end if;

  select * into v_division from public.tournament_divisions where id = v_match.division_id;
  v_winner := public.evaluate_match_games(
    p_games, v_division.points_to_win, v_division.win_by, v_division.best_of
  );

  v_previous := public.match_snapshot(p_match_id);
  perform public.write_match_games(p_match_id, v_match.tournament_id, p_games);

  update public.matches
  set status = case when v_winner is null then 'in_progress' else 'completed' end::public.match_status,
      winner_team_id = case v_winner when 'a' then team_a_id when 'b' then team_b_id end,
      started_at = coalesce(started_at, now()),
      completed_at = case when v_winner is null then null else coalesce(completed_at, now()) end,
      version = version + 1
  where id = p_match_id
  returning version into v_version;

  perform public.mark_division_in_progress(v_match.division_id);
  perform public.log_score_event(
    v_match.tournament_id, p_match_id, 'score_submitted', v_previous, public.match_snapshot(p_match_id)
  );

  return v_version;
end;
$$;

-- Confirms a decided match and advances its winner. Returns the new version.
create or replace function public.confirm_match_result(p_match_id uuid, p_expected_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
  v_previous jsonb;
  v_next uuid;
  v_next_previous jsonb;
  v_version integer;
begin
  v_match := public.lock_match_for_write(p_match_id, p_expected_version, true);

  if v_match.status <> 'completed' or v_match.confirmed_at is not null then
    raise exception 'Only a finished, unconfirmed match can be confirmed' using errcode = '55000';
  end if;

  v_previous := public.match_snapshot(p_match_id);
  update public.matches
  set confirmed_at = now(), confirmed_by = (select auth.uid()), version = version + 1
  where id = p_match_id
  returning version into v_version;

  perform public.log_score_event(
    v_match.tournament_id, p_match_id, 'result_confirmed', v_previous, public.match_snapshot(p_match_id)
  );

  if v_match.next_match_id is not null then
    v_next_previous := public.match_snapshot(v_match.next_match_id);
    v_next := public.advance_match_winner(p_match_id);
    perform public.log_score_event(
      v_match.tournament_id, v_next, 'winner_advanced', v_next_previous, public.match_snapshot(v_next)
    );
  end if;

  perform public.refresh_division_completion(v_match.division_id);
  return v_version;
end;
$$;

-- Corrects a confirmed result. If the winner changes, the next match is updated too, which is
-- only possible while that match has not started. Returns the new version.
create or replace function public.correct_match_score(
  p_match_id uuid,
  p_games jsonb,
  p_expected_version integer,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches;
  v_division public.tournament_divisions;
  v_winner public.match_slot;
  v_winner_team uuid;
  v_previous jsonb;
  v_next_previous jsonb;
  v_version integer;
begin
  v_match := public.lock_match_for_write(p_match_id, p_expected_version, true);

  if nullif(btrim(p_reason), '') is null then
    raise exception 'A reason is required to correct a result' using errcode = '23514';
  end if;
  if v_match.status <> 'completed' or v_match.confirmed_at is null then
    raise exception 'Only confirmed results can be corrected; submit the score instead'
      using errcode = '55000';
  end if;

  select * into v_division from public.tournament_divisions where id = v_match.division_id;
  v_winner := public.evaluate_match_games(
    p_games, v_division.points_to_win, v_division.win_by, v_division.best_of
  );
  if v_winner is null then
    raise exception 'A corrected result must have a winner' using errcode = '23514';
  end if;
  v_winner_team := case v_winner when 'a' then v_match.team_a_id else v_match.team_b_id end;

  if v_winner_team <> v_match.winner_team_id and v_match.next_match_id is not null then
    perform 1 from public.matches n
    where n.id = v_match.next_match_id
      and n.status in ('pending', 'scheduled')
      and not exists (select 1 from public.match_games g where g.match_id = n.id)
    for update;
    if not found then
      raise exception 'The next match has already started; correct it first' using errcode = '55000';
    end if;
  end if;

  v_previous := public.match_snapshot(p_match_id);
  perform public.write_match_games(p_match_id, v_match.tournament_id, p_games);

  update public.matches
  set winner_team_id = v_winner_team, version = version + 1
  where id = p_match_id
  returning version into v_version;

  perform public.log_score_event(
    v_match.tournament_id, p_match_id, 'score_corrected', v_previous,
    public.match_snapshot(p_match_id), btrim(p_reason)
  );

  if v_winner_team <> v_match.winner_team_id and v_match.next_match_id is not null then
    v_next_previous := public.match_snapshot(v_match.next_match_id);
    perform public.advance_match_winner(p_match_id);
    perform public.log_score_event(
      v_match.tournament_id, v_match.next_match_id, 'winner_advanced', v_next_previous,
      public.match_snapshot(v_match.next_match_id), btrim(p_reason)
    );
  end if;

  return v_version;
end;
$$;

-- -----------------------------------------------------------------------------
-- Privileges. Supabase grants execute on new functions to anon and authenticated by default,
-- so revoke from those roles explicitly, not just from public.
-- -----------------------------------------------------------------------------
revoke all on function public.can_score_tournament(uuid) from public, anon;
revoke all on function public.match_snapshot(uuid) from public, anon, authenticated;
revoke all on function public.evaluate_match_games(jsonb, smallint, smallint, smallint) from public, anon, authenticated;
revoke all on function public.write_match_games(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.log_score_event(uuid, uuid, public.score_audit_action, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.advance_match_winner(uuid) from public, anon, authenticated;
revoke all on function public.mark_division_in_progress(uuid) from public, anon, authenticated;
revoke all on function public.refresh_division_completion(uuid) from public, anon, authenticated;
revoke all on function public.lock_match_for_write(uuid, integer, boolean) from public, anon, authenticated;
revoke all on function public.generate_bracket(uuid) from public, anon;
revoke all on function public.reset_bracket(uuid, text) from public, anon;
revoke all on function public.assign_match_court(uuid, text, uuid, timestamptz) from public, anon;
revoke all on function public.start_match(uuid, integer) from public, anon;
revoke all on function public.submit_match_score(uuid, jsonb, integer) from public, anon;
revoke all on function public.confirm_match_result(uuid, integer) from public, anon;
revoke all on function public.correct_match_score(uuid, jsonb, integer, text) from public, anon;

grant execute on function public.can_score_tournament(uuid) to authenticated;
grant execute on function public.generate_bracket(uuid) to authenticated;
grant execute on function public.reset_bracket(uuid, text) to authenticated;
grant execute on function public.assign_match_court(uuid, text, uuid, timestamptz) to authenticated;
grant execute on function public.start_match(uuid, integer) to authenticated;
grant execute on function public.submit_match_score(uuid, jsonb, integer) to authenticated;
grant execute on function public.confirm_match_result(uuid, integer) to authenticated;
grant execute on function public.correct_match_score(uuid, jsonb, integer, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Live updates (Supabase Realtime). Skipped where the publication does not exist.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.tournament_divisions, public.matches, public.match_games, public.match_court_assignments;
  end if;
end;
$$;
