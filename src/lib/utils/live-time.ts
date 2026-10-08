import { siteConfig } from "@/config/site";

/**
 * Time-relative labels ("Happening now", "Open now", "Plays tonight").
 * Pure functions of `now`; call them only in the browser so cached pages
 * never freeze a stale label into their HTML.
 */

const MINUTE = 60_000;
const DEFAULT_EVENT_LENGTH = 3 * 60 * MINUTE;
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type LocalTime = { dayIndex: number; dayNumber: number; minutes: number };

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

/** Wall-clock day and minute-of-day in the site's time zone. */
function toLocal(date: Date): LocalTime {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const dayIndex = DAY_KEYS.indexOf(parts.weekday.toLowerCase().slice(0, 3) as never);
  const dayNumber = Math.floor(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000,
  );
  return { dayIndex, dayNumber, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function formatClock(minutes: number): string {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const hour12 = hour24 % 12 || 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return minute ? `${hour12}:${String(minute).padStart(2, "0")} ${suffix}` : `${hour12} ${suffix}`;
}

/* ---------- Events ---------- */

export type EventTiming = { label: string; tone: "live" | "soon" | "upcoming" };

export function getEventTiming(
  startsAt: string,
  endsAt: string | null,
  now: Date,
): EventTiming | null {
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + DEFAULT_EVENT_LENGTH;
  const current = now.getTime();

  if (current >= end) return null;
  if (current >= start) return { label: "Happening now", tone: "live" };

  const minutesAway = Math.round((start - current) / MINUTE);
  if (minutesAway <= 90)
    return { label: `Starts in ${Math.max(minutesAway, 1)} min`, tone: "soon" };

  const today = toLocal(now);
  const startLocal = toLocal(new Date(startsAt));
  const daysAway = startLocal.dayNumber - today.dayNumber;

  if (daysAway === 0) {
    return { label: startLocal.minutes >= 17 * 60 ? "Tonight" : "Today", tone: "soon" };
  }
  if (daysAway === 1) return { label: "Tomorrow", tone: "soon" };

  const daysUntilSunday = (7 - today.dayIndex) % 7;
  const isWeekend = startLocal.dayIndex === 0 || startLocal.dayIndex === 6;
  if (isWeekend && daysAway <= daysUntilSunday) return { label: "This weekend", tone: "upcoming" };
  if (daysAway <= 13) return { label: `In ${daysAway} days`, tone: "upcoming" };
  return null;
}

/* ---------- Opening hours ---------- */

type Range = { open: number; close: number };
type Schedule = { days: Set<number>; ranges: Range[] };

const TIME = String.raw`(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?`;
const RANGE_PATTERN = new RegExp(`${TIME}\\s*(?:–|—|-|to)\\s*${TIME}`, "gi");

function toMinutes(hour: string, minute: string | undefined, meridiem: string): number {
  const base = Number(hour) % 12;
  return (base + (meridiem.toLowerCase() === "p" ? 12 : 0)) * 60 + Number(minute ?? 0);
}

function dayIndexOf(token: string): number {
  return DAY_KEYS.indexOf(token.toLowerCase().slice(0, 3) as never);
}

function parseDays(text: string): Set<number> | null {
  const lowered = text.toLowerCase();
  if (/daily|every\s*day|everyday|7\s*days/.test(lowered)) return new Set([0, 1, 2, 3, 4, 5, 6]);
  if (/weekdays/.test(lowered)) return new Set([1, 2, 3, 4, 5]);
  if (/weekends/.test(lowered)) return new Set([0, 6]);

  const days = new Set<number>();
  const dayWord = String.raw`(sun|mon|tue|wed|thu|fri|sat)[a-z]*`;
  const rangeRe = new RegExp(`${dayWord}\\s*(?:–|—|-|to)\\s*${dayWord}`, "gi");
  let rest = lowered;
  for (const match of lowered.matchAll(rangeRe)) {
    const from = dayIndexOf(match[1]);
    const to = dayIndexOf(match[2]);
    for (let day = from; ; day = (day + 1) % 7) {
      days.add(day);
      if (day === to) break;
    }
    rest = rest.replace(match[0], " ");
  }
  for (const match of rest.matchAll(new RegExp(dayWord, "gi"))) days.add(dayIndexOf(match[1]));
  return days.size ? days : null;
}

/** Parses e.g. "Daily, 5:30 AM – 9:00 AM and 3:30 PM – 7:00 PM" or "Mon–Fri, 5 PM – 10 PM". */
export function parseOpeningHours(text: string): Schedule | null {
  const ranges = [...text.matchAll(RANGE_PATTERN)].map((match) => ({
    open: toMinutes(match[1], match[2], match[3]),
    close: toMinutes(match[4], match[5], match[6]),
  }));
  if (!ranges.length) return null;
  const firstTime = text.search(RANGE_PATTERN);
  const days = parseDays(text.slice(0, firstTime)) ?? parseDays(text);
  return days ? { days, ranges } : null;
}

export type OpenStatus = { open: boolean; closingSoon: boolean; label: string };

const ALL_DAY = /\b(open\s*)?24\s*(hours|hrs|\/\s*7)\b|\b24\/7\b/i;

export function getOpenStatus(hours: string, now: Date): OpenStatus | null {
  if (ALL_DAY.test(hours)) return { open: true, closingSoon: false, label: "Open 24 hours" };
  const schedule = parseOpeningHours(hours);
  if (!schedule) return null;
  const { dayIndex, minutes } = toLocal(now);

  // A range that runs past midnight (e.g. 5 AM – 2 AM) is still open early the next morning.
  const yesterday = (dayIndex + 6) % 7;
  if (schedule.days.has(yesterday)) {
    for (const { open, close } of schedule.ranges) {
      if (close <= open && minutes < close) {
        const closingSoon = close - minutes <= 60;
        return {
          open: true,
          closingSoon,
          label: `${closingSoon ? "Closes soon" : "Open now"} · until ${formatClock(close)}`,
        };
      }
    }
  }

  if (schedule.days.has(dayIndex)) {
    for (const { open, close } of schedule.ranges) {
      const end = close <= open ? close + 24 * 60 : close;
      if (minutes >= open && minutes < end) {
        const closingSoon = end - minutes <= 60;
        return {
          open: true,
          closingSoon,
          label: `${closingSoon ? "Closes soon" : "Open now"} · until ${formatClock(end)}`,
        };
      }
    }
    const laterToday = schedule.ranges.find(({ open }) => open > minutes);
    if (laterToday) {
      return {
        open: false,
        closingSoon: false,
        label: `Closed · opens ${formatClock(laterToday.open)}`,
      };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (dayIndex + offset) % 7;
    if (!schedule.days.has(day)) continue;
    const opens = formatClock(schedule.ranges[0].open);
    const when = offset === 1 ? "tomorrow" : DAY_NAMES[day];
    return { open: false, closingSoon: false, label: `Closed · opens ${when} ${opens}` };
  }
  return null;
}

/* ---------- Club meetups ---------- */

const SINGLE_TIME = new RegExp(TIME, "i");

/** "Tuesdays & Thursdays, 6:00 PM" → "Plays tonight · 6 PM" / "Next game Thu · 6 PM". */
export function getNextMeetup(schedule: string, now: Date): string | null {
  const days = parseDays(schedule);
  const time = schedule.match(SINGLE_TIME);
  if (!days || !time) return null;
  const start = toMinutes(time[1], time[2], time[3]);
  const { dayIndex, minutes } = toLocal(now);
  const clock = formatClock(start);

  for (let offset = 0; offset <= 7; offset++) {
    const day = (dayIndex + offset) % 7;
    if (!days.has(day)) continue;
    if (offset === 0) {
      if (minutes >= start + 180) continue;
      if (minutes >= start) return "Playing right now";
      return `Plays ${start >= 17 * 60 ? "tonight" : "today"} · ${clock}`;
    }
    return `Next game ${offset === 1 ? "tomorrow" : DAY_NAMES[day]} · ${clock}`;
  }
  return null;
}
