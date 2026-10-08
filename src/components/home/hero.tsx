import { ArrowRightIcon } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { CourtSearchForm } from "@/components/courts/court-search-form";
import { SplitText } from "@/components/reactbits/split-text";
import { siteConfig } from "@/config/site";
import { getCities } from "@/features/cities/queries";

type HeroImage = { src: string | StaticImageData; alt: string };

export async function Hero({ image }: { image?: HeroImage }) {
  const cities = await getCities();

  return (
    <section aria-labelledby="hero-title" className="container-page pt-4 pb-14 sm:pt-6 sm:pb-20">
      <div className="@container relative isolate overflow-hidden rounded-[2rem] bg-court-deep text-white">
        {image ? (
          <>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              preload
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="-z-20 object-cover"
            />
            <div
              className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/55 to-ink/30"
              aria-hidden="true"
            />
          </>
        ) : (
          <HeroBackdrop />
        )}

        <div className="px-5 pt-10 pb-8 sm:px-10 sm:pt-14 sm:pb-12 lg:px-14 lg:pt-16 lg:pb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider text-ball uppercase">
            <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
            Now covering {siteConfig.initialRegion}
          </p>
          <h1 id="hero-title" className="mt-5">
            <SplitText
              text="Pickleball"
              className="block font-heading text-[clamp(2.4rem,15.5cqi,12.5rem)] leading-[0.85] font-extrabold tracking-[-0.02em] uppercase font-stretch-condensed"
            />
            <span className="mt-4 block font-sans text-2xl font-bold text-pretty sm:text-3xl">
              Find your next game<span className="text-ball">.</span>
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-pretty text-white/85 sm:text-lg">
            Discover courts, join local clubs, and never miss an open play or tournament near you in
            the Philippines.
          </p>
          <CourtSearchForm cities={cities} idPrefix="hero-search" className="mt-8 max-w-3xl" />
          <div className="mt-5 flex flex-wrap gap-3">
            <HeroLink href="/events">Upcoming events</HeroLink>
            <HeroLink href="/clubs">Find a club</HeroLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-11 items-center gap-1.5 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ball/70"
    >
      {children}
      <ArrowRightIcon
        className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 bg-court-gradient" aria-hidden="true">
      <div className="absolute inset-0 bg-court-grain opacity-70" />
      <svg
        viewBox="0 0 440 200"
        preserveAspectRatio="xMaxYMax meet"
        className="absolute right-0 bottom-0 hidden h-[70%] w-auto max-w-[60%] stroke-white/15 lg:block"
        fill="none"
        strokeWidth="2"
      >
        <rect x="20" y="20" width="400" height="160" />
        <line x1="220" y1="20" x2="220" y2="180" />
        <line x1="156" y1="20" x2="156" y2="180" />
        <line x1="284" y1="20" x2="284" y2="180" />
        <line x1="20" y1="100" x2="156" y2="100" />
        <line x1="284" y1="100" x2="420" y2="100" />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="absolute -right-12 -bottom-16 hidden size-72 animate-ball-drop lg:block xl:right-8 xl:bottom-10 xl:size-64"
      >
        <circle cx="50" cy="50" r="48" className="fill-ball" />
        <g data-scroll-spin className="origin-center fill-court-deep/25 [transform-box:view-box]">
          <circle cx="32" cy="32" r="5" />
          <circle cx="68" cy="32" r="5" />
          <circle cx="50" cy="50" r="5" />
          <circle cx="32" cy="68" r="5" />
          <circle cx="68" cy="68" r="5" />
          <circle cx="50" cy="16" r="4" />
          <circle cx="50" cy="84" r="4" />
          <circle cx="16" cy="50" r="4" />
          <circle cx="84" cy="50" r="4" />
        </g>
      </svg>
    </div>
  );
}
