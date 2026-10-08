"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { type ReactNode } from "react";

import { AutoplayToggle } from "@/components/shared/autoplay-toggle";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, useCarousel } from "@/components/ui/carousel";
import { useAutoplay } from "@/hooks/use-autoplay";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AutoCarouselProps = {
  /** Accessible name for the carousel region, also used in the control labels. */
  label: string;
  /** `CarouselItem` elements, rendered on the server. */
  children: ReactNode;
  footer?: ReactNode;
  /** Milliseconds between advances. */
  interval?: number;
};

/** A looping carousel that advances one slide at a time and pauses on hover, focus or request. */
export function AutoCarousel({ label, children, footer, interval = 5500 }: AutoCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Carousel
      aria-label={label}
      opts={{ align: "start", loop: true, duration: reducedMotion ? 0 : 32 }}
      className="mt-12"
    >
      <AutoCarouselBody label={label.toLowerCase()} footer={footer} interval={interval}>
        {children}
      </AutoCarouselBody>
    </Carousel>
  );
}

function AutoCarouselBody({
  label,
  footer,
  interval,
  children,
}: {
  label: string;
  footer?: ReactNode;
  interval: number;
  children: ReactNode;
}) {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const autoplay = useAutoplay(() => api?.scrollNext(), { interval });
  const buttonClass =
    "size-11 rounded-full border-court-deep/20 bg-white text-court-deep hover:bg-court-deep hover:text-white";

  return (
    <div {...autoplay.regionProps}>
      <CarouselContent>{children}</CarouselContent>
      <div className="mt-8 flex items-center justify-between gap-4">
        <div>{footer}</div>
        <div className="flex items-center gap-2">
          {!autoplay.disabled && (
            <AutoplayToggle
              paused={autoplay.userPaused}
              onToggle={autoplay.togglePaused}
              label={label}
              className="border border-court-deep/20 bg-white text-court-deep hover:bg-court-deep hover:text-white focus-visible:ring-ring"
            />
          )}
          <Button
            variant="outline"
            className={buttonClass}
            onClick={scrollPrev}
            aria-label={`Previous ${label}`}
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            className={buttonClass}
            onClick={scrollNext}
            aria-label={`Next ${label}`}
          >
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
