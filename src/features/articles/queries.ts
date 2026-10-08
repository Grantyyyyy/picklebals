import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { sampleContent } from "@/features/sample-content/data";
import { throwIfError } from "@/features/shared/query";
import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { getMediaUrl } from "@/lib/supabase/storage";
import type { Article } from "@/types/content";
import type { Tables } from "@/types/database";

function mapArticle(row: Tables<"articles">): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    authorName: row.author_name,
    readingMinutes: row.reading_minutes,
    imageUrl: getMediaUrl(row.cover_image_path),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    isSample: false,
  };
}

export async function getArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.articles);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.articles;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  throwIfError(error, "articles");
  return (data ?? []).map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.articles);

  const supabase = createPublicClient();
  if (!supabase) return sampleContent.articles.find((article) => article.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  throwIfError(error, `article "${slug}"`);
  return data ? mapArticle(data) : null;
}
