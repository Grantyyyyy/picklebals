"use client";

import { ArrowUpRightIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { AutoplayToggle } from "@/components/shared/autoplay-toggle";
import { useAutoplay } from "@/hooks/use-autoplay";
import { cn } from "@/lib/utils";

export type HeroSlide = { src: string; name: string; area: string; href: string };

const INTERVAL = 6500;

/**
 * The hero stage with real court photos crossfading behind the content. Each photo slowly
 * pushes in while it is on screen; a caption names the venue and links to it.
 */
export function HeroSlideshow({
  slides,
  className,
  children,
}: {
  slides: HeroSlide[];
  className?: string;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const autoplay = useAutoplay(() => setIndex((current) => (current + 1) % slides.length), {
    interval: INTERVAL,
    pauseOnHover: false,
  });
  const current = slides[index];

  return (
    <div className={className} {...autoplay.regionProps}>
      <div
        className="absolute inset-x-0 -inset-y-[14%] -z-20 parallax-y [--parallax:9%]"
        aria-hidden="true"
      >
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                preload={slideIndex === 0}
                sizes="(min-width: 1280px) 1216px, 100vw"
                className={cn(
                  "object-cover transition-transform ease-linear",
                  active && autoplay.running
                    ? "scale-[1.07] duration-[7000ms]"
                    : "scale-100 duration-[1400ms]",
                )}
              />
            </div>
          );
        })}
      </div>
      <div
        className="absolute inset-0 -z-10 bg-linear-to-r from-ink/90 via-ink/65 to-ink/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-ink/70 to-transparent"
        aria-hidden="true"
      />

      {children}

      <div className="flex items-center gap-3 px-5 pb-6 sm:px-10 sm:pb-8 lg:absolute lg:right-8 lg:bottom-8 lg:p-0">
        <Link
          href={current.href}
          className="group flex min-w-0 items-center gap-2 rounded-full bg-ink/60 py-2 pr-3 pl-3.5 text-sm text-white ring-1 ring-white/15 backdrop-blur-md transition-colors outline-none hover:bg-ink/80 focus-visible:ring-3 focus-visible:ring-ball/70"
        >
          <MapPinIcon className="size-4 shrink-0 text-ball" aria-hidden="true" />
          <span className="truncate">
            <span className="font-semibold">{current.name}</span>
            <span className="text-white/65"> · {current.area}</span>
          </span>
          <ArrowUpRightIcon
            className="size-4 shrink-0 text-ball transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
        {slides.length > 1 && (
          <>
            <ol className="hidden items-center gap-1.5 sm:flex" aria-label="Court photos">
              {slides.map((slide, slideIndex) => (
                <li key={slide.src}>
                  <button
                    type="button"
                    onClick={() => setIndex(slideIndex)}
                    aria-label={`Show ${slide.name}`}
                    aria-current={slideIndex === index ? "true" : undefined}
                    className="group flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ball/70"
                  >
                    <span
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        slideIndex === index
                          ? "w-5 bg-ball"
                          : "w-1.5 bg-white/45 group-hover:bg-white/80",
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            {!autoplay.disabled && (
              <AutoplayToggle
                paused={autoplay.userPaused}
                onToggle={autoplay.togglePaused}
                label="court photos"
                className="bg-ink/60 text-white ring-1 ring-white/15 backdrop-blur-md hover:bg-ink/80 focus-visible:ring-ball/70"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
