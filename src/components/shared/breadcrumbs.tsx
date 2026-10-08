import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { type BreadcrumbItem, breadcrumbJsonLd } from "@/lib/seo";

import { JsonLd } from "./json-ld";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-medium text-court-deep">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-court-deep">
                    {item.name}
                  </Link>
                  <ChevronRightIcon className="size-3.5" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
