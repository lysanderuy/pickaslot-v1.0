import { DAYS, MONTHS_SHORT } from "./constants";
import { sameDay } from "./sameDay";

export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function dateLabel(date: Date): string {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const prefix = sameDay(date, today) ? "Today" : sameDay(date, tomorrow) ? "Tomorrow" : DAYS[date.getDay()];
  return `${prefix}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

export function slotDateLabel(bookingDate: string): string {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [y, m, d] = bookingDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}
