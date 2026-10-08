import { StoreIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/shared/media-image";
import { SampleBadge } from "@/components/shared/sample-content";
import { type ShopItem, shopCategories } from "@/features/shop/data";
import { cn } from "@/lib/utils";

import { formatPrice } from "./shop-format";
import { ShopItemSheet } from "./shop-item-sheet";

const conditionLabels: Record<ShopItem["condition"], string> = {
  new: "New",
  "pre-loved": "Pre-loved",
};

export function ShopItemCard({ item, eager }: { item: ShopItem; eager?: boolean }) {
  const categoryLabel =
    shopCategories.find((category) => category.slug === item.category)?.label ?? item.category;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-court/15 bg-card p-3 transition-shadow hover:shadow-xl hover:shadow-court/10">
      <div className="relative">
        <MediaImage
          src={item.imageUrl}
          alt={item.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading={eager ? "eager" : undefined}
          className="aspect-[4/3] rounded-xl"
          label={categoryLabel}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase",
              item.condition === "new" ? "bg-ball text-court-deep" : "bg-white/95 text-court-deep",
            )}
          >
            {conditionLabels[item.condition]}
          </span>
          {item.isSample && <SampleBadge />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2 pt-4 pb-2">
        <h3 className="font-heading text-xl leading-[1.1] font-extrabold text-court-deep uppercase font-stretch-condensed">
          {item.name}
        </h3>
        {item.details && <p className="text-sm text-muted-foreground">{item.details}</p>}
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <StoreIcon className="size-3.5 shrink-0 text-court" aria-hidden="true" />
          {item.seller.clubSlug ? (
            <Link
              href={`/clubs/${item.seller.clubSlug}`}
              className="underline-offset-4 hover:text-court-deep hover:underline"
            >
              {item.seller.name}
            </Link>
          ) : (
            item.seller.name
          )}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-court/10 pt-4">
          <p className="font-heading text-2xl font-extrabold text-court-deep tabular-nums">
            {formatPrice(item.price)}
          </p>
          <ShopItemSheet item={item} categoryLabel={categoryLabel} />
        </div>
      </div>
    </article>
  );
}
