import {
  BookOpenIcon,
  CalendarDaysIcon,
  InboxIcon,
  MapPinnedIcon,
  ShieldAlertIcon,
  UsersRoundIcon,
} from "lucide-react";
import { type ReactNode, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/features/auth/admin";
import { signOut } from "@/features/auth/actions";
import { createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata = { title: "Dashboard" };

type CountedTable = keyof Pick<
  Database["public"]["Tables"],
  "courts" | "clubs" | "events" | "articles" | "submissions"
>;

const sections: { table: CountedTable; label: string; icon: typeof MapPinnedIcon }[] = [
  { table: "courts", label: "Courts", icon: MapPinnedIcon },
  { table: "clubs", label: "Clubs", icon: UsersRoundIcon },
  { table: "events", label: "Events", icon: CalendarDaysIcon },
  { table: "articles", label: "Articles", icon: BookOpenIcon },
  { table: "submissions", label: "Submissions", icon: InboxIcon },
];

async function ContentCounts() {
  const supabase = await createSessionClient();
  if (!supabase) return null;

  const counts = await Promise.all(
    sections.map(async ({ table }) => {
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true });
      return error ? null : count;
    }),
  );

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {sections.map(({ table, label, icon: Icon }, index) => (
        <li key={table} className="rounded-2xl border bg-card p-5">
          <Icon className="size-5 text-court" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-bold text-court-deep">
            {counts[index] ?? "n/a"}
          </p>
        </li>
      ))}
    </ul>
  );
}

async function Dashboard() {
  const access = await requireAdmin();

  if (access.status === "unconfigured") {
    return (
      <Notice title="Supabase is not configured">
        Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to enable the admin area.
      </Notice>
    );
  }

  if (access.status === "forbidden") {
    return (
      <Notice title="Access denied">
        {access.email ?? "This account"} is signed in but is not an administrator.
        <form action={signOut} className="mt-4">
          <Button type="submit" variant="outline" className="rounded-full">
            Sign out
          </Button>
        </form>
      </Notice>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-court-deep">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {access.user.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="rounded-full">
            Sign out
          </Button>
        </form>
      </div>
      <ContentCounts />
      <p className="rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Content management screens (courts, clubs, events, articles and submission review) will be
        built here in the next phase.
      </p>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
      <ShieldAlertIcon className="mx-auto size-8 text-court" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-court-deep">{title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="container-page py-10">
      <Suspense
        fallback={
          <div className="space-y-4" role="status" aria-label="Loading">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-28 w-full" />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}
