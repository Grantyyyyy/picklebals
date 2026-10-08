import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { sampleContent } from "@/features/sample-content/data";
import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { City } from "@/types/content";
import type { Tables } from "@/types/database";

const CITY_SELECT = "*, courts(count)" as const;

type CityRowWithCount = Tables<"cities"> & { courts: { count: number }[] };

function mapCity(row: CityRowWithCount): City {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    province: row.province,
    region: row.region,
    description: row.description,
    courtCount: row.courts[0]?.count ?? 0,
    isSample: false,
  };
}

export async function getCities(): Promise<City[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.cities, cacheTags.courts);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.cities;

  const { data, error } = await supabase
    .from("cities")
    .select(CITY_SELECT)
    .eq("status", "published")
    .order("sort_order")
    .order("name");
  throwIfError(error, "cities");
  return (data ?? []).map(mapCity);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.cities, cacheTags.courts);

  const cities = await getCities();
  return cities.find((city) => city.slug === slug) ?? null;
}
