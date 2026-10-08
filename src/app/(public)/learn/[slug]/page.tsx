import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleBody } from "@/components/learn/article-body";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getArticles } from "@/features/articles/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { formatPublishedDate } from "@/lib/utils/format";
import { ensureStaticParams, PLACEHOLDER_SLUG } from "@/lib/utils/static-params";

export async function generateStaticParams() {
  const articles = await getArticles();
  return ensureStaticParams(
    articles.map((article) => ({ slug: article.slug })),
    { slug: PLACEHOLDER_SLUG },
  );
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return buildMetadata({
      title: "Article not found",
      description: "",
      path: "/learn",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? article.title,
    path: `/learn/${article.slug}`,
    image: article.imageUrl,
    type: "article",
  });
}

async function ArticleDetail({ params }: Pick<PageProps<"/learn/[slug]">, "params">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const published = formatPublishedDate(article.publishedAt);

  return (
    <article className="container-page max-w-3xl py-10 sm:py-14">
      {!article.isSample && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt ?? undefined,
            image: article.imageUrl ?? undefined,
            datePublished: article.publishedAt ?? undefined,
            dateModified: article.updatedAt,
            author: { "@type": "Person", name: article.authorName ?? siteConfig.name },
            publisher: { "@type": "Organization", name: siteConfig.name },
            mainEntityOfPage: absoluteUrl(`/learn/${article.slug}`),
          }}
        />
      )}
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: article.title, path: `/learn/${article.slug}` },
        ]}
      />
      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-court">
          <span>{article.category}</span>
          {article.isSample && <SampleBadge />}
        </div>
        <h1 className="text-4xl font-bold text-court-deep sm:text-5xl">{article.title}</h1>
        {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
        <p className="text-sm text-muted-foreground">
          {[
            article.authorName,
            published,
            article.readingMinutes ? `${article.readingMinutes} min read` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      <MediaImage
        src={article.imageUrl}
        alt={article.title}
        sizes="(min-width: 768px) 768px, 100vw"
        preload
        className="mt-8 aspect-[16/9] rounded-3xl"
      />
      <div className="mt-10">
        <ArticleBody body={article.body} />
      </div>
    </article>
  );
}

export default function ArticleDetailPage({ params }: PageProps<"/learn/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ArticleDetail params={params} />
    </Suspense>
  );
}
