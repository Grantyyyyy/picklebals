/**
 * Converts the curated Iligan venue seed (JSON) into idempotent SQL.
 *
 *   pnpm seed:venues                       # data/seeds/iligan_pickleball_venues_seed.json
 *   pnpm seed:venues path/to/file.json     # another input file
 *   pnpm seed:venues --check               # validate only, write nothing
 *   pnpm seed:venues --status draft        # import hidden from the public directory
 *
 * Output: supabase/seeds/iligan_venues.sql (apply with psql, the Supabase SQL editor, or
 * `supabase db reset` when listed in supabase/config.toml).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

import { prepareVenueSeed } from "../src/features/venues/seed/prepare.ts";
import { formatSeedIssues, venueSeedFileSchema } from "../src/features/venues/seed/schema.ts";
import { buildVenueSeedSql } from "../src/features/venues/seed/sql.ts";

const ROOT = resolve(import.meta.dirname, "..");
const DEFAULT_INPUT = "data/seeds/iligan_pickleball_venues_seed.json";
const DEFAULT_OUTPUT = "supabase/seeds/iligan_venues.sql";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string", default: DEFAULT_OUTPUT },
    status: { type: "string", default: "published" },
    check: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const status = values.status;
if (status !== "published" && status !== "draft") fail(`--status must be "published" or "draft"`);

const inputPath = resolve(ROOT, positionals[0] ?? DEFAULT_INPUT);
if (!existsSync(inputPath)) {
  fail(
    `Seed file not found: ${relative(ROOT, inputPath)}\n  Add it (see data/seeds/README.md for the schema) and re-run.`,
  );
}

let json: unknown;
try {
  json = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (error) {
  fail(`Invalid JSON in ${relative(ROOT, inputPath)}: ${(error as Error).message}`);
}

const parsed = venueSeedFileSchema.safeParse(json);
if (!parsed.success) {
  fail(`Seed file does not match the schema:\n  ${formatSeedIssues(parsed.error).join("\n  ")}`);
}

let seed;
try {
  seed = prepareVenueSeed(parsed.data);
} catch (error) {
  fail((error as Error).message);
}

const withAddress = seed.venues.filter((venue) => venue.address).length;
const withCoordinates = seed.venues.filter((venue) => venue.latitude !== null).length;
const withSources = seed.venues.filter((venue) => venue.sources.length > 0).length;

console.log(`Dataset ${seed.dataset} — ${seed.city.name}, ${seed.city.province}`);
console.log(
  `  ${seed.venues.length} venues · ${withAddress} with address · ${withSources} with sources · ${withCoordinates} with coordinates`,
);
if (parsed.data.demo_tournament) {
  const demo = parsed.data.demo_tournament;
  const teams = demo.divisions.reduce((total, division) => total + division.teams.length, 0);
  console.log(
    `  Demo tournament (test data): "${demo.name}" · ${demo.divisions.length} divisions · ${teams} teams`,
  );
}
for (const warning of seed.warnings) console.warn(`  ! ${warning}`);

if (values.check) {
  console.log("✓ Valid (check only, nothing written)");
  process.exit(0);
}

const outputPath = resolve(ROOT, values.out ?? DEFAULT_OUTPUT);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  buildVenueSeedSql(seed, { status, sourceFile: relative(ROOT, inputPath) }),
);
console.log(`✓ Wrote ${relative(ROOT, outputPath)} (status: ${status}, verification: unverified)`);
