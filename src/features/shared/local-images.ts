/**
 * Photos and logos committed at `public/images/<folder>/<file>` (logos as `<slug>.logo.<ext>`).
 * Credits are in `data/image-credits.md` and on the /credits page.
 *
 * Listed here rather than read from disk: on serverless hosts `public/` is served from the CDN
 * and is not part of the server bundle, so a runtime directory read finds nothing. Add a file
 * to the folder and to this list together.
 */
type ImageFolder = "venues" | "clubs" | "events";

const files: Record<ImageFolder, string[]> = {
  venues: [
    "jm-s-dink-n-drive.jpeg",
    "kingple-dink-yard.jpg",
    "kmpnd.webp",
    "la-pickleball-court.webp",
    "meadow-rally.webp",
    "pal-pickleball-homecourt.webp",
    "siradj-pickleball.jpeg",
    "sweat-rally.jpg",
  ],
  clubs: [
    "iligan-third-shot-society.jpg",
    "lanao-kitchen-club.jpg",
    "majestic-falls-picklers.jpg",
    "match-point-pickleball-club.logo.webp",
  ],
  events: [
    "beginner-clinic-iligan.jpg",
    "friday-night-social-mixer.jpg",
    "iligan-doubles-classic.jpg",
    "iligan-weekend-open-play.jpg",
  ],
};

const bySlug = new Map(
  Object.entries(files).map(([folder, names]) => [
    folder,
    new Map(
      names.map((file) => [file.replace(/(\.logo)?\.[^.]+$/, ""), `/images/${folder}/${file}`]),
    ),
  ]),
);

export function localImage(folder: ImageFolder, slug: string): string | null {
  return bySlug.get(folder)?.get(slug) ?? null;
}

export function localVenueImage(slug: string): string | null {
  return localImage("venues", slug);
}
