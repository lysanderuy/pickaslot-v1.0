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
