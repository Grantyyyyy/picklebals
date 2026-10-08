import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { siteConfig } from "@/config/site";
import {
  getShopItems,
  isShopCategory,
  type ShopCategory,
  shopCategories,
} from "@/features/shop/data";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/utils/format";

const { city } = siteConfig.market;

export const metadata = buildMetadata({
  title: `Pickleball gear for sale in ${city}`,
  description: `Paddles, jerseys, court shoes and balls sold by ${city} clubs and court owners. Message the seller directly to buy.`,
  path: "/shop",
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function CategoryFilter({ active }: { active: ShopCategory | undefined }) {
  const options = [{ slug: undefined, label: "All gear" }, ...shopCategories];
  return (
    <nav aria-label="Shop categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2">
        {options.map((option) => {
          const isActive = option.slug === active;
          return (
            <li key={option.label}>
              <Link
                href={option.slug ? `/shop?category=${option.slug}` : "/shop"}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
                  isActive
                    ? "border-court-deep bg-court-deep text-white"
                    : "border-court/20 bg-card text-court-deep hover:border-court/50 hover:bg-court-soft",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

async function ShopResults({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const requested = firstParam((await searchParams).category);
  const category = isShopCategory(requested) ? requested : undefined;
  const items = getShopItems(category);

  return (
    <>
      <CategoryFilter active={category} />
      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {pluralize(items.length, "item")} for sale
      </p>
      <div className="mt-4">
        {items.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li key={item.id}>
                <ShopItemCard item={item} eager={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ShoppingBagIcon}
            title="Nothing in this category yet"
            description="Check back soon, or browse everything for sale."
            action={{ label: "Show all gear", href: "/shop" }}
          />
        )}
      </div>
    </>
  );
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <>
      <PageHeader
        title="Gear from the local game"
        description={`Paddles, club jerseys and court shoes sold by ${city} clubs and court owners. Message the seller to buy. Payment and pickup are arranged with them directly.`}
      />
      <section aria-label="Items for sale" className="container-page py-12">
        <Suspense
          fallback={
            <>
              <CategoryFilter active={undefined} />
              <div className="mt-12">
                <CardGridSkeleton />
              </div>
            </>
          }
        >
          <ShopResults searchParams={searchParams} />
        </Suspense>
      </section>
      <section aria-labelledby="sell-gear" className="container-page pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12">
          <div className="absolute inset-0 bg-court-grain opacity-40" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-3">
              <h2
                id="sell-gear"
                className="font-heading text-4xl leading-[0.95] font-extrabold uppercase font-stretch-condensed sm:text-5xl"
              >
                Selling jerseys or paddles?
              </h2>
              <p className="text-white/75">
                Clubs and court owners can list merch and gear here for free. Tell us what you sell
                and how buyers should reach you.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-ball px-5 font-semibold text-court-deep transition-colors hover:bg-ball/85 focus-visible:ring-3 focus-visible:ring-ball/50 focus-visible:outline-none md:self-auto"
            >
              List your gear
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
