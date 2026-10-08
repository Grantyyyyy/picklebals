# Seed data

## `iligan_pickleball_venues_seed.json`

Curated **test** dataset of pickleball venues in Iligan City, plus a fictional demo tournament.
It is converted to idempotent SQL with:

```bash
pnpm seed:venues            # writes supabase/seeds/iligan_venues.sql
pnpm seed:venues --check    # validate only
```

`iligan_pickleball_venues_seed.example.json` shows the expected shape with placeholder values.
It is used by tests only and is never imported.

### Schema

```jsonc
{
  "dataset": {
    "name": "string",
    "version": "string | number",
    "compiled_at": "string",
    "description": "string",
  }, // optional
  "city": { "name": "Iligan", "province": "Lanao del Norte", "region": "Northern Mindanao" }, // optional, defaults to Iligan
  "venues": [
    {
      "name": "string", // required
      "slug": "string", // optional: pin a slug; otherwise derived from the name
      "address": "string | null",
      "barangay": "string | null",
      "latitude": "number | null", // only if present in a source; both or neither
      "longitude": "number | null",
      "sources": [
        // provenance kept for review
        {
          "label": "string",
          "url": "https://…",
          "type": "string",
          "accessed_at": "YYYY-MM-DD",
          "note": "string",
        },
      ],
      "notes": "string | null", // curator notes, stored in venues.data_notes
    },
  ],
  "demo_tournament": {
    // optional; always imported as test data
    "name": "string",
    "slug": "string",
    "description": "string",
    "organizer_name": "string",
    "venue_name": "string",
    "starts_at": "ISO 8601 string",
    "divisions": [
      {
        "name": "string",
        "category": "mens_singles | womens_singles | mens_doubles | womens_doubles | mixed_doubles | open | custom",
        "skill_label": "string",
        "format": "round_robin | single_elimination",
        "teams": [{ "name": "string", "players": ["string", "string?"] }],
      },
    ],
  },
}
```

### Import rules

- Imported venues are always `verification_status = 'unverified'`. The public site labels them
  as unverified and keeps them out of the sitemap and structured data until an admin verifies them.
- Only names, addresses, barangays, coordinates present in the source, curator notes and source
  references are imported. **Prices, facilities, court counts, photos and descriptions are never
  imported**: unknown keys are stripped during validation.
- Slugs are deterministic. A name shared by several venues gets a barangay or short-hash suffix,
  and slugs are never changed on re-import.
- Each venue has a stable `source_key` (a hash of its normalized name and address). Re-running
  the SQL inserts new venues and refreshes provenance on still-unverified ones, but never touches
  verified records or admin-curated fields.
- No scraping: the dataset is compiled by hand from sources that allow it.
