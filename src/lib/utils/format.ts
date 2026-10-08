import { siteConfig } from "@/config/site";
import type { CourtEnvironment, EventType } from "@/types/content";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: siteConfig.timeZone,
});

const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: siteConfig.timeZone,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  timeZone: siteConfig.timeZone,
});

export function formatEventDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatEventTime(startIso: string, endIso: string | null): string {
  const start = timeFormatter.format(new Date(startIso));
  return endIso ? `${start} – ${timeFormatter.format(new Date(endIso))}` : start;
}

export function formatDateParts(iso: string): { month: string; day: string } {
  const [month = "", day = ""] = shortDateFormatter.format(new Date(iso)).split(" ");
  return { month, day };
}

export function formatPublishedDate(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleDateString("en-PH", { dateStyle: "long" }) : null;
}

export const environmentLabels: Record<CourtEnvironment, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  covered: "Covered",
};

export const eventTypeLabels: Record<EventType, string> = {
  tournament: "Tournament",
  open_play: "Open play",
  clinic: "Clinic",
  league: "League",
  social: "Social",
};

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
