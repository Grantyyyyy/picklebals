import { type LucideIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
};

export function EmptyState({
  title,
  description,
  icon: Icon = SearchXIcon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-sand px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-court-soft text-court">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-court-deep">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
