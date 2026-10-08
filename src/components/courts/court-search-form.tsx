import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { City } from "@/types/content";

type CourtSearchFormProps = {
  cities: City[];
  defaultQuery?: string;
  defaultCity?: string;
  className?: string;
};

/** Plain GET form: works without JavaScript and produces shareable `/courts?q=&city=` URLs. */
export function CourtSearchForm({
  cities,
  defaultQuery,
  defaultCity,
  className,
}: CourtSearchFormProps) {
  return (
    <form
      action="/courts"
      method="get"
      role="search"
      aria-label="Search courts"
      className={cn(
        "flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-court-deep/20 sm:flex-row sm:items-center",
        className,
      )}
    >
      <label htmlFor="court-search-q" className="sr-only">
        Court name
      </label>
      <div className="relative flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="court-search-q"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="Search courts by name"
          maxLength={80}
          className="h-12 border-0 pl-10 text-base text-foreground shadow-none focus-visible:ring-0 md:text-base"
        />
      </div>
      <label htmlFor="court-search-city" className="sr-only">
        City
      </label>
      <select
        id="court-search-city"
        name="city"
        defaultValue={defaultCity ?? ""}
        className="h-12 rounded-xl border-0 bg-muted px-3 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
      >
        <option value="">All cities</option>
        {cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base">
        Find courts
      </Button>
    </form>
  );
}
