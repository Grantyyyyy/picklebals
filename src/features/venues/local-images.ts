import "server-only";

import { readdirSync } from "node:fs";
import { join, parse } from "node:path";

/**
 * Venue cover photos saved locally for the private preview, named `<venue-slug>.<ext>`.
 * The folder is gitignored: the photos come from third-party listings and must not be
 * committed or published. Without the folder, venues fall back to the court illustration.
 */
const PUBLIC_DIR = "images/venues";

function loadImages(): Map<string, string> {
  try {
    const files = readdirSync(join(process.cwd(), "public", PUBLIC_DIR));
    return new Map(
      files
        .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
        .map((file) => [parse(file).name, `/${PUBLIC_DIR}/${file}`]),
    );
  } catch {
    return new Map();
  }
}

const images = loadImages();

export function localVenueImage(slug: string): string | null {
  return images.get(slug) ?? null;
}
