import { BookOpenIcon } from "lucide-react";

import { ArticleCard } from "@/components/learn/article-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getArticles } from "@/features/articles/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Learn pickleball — rules, tips & guides",
  description:
    "New to pickleball? Learn the rules, scoring, etiquette and techniques with beginner-friendly guides for Filipino players.",
  path: "/learn",
});

export default async function LearnPage() {
  const articles = await getArticles();

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Learn to play pickleball"
        description="Rules, scoring, etiquette and technique — explained simply."
      />
      <section aria-label="Articles" className="container-page py-12">
        {articles.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={BookOpenIcon}
            title="No articles yet"
            description="Guides for new and improving players are on the way."
          />
        )}
      </section>
    </>
  );
}
