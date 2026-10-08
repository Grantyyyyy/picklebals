import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <section className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-heading text-7xl font-extrabold text-ball [-webkit-text-stroke:2px_var(--court)]">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold text-court-deep">Out of bounds</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t find that page. It may have moved or is no longer published.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full px-5">
          <Link href="/courts">Find courts</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </section>
  );
}
