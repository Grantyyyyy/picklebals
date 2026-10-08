/**
 * With Cache Components, `generateStaticParams` must return at least one entry. When there is no
 * published content yet, return a placeholder that resolves to `notFound()` at render time.
 */
export const PLACEHOLDER_SLUG = "__placeholder__";

export function ensureStaticParams<T extends Record<string, string>>(
  params: T[],
  placeholder: T,
): T[] {
  return params.length > 0 ? params : [placeholder];
}
