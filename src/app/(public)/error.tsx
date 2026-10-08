"use client";

import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlertIcon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-court-deep">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => retry()} className="rounded-full px-5">
          Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </section>
  );
}
