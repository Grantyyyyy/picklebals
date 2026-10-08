/** Logos are saved as `<slug>.logo.<ext>` and are shown whole (`contain`) rather than cropped. */
export function isLogoImage(url: string | null | undefined): boolean {
  return Boolean(url && /\.logo\.[a-z0-9]+$/i.test(url));
}
