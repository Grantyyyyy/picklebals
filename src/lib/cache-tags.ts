/** Cache tags used by `"use cache"` data functions. Revalidate with `revalidateTag`/`updateTag`. */
export const cacheTags = {
  cities: "cities",
  courts: "courts",
  clubs: "clubs",
  events: "events",
  articles: "articles",
} as const;
