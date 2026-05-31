import { BadRequestError } from "@/lib/errors";
import type { Court } from "@/types/bookings";

/**
 * Validates that the court exists and is accepting bookings.
 */
export function validateCourt(court: Court | null) {
  if (!court) {
    throw new BadRequestError("Court not found");
  }

  if (!court.isAcceptingBookings) {
    throw new BadRequestError("Court is closed for bookings");
  }

  return court;
}

/**
 * Validates that at least one slot is selected.
 */
export function validateSlotSelection(slotStarts: string[]) {
  if (!slotStarts || slotStarts.length === 0) {
    throw new BadRequestError("Select at least one slot");
  }
}

/**
 * Validates that no selected slot has already ended.
 */
export function validateSlotsNotEnded(slotStarts: Date[]) {
  const now = new Date();
  for (const slotStart of slotStarts) {
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // +1 hour
    if (slotEnd <= now) {
      throw new BadRequestError("Selected slot has already ended");
    }
  }
}

/**
 * Validates that slots are continuous (consecutive hours without gaps).
 */
export function validateSlotsContinuous(slotStarts: Date[]) {
  if (slotStarts.length <= 1) {
    return;
  }

  const sorted = [...slotStarts].sort((a, b) => a.getTime() - b.getTime());

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const diff = next.getTime() - current.getTime();

    if (diff > 60 * 60 * 1000) { // More than 1 hour gap
      throw new BadRequestError("Slots must be continuous (consecutive hours without gaps)");
    }
  }
}

/**
 * Validates that all slots fall within court operating hours.
 * Handles overnight hours (e.g., open 6 PM - close 2 AM).
 */
export function validateSlotsWithinHours(
  slotStarts: Date[],
  court: Pick<Court, "timezone" | "openTime" | "closeTime">
) {
  const openTime = parseTime(court.openTime);
  const closeTime = parseTime(court.closeTime);
  const openMinutes = openTime.hours * 60 + openTime.minutes;
  const closeMinutes = closeTime.hours * 60 + closeTime.minutes;
  const isOvernight = openMinutes >= closeMinutes;

  for (const slotStart of slotStarts) {
    // Convert slot to court local time
    const slotTime = toLocalTime(slotStart, court.timezone);
    const slotEnd = new Date(slotTime.getTime() + 60 * 60 * 1000);

    if (!isOvernight) {
      // Normal hours: open and close on same day
      if (timeToMinutes(slotTime) < openMinutes || timeToMinutes(slotEnd) > closeMinutes) {
        throw new BadRequestError("Selected slot is outside court hours");
      }
    } else {
      // Overnight hours: e.g., open 18:00, close 02:00
      // Slot is valid if it's >= open OR <= close (spans midnight)
      const slotMinutes = timeToMinutes(slotTime);
      const slotEndMinutes = timeToMinutes(slotEnd);

      if (slotMinutes < openMinutes && slotEndMinutes > closeMinutes) {
        throw new BadRequestError("Selected slot is outside court hours");
      }
    }
  }
}

/**
 * Validates that the selected payment method is accepted by the court.
 */
export function validatePaymentMethod(
  paymentMethod: string,
  court: Pick<Court, "acceptsGcash" | "acceptsCash">
) {
  if (paymentMethod === "gcash" && !court.acceptsGcash) {
    throw new BadRequestError("This court does not accept GCash payments");
  }
  if (paymentMethod === "cash" && !court.acceptsCash) {
    throw new BadRequestError("This court does not accept cash payments");
  }
}

interface ParsedTime {
  hours: number;
  minutes: number;
}

function parseTime(timeStr: string): ParsedTime {
  // Format: "HH:MM:SS" or "HH:MM"
  const parts = timeStr.split(":");
  return {
    hours: parseInt(parts[0], 10),
    minutes: parseInt(parts[1], 10),
  };
}

function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function toLocalTime(utcDate: Date, timezone: string): Date {
  // Use en-PH for consistency with rest of app (Philippines locale)
  // Asia/Manila is UTC+8 with no DST — safe to parse back as local date
  const tzDate = new Date(utcDate.toLocaleString("en-PH", { timeZone: timezone }));
  return tzDate;
}

/**
 * Runs all validation checks before booking creation.
 * Throws BadRequestError on any validation failure.
 */
export function validateBookingRequest(input: {
  court: Court | null;
  slotStarts: string[];
  paymentMethod: string;
}) {
  const court = validateCourt(input.court);
  validateSlotSelection(input.slotStarts);

  const slotStartsDates = input.slotStarts.map((s) => new Date(s));
  validateSlotsNotEnded(slotStartsDates);
  validateSlotsContinuous(slotStartsDates);
  validateSlotsWithinHours(slotStartsDates, court);
  validatePaymentMethod(input.paymentMethod, court);

  return court;
}
