const priceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPrice(pesos: number): string {
  return priceFormatter.format(pesos);
}

export const ctaClassName =
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-court-deep px-4 text-sm font-semibold text-white transition-colors hover:bg-court focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";
