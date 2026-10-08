const MAX_SLUG_LENGTH = 80;

/** URL slug: lowercase ASCII words joined by hyphens ("Barangay Pala-o" → "barangay-pala-o"). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

/** Case-, accent- and whitespace-insensitive form used to compare names and addresses. */
export function normalizeForKey(input: string | null | undefined): string {
  return (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
