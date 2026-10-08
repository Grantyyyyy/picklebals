#!/usr/bin/env bash
# Applies every migration and seed to a throwaway local Postgres cluster, then runs the SQL
# tests in supabase/tests/*.test.sql. Requires Postgres binaries (initdb, pg_ctl, psql) on PATH.
#
#   pnpm db:test
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d -t pbhub-db-XXXXXX)"
PORT="${PBHUB_TEST_PG_PORT:-54329}"
export PGHOST="$WORK" PGPORT="$PORT" PGUSER=postgres PGDATABASE=postgres

cleanup() {
  pg_ctl -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

for bin in initdb pg_ctl psql; do
  command -v "$bin" >/dev/null || { echo "error: '$bin' not found on PATH" >&2; exit 1; }
done

initdb -D "$WORK/data" -U postgres --auth=trust >/dev/null
pg_ctl -D "$WORK/data" -o "-k $WORK -p $PORT -c listen_addresses=''" -l "$WORK/pg.log" -w start >/dev/null

run() { psql -X -q -v ON_ERROR_STOP=1 "$@"; }

echo "→ Supabase stubs"
run -f "$ROOT/supabase/tests/support/supabase_stubs.sql"

for file in "$ROOT"/supabase/migrations/*.sql; do
  echo "→ migration $(basename "$file")"
  run -f "$file"
done

echo "→ seed.sql"
run -f "$ROOT/supabase/seed.sql"
for file in "$ROOT"/supabase/seeds/*.sql; do
  [ -e "$file" ] || continue
  echo "→ seed $(basename "$file") (applied twice to check idempotency)"
  run -f "$file"
  run -f "$file"
done

echo "→ venue seed SQL generated from the example fixture (applied twice)"
node "$ROOT/scripts/import-venue-seed.ts" "$ROOT/data/seeds/iligan_pickleball_venues_seed.example.json" \
  --out "$WORK/example_venues.sql" >/dev/null
run -f "$WORK/example_venues.sql"
run -f "$WORK/example_venues.sql"
# Simulate an admin verifying and editing one venue, then re-import: it must stay untouched.
run -c "update public.venues set verification_status = 'verified', verified_at = now(), name = 'Admin Edited Name'
        where name = 'Example Venue A (placeholder)';"
run -f "$WORK/example_venues.sql"

status=0
for file in "$ROOT"/supabase/tests/*.test.sql; do
  [ -e "$file" ] || continue
  if run -f "$file" >"$WORK/out.log" 2>&1; then
    echo "✓ $(basename "$file")"
  else
    echo "✗ $(basename "$file")"
    sed 's/^/    /' "$WORK/out.log"
    status=1
  fi
done

exit "$status"
