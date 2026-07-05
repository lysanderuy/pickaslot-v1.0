import { DAYS, MONTHS_SHORT } from "./constants";
import { sameDay } from "./sameDay";

/**
 * Fallback timezone for the degraded path where the court record cannot be
 * loaded at all. The court's `timezone` column is the real source of truth for
 * "today"; this only keeps the fallback on Cebu time (UTC+8) instead of the
 * server's UTC clock. The app serves Cebu courts only, and the Philippines
 * observes no daylight saving, so this offset never shifts.
 */
export const DEFAULT_TIME_ZONE = "Asia/Manila";

/**
 * "Today" at local midnight, computed as the calendar day in `timeZone` rather
 * than the runtime's own zone. Deriving it from an explicit timezone keeps the
 * value identical on a UTC server (Vercel) and a client in another zone,
 * avoiding hydration mismatches and wrong-date query keys. The timezone is
 * required so a runtime-local "today" can never be reintroduced by accident.
 */
export function getToday(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(part("year"), part("month") - 1, part("day"));
}

export function dateLabel(date: Date, timeZone: string): string {
  const today = getToday(timeZone);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const prefix = sameDay(date, today) ? "Today" : sameDay(date, tomorrow) ? "Tomorrow" : DAYS[date.getDay()];
  return `${prefix}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}
