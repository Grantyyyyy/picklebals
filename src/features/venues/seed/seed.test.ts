import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { slugify } from "../../../lib/utils/slug.ts";
import { assignSlugs, prepareVenueSeed, venueSourceKey } from "./prepare.ts";
import { formatSeedIssues, type SeedVenue, venueSeedFileSchema } from "./schema.ts";
import { buildVenueSeedSql, sqlLiteral } from "./sql.ts";

const example = JSON.parse(
  readFileSync(
    new URL("../../../../data/seeds/iligan_pickleball_venues_seed.example.json", import.meta.url),
    "utf8",
  ),
);

function venue(overrides: Partial<SeedVenue> & { name: string }): SeedVenue {
  return { address: null, barangay: null, sources: [], notes: null, ...overrides };
}

describe("slugify", () => {
  it("produces lowercase ASCII hyphenated slugs", () => {
    assert.equal(slugify("Iligan City Sports Complex"), "iligan-city-sports-complex");
    assert.equal(slugify("  Pala-o  Courts!! "), "pala-o-courts");
    assert.equal(slugify("Señor Niño & Friends"), "senor-nino-and-friends");
  });
});

describe("venueSeedFileSchema", () => {
  it("accepts the documented example file", () => {
    const result = venueSeedFileSchema.safeParse(example);
    assert.equal(result.success, true);
  });

  it("strips fields that must never be imported (prices, facilities, court counts, photos)", () => {
    const result = venueSeedFileSchema.parse({
      venues: [
        {
          name: "Venue",
          price: "₱200/hr",
          facilities: ["lights"],
          court_count: 4,
          photos: ["https://example.com/a.jpg"],
          description: "Copied text",
        },
      ],
    });
    assert.deepEqual(Object.keys(result.venues[0] ?? {}).sort(), [
      "address",
      "barangay",
      "name",
      "notes",
      "sources",
    ]);
  });

  it("defaults the city to Iligan", () => {
    const result = venueSeedFileSchema.parse({ venues: [{ name: "Venue" }] });
    assert.equal(result.city.name, "Iligan");
    assert.equal(result.city.province, "Lanao del Norte");
  });

  it("reports precise paths for invalid data", () => {
    const result = venueSeedFileSchema.safeParse({
      venues: [{ name: "Venue", latitude: 8.2, sources: [{ label: "x", url: "ftp://bad" }] }],
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const issues = formatSeedIssues(result.error).join("\n");
      assert.match(issues, /venues\[0\]\.sources\[0\]\.url/);
      assert.match(issues, /venues\[0\]\.latitude: Provide both latitude and longitude/);
    }
  });

  it("rejects an empty venue list", () => {
    assert.equal(venueSeedFileSchema.safeParse({ venues: [] }).success, false);
  });
});

describe("source keys and slugs", () => {
  it("keeps source keys stable across formatting differences", () => {
    assert.equal(
      venueSourceKey({ name: "Rally Court", address: "Tibanga, Iligan City" }),
      venueSourceKey({ name: "  rally   COURT ", address: "tibanga iligan city" }),
    );
    assert.notEqual(
      venueSourceKey({ name: "Rally Court", address: "Tibanga" }),
      venueSourceKey({ name: "Rally Court", address: "Pala-o" }),
    );
  });

  it("disambiguates shared names with barangays when possible", () => {
    const slugs = assignSlugs([
      venue({ name: "City Gym", barangay: "Tibanga" }),
      venue({ name: "City Gym", barangay: "Pala-o" }),
      venue({ name: "Other Court" }),
    ]);
    assert.deepEqual(slugs, ["city-gym-tibanga", "city-gym-pala-o", "other-court"]);
  });

  it("falls back to hash suffixes and is independent of file order", () => {
    const a = venue({ name: "City Gym", address: "Address one" });
    const b = venue({ name: "City Gym", address: "Address two" });
    const forward = assignSlugs([a, b]);
    const reversed = assignSlugs([b, a]);
    assert.equal(new Set(forward).size, 2);
    assert.deepEqual(forward, [reversed[1], reversed[0]]);
    assert.match(forward[0] ?? "", /^city-gym-[0-9a-f]{6}$/);
  });

  it("honours pinned slugs", () => {
    const slugs = assignSlugs([
      venue({ name: "City Gym", slug: "city-gym" }),
      venue({ name: "City Gym", address: "Elsewhere" }),
    ]);
    assert.equal(slugs[0], "city-gym");
    assert.notEqual(slugs[1], "city-gym");
  });
});

describe("prepareVenueSeed", () => {
  it("never invents missing data and warns about gaps", () => {
    const seed = prepareVenueSeed(venueSeedFileSchema.parse(example));
    const placeholderB = seed.venues.find((item) => item.name.startsWith("Example Venue B"));
    assert.ok(placeholderB);
    assert.equal(placeholderB.address, null);
    assert.equal(placeholderB.latitude, null);
    assert.deepEqual(placeholderB.sources, []);
    assert.ok(seed.warnings.some((warning) => warning.includes("no address")));
    assert.ok(seed.warnings.some((warning) => warning.includes("no source references")));
  });

  it("preserves source references verbatim", () => {
    const seed = prepareVenueSeed(venueSeedFileSchema.parse(example));
    assert.equal(seed.venues[0]?.sources[0]?.url, "https://example.com/venue-a");
    assert.equal(seed.venues[0]?.sources[0]?.accessed_at, "2026-10-01");
  });

  it("rejects duplicate venues", () => {
    const file = venueSeedFileSchema.parse({
      venues: [
        { name: "Rally Court", address: "Tibanga" },
        { name: "rally court", address: "TIBANGA" },
      ],
    });
    assert.throws(() => prepareVenueSeed(file), /Duplicate venue/);
  });

  it("includes the dataset version in the dataset label", () => {
    const seed = prepareVenueSeed(venueSeedFileSchema.parse(example));
    assert.equal(seed.dataset, "iligan_pickleball_venues_seed_example@1");
  });
});

describe("buildVenueSeedSql", () => {
  const seed = prepareVenueSeed(venueSeedFileSchema.parse(example));
  const sql = buildVenueSeedSql(seed, { status: "published", sourceFile: "example.json" });

  it("escapes string literals", () => {
    assert.equal(sqlLiteral("O'Brien's"), "'O''Brien''s'");
    assert.equal(sqlLiteral(null), "null");
  });

  it("is idempotent and never overwrites verified venues or slugs", () => {
    assert.match(sql, /on conflict \(source_key\) do update set/);
    assert.match(sql, /where public\.venues\.verification_status = 'unverified'/);
    assert.doesNotMatch(sql, /slug = excluded\.slug/);
    assert.match(sql, /on conflict \(slug\) do nothing/);
  });

  it("imports every venue as unverified, non-test data", () => {
    assert.match(sql, /'unverified', false, 'published'::public\.content_status/);
  });

  it("can import venues hidden from the public directory", () => {
    const draft = buildVenueSeedSql(seed, { status: "draft", sourceFile: "example.json" });
    assert.match(draft, /'draft'::public\.content_status/);
  });
});
