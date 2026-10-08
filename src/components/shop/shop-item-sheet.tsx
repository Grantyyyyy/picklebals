"use client";

import { CheckIcon, CopyIcon, MessageCircleIcon, StoreIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useState, useSyncExternalStore } from "react";

import { MediaImage } from "@/components/shared/media-image";
import type { ShopItem } from "@/features/shop/data";
import { cn } from "@/lib/utils";

import { ctaClassName, formatPrice } from "./shop-format";

const DESKTOP = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Right-hand drawer on desktop, bottom sheet on phones. */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

const steps = [
  "Copy the message below and send it to the seller.",
  "Agree on payment and pickup with them directly.",
  "Check the item in person before you pay.",
];

export function ShopItemSheet({ item, categoryLabel }: { item: ShopItem; categoryLabel: string }) {
  const isDesktop = useIsDesktop();
  const [copied, setCopied] = useState(false);
  const price = formatPrice(item.price);
  const message = `Hi! Is the ${item.name} (${price}) on Pickleball Hub still available?`;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the message stays visible to copy by hand.
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className={ctaClassName}>
        <MessageCircleIcon className="size-4" aria-hidden="true" />
        Ask about it
        <span className="sr-only">: {item.name}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-background text-foreground shadow-2xl shadow-ink/30 outline-none data-open:animate-in data-open:duration-300 data-open:ease-[cubic-bezier(0.16,1,0.3,1)] data-closed:animate-out data-closed:duration-200",
            isDesktop
              ? "inset-y-2 right-2 w-[28rem] rounded-[1.75rem] data-open:slide-in-from-right-full data-closed:slide-out-to-right-full"
              : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[1.75rem] data-open:slide-in-from-bottom-full data-closed:slide-out-to-bottom-full",
          )}
        >
          {!isDesktop && (
            <span
              className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-court/25"
              aria-hidden="true"
            />
          )}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            <div className="relative">
              <MediaImage
                src={item.imageUrl}
                alt={item.name}
                sizes="(min-width: 768px) 28rem, 100vw"
                className="aspect-[4/3] rounded-[1.25rem]"
                label={categoryLabel}
              />
              <Dialog.Close
                className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-ink transition-colors outline-none hover:bg-ball focus-visible:ring-3 focus-visible:ring-ring/60"
                aria-label="Close"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div className="space-y-6 px-3 pt-5 pb-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-court uppercase">
                  {categoryLabel} · {item.condition === "new" ? "New" : "Pre-loved"}
                </p>
                <Dialog.Title className="font-heading text-3xl leading-[1] font-extrabold text-court-deep uppercase font-stretch-condensed">
                  {item.name}
                </Dialog.Title>
                <p className="font-heading text-2xl font-extrabold text-court-deep tabular-nums">
                  {price}
                </p>
                <Dialog.Description className="text-sm text-muted-foreground">
                  {item.details ?? "Ask the seller for sizes and specs."}
                </Dialog.Description>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-mist p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-court-deep text-white">
                  <StoreIcon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="text-muted-foreground">Sold by</p>
                  {item.seller.clubSlug ? (
                    <Link
                      href={`/clubs/${item.seller.clubSlug}`}
                      className="font-semibold text-court-deep underline-offset-4 hover:underline"
                    >
                      {item.seller.name}
                    </Link>
                  ) : (
                    <p className="font-semibold text-court-deep">{item.seller.name}</p>
                  )}
                </div>
              </div>

              <section aria-labelledby={`${item.id}-how`} className="space-y-3">
                <h3 id={`${item.id}-how`} className="text-sm font-semibold text-court-deep">
                  How buying works
                </h3>
                <ol className="space-y-2.5 text-sm">
                  {steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-court-soft text-xs font-semibold text-court-deep tabular-nums">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-foreground/80">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-court-deep">Your message</p>
                <div className="flex items-start gap-2 rounded-2xl border border-dashed border-court/30 p-3">
                  <p className="flex-1 text-sm text-foreground/80">{message}</p>
                  <button
                    type="button"
                    onClick={copyMessage}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-court/20 px-3 text-xs font-semibold text-court-deep transition-colors outline-none hover:bg-court-soft focus-visible:ring-3 focus-visible:ring-ring/60"
                  >
                    {copied ? (
                      <CheckIcon className="size-3.5" aria-hidden="true" />
                    ) : (
                      <CopyIcon className="size-3.5" aria-hidden="true" />
                    )}
                    <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-court/10 p-4">
            {item.contactUrl ? (
              <a
                href={item.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ctaClassName, "h-12 w-full justify-center text-base")}
              >
                Message seller
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link
                href="/contact"
                className={cn(ctaClassName, "h-12 w-full justify-center text-base")}
              >
                Send through Pickleball Hub
              </Link>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
