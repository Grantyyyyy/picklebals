"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, useCarousel } from "@/components/ui/carousel";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type CityCarouselProps = {
  /** Accessible name for the carousel region, also used in the arrow labels. */
  label: string;
  /** `CarouselItem` elements, rendered on the server. */
  children: ReactNode;
  footer?: ReactNode;
};

export function CityCarousel({ label, children, footer }: CityCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Carousel
      aria-label={label}
      opts={{ align: "start", duration: reducedMotion ? 0 : 25 }}
      className="mt-8"
    >
      <CarouselContent>{children}</CarouselContent>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div>{footer}</div>
        <CarouselControls label={label.toLowerCase()} />
      </div>
    </Carousel>
  );
}

function CarouselControls({ label }: { label: string }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const buttonClass =
    "size-11 rounded-full border-court-deep/20 bg-white text-court-deep hover:bg-court-deep hover:text-white";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className={buttonClass}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label={`Previous ${label}`}
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        className={buttonClass}
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label={`Next ${label}`}
      >
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
