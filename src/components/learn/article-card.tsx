import Link from "next/link";

import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import type { Article } from "@/types/content";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-court/10">
      <MediaImage
        src={article.imageUrl}
        alt={article.title}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/9]"
        label={article.category}
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span>
            {article.category}
            {article.readingMinutes ? ` · ${article.readingMinutes} min read` : ""}
          </span>
          {article.isSample && <SampleBadge />}
        </div>
        <h3 className="text-lg font-semibold text-court-deep">
          <Link href={`/learn/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
