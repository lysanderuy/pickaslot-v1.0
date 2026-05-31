"use client";

interface SlotDisplayProps {
  slotLabels: string | null | undefined;
  slotCount: unknown;
  timezone: string | null | undefined;
  bookingDate?: string | null;
}

/**
 * Parse slot labels string into array of { start, end } times.
 * slotLabels: "9:00 AM, 10:00 AM, 11:00 AM" (comma-separated start times)
 */
function parseSlotTimes(
  slotLabels: string | null | undefined,
  timezone: string | null | undefined,
  bookingDate?: string | null,
): Array<{ start: Date; end: Date }> | null {
  if (!slotLabels || typeof slotLabels !== "string") return null;
  const labels = slotLabels.split(",").map((s) => s.trim()).filter(Boolean);
  if (labels.length === 0) return null;

  // Parse booking date or fall back to today
  let baseDate: Date;
  if (bookingDate) {
    const [year, month, day] = bookingDate.split("-").map(Number);
    baseDate = new Date(year, (month || 1) - 1, day || 1);
  } else {
    baseDate = new Date();
  }

  const slots: Array<{ start: Date; end: Date }> = [];

  for (const label of labels) {
    const [timeStr, period] = label.split(" ");
    if (!timeStr || !period) continue;
    const [hourStr, minStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr || "0", 10);
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, min);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour slots
    slots.push({ start, end });
  }

  return slots.length > 0 ? slots : null;
}

function formatTime(d: Date): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
  const str = d.toLocaleTimeString("en-US", opts);
  return str.replace(/^0/, "").replace(/ (AM|PM)/, " $1");
}

function formatRange(r: { start: Date; end: Date }): string {
  const startStr = formatTime(r.start);
  const endStr = formatTime(r.end);
  const startPeriod = /AM|PM/.exec(startStr)?.[0];
  const endPeriod = /AM|PM/.exec(endStr)?.[0];
  if (startPeriod === endPeriod) {
    const startTime = startStr.replace(/ (AM|PM)/, "");
    return `${startTime}–${endStr}`;
  }
  return `${startStr} – ${endStr}`;
}

/**
 * Displays slot times for a booking.
 * Since bookings must be continuous, always shows a single range: "9 AM – 6 PM"
 */
export function SlotDisplay({ slotLabels, slotCount, timezone, bookingDate }: SlotDisplayProps) {
  const slots = parseSlotTimes(slotLabels, timezone, bookingDate);
  if (!slots || slots.length === 0) {
    return <span className="text-[13px] font-semibold text-slate-700">{Number(slotCount)} slot{Number(slotCount) !== 1 ? "s" : ""}</span>;
  }

  // Always continuous now - show single range
  const range = { start: slots[0].start, end: slots[slots.length - 1].end };
  return <span className="text-[13px] font-semibold text-slate-700 break-words">{formatRange(range)}</span>;
}
