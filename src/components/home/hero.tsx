import { CourtSearchForm } from "@/components/courts/court-search-form";
import { siteConfig } from "@/config/site";
import { getCities } from "@/features/cities/queries";

export async function Hero() {
  const cities = await getCities();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-court-deep text-white"
    >
      <div className="absolute inset-0 -z-10 bg-court-lines" aria-hidden="true" />
      <div
        className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-ball/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-20 -z-10 size-96 rounded-full bg-court/60 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider text-ball uppercase">
            <span className="size-1.5 rounded-full bg-ball" aria-hidden="true" />
            Now covering {siteConfig.initialRegion}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-5xl leading-[1.05] font-extrabold sm:text-6xl lg:text-7xl"
          >
            Find your next <span className="text-ball">pickleball</span> game.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/75 sm:text-xl">
            Discover courts, join local clubs, and never miss an open play or tournament near you in
            the Philippines.
          </p>
        </div>
        <CourtSearchForm cities={cities} className="mt-10 max-w-3xl" />
      </div>
    </section>
  );
}
