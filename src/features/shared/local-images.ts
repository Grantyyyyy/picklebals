import "server-only";

import { readdirSync } from "node:fs";
import { join, parse } from "node:path";

/**
 * Photos and logos saved locally for the private preview, at `public/images/<folder>/<slug>.<ext>`
 * (logos as `<slug>.logo.<ext>`, see `isLogoImage`). Credits are in `data/image-credits.md`.
 * These folders are gitignored: the images come from third-party listings and must not be
 * committed or published. Without them, cards fall back to the court illustration.
 */
type ImageFolder = "venues" | "clubs" | "events";

const cache = new Map<ImageFolder, Map<string, string>>();

function loadFolder(folder: ImageFolder): Map<string, string> {
  try {
    const files = readdirSync(join(process.cwd(), "public", "images", folder));
    return new Map(
      files
        .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
        .map((file) => [parse(file).name.replace(/\.logo$/, ""), `/images/${folder}/${file}`]),
    );
  } catch {
    return new Map();
  }
}

export function localImage(folder: ImageFolder, slug: string): string | null {
  let images = cache.get(folder);
  if (!images) {
    images = loadFolder(folder);
    cache.set(folder, images);
  }
  return images.get(slug) ?? null;
}

export function localVenueImage(slug: string): string | null {
  return localImage("venues", slug);
}
