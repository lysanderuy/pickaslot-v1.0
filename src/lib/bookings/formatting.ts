// price_per_hour_cents stores PHP directly (not cents) - e.g., 200 means ₱200/hour
export function formatMoney(amount: number, currencyCode: string = "PHP"): string {
  if (currencyCode === "PHP") {
    return `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatTimeParts(value: string, timezone: string): { time: string; suffix: string } {
  const parts = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).formatToParts(new Date(value));
  const suffix = parts.find((p) => p.type === "dayPeriod")?.value ?? "";
  const time = parts
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
  return { time, suffix };
}

export function formatTimeRange(slotStart: string, slotEnd: string, timezone: string): string {
  return `${formatTime(slotStart, timezone)} – ${formatTime(slotEnd, timezone)}`;
}

export function formatClockValue(value: string): string {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}${minute > 0 ? `:${String(minute).padStart(2, "0")}` : ""}${suffix}`;
}
