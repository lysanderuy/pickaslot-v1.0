import type { AvailabilityRow } from "@/types/bookings";

export function isSoon(row: AvailabilityRow, now: Date = new Date()): boolean {
  const nowMs = now.getTime();
  const slotStart = new Date(row.slot_start_at).getTime();
  const slotEnd = new Date(row.slot_end_at).getTime();

  // Slot must not have ended yet
  if (nowMs >= slotEnd) {
    return false;
  }

  // Warning if slot starts within 60 minutes (past or future)
  const diffMinutes = (slotStart - nowMs) / 60000;
  return diffMinutes <= 60;
}

export function uiSlotState(slotState: AvailabilityRow["slot_state"]): "available" | "pending" | "taken" | "past" {
  return slotState === "confirmed" ? "taken" : slotState;
}

export function getOpenCount(availability: AvailabilityRow[]): number {
  return availability.filter((row) => row.slot_state === "available").length;
}

/**
 * Check if selected slots are continuous (consecutive hours without gaps).
 * Returns true if valid (continuous or single slot), false if there are gaps.
 */
export function areSlotsContinuous(selectedSlots: AvailabilityRow[]): boolean {
  if (selectedSlots.length <= 1) {
    return true;
  }

  // Validate all slots have valid dates before sorting
  for (const slot of selectedSlots) {
    const startValid = Date.parse(slot.slot_start_at);
    const endValid = Date.parse(slot.slot_end_at);
    if (!startValid || !endValid) {
      return false; // Invalid date in slots
    }
  }

  // Sort slots by start time
  const sorted = [...selectedSlots].sort(
    (a, b) => new Date(a.slot_start_at).getTime() - new Date(b.slot_start_at).getTime()
  );

  // Check for gaps between consecutive slots
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].slot_end_at).getTime();
    const currStart = new Date(sorted[i].slot_start_at).getTime();

    // Gap exists if current slot doesn't start exactly when previous ends
    // (allowing 1-minute tolerance for rounding)
    if (Math.abs(currStart - prevEnd) > 60 * 1000) {
      return false;
    }
  }

  return true;
}
