import { SearchIcon } from "lucide-react";
import Form from "next/form";

import { selectClassName } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VenueSearchFormProps = {
  barangays: string[];
  defaultQuery?: string;
  defaultBarangay?: string;
};

/** GET form: keeps filters in the URL and works without JavaScript; with it, results update in place. */
export function VenueSearchForm({
  barangays,
  defaultQuery,
  defaultBarangay,
}: VenueSearchFormProps) {
  return (
    <Form
      action="/venues"
      scroll={false}
      role="search"
      aria-label="Search venues"
      className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="venue-q" className="px-1 text-xs text-muted-foreground">
          Venue name or address
        </Label>
        <Input
          id="venue-q"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="e.g. sports complex"
          maxLength={80}
          className="h-10"
        />
      </div>
      {barangays.length > 0 && (
        <div className="space-y-1.5 sm:w-56">
          <Label htmlFor="venue-barangay" className="px-1 text-xs text-muted-foreground">
            Barangay
          </Label>
          <select
            id="venue-barangay"
            name="barangay"
            defaultValue={defaultBarangay ?? ""}
            className={`${selectClassName} h-10`}
          >
            <option value="">All barangays</option>
            {barangays.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
      )}
      <Button type="submit" className="h-10 rounded-full px-5">
        <SearchIcon aria-hidden="true" />
        Search
      </Button>
    </Form>
  );
}
