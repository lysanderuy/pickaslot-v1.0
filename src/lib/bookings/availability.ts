import type { AvailabilityRow } from "@/types/bookings";

export function isSoon(row: AvailabilityRow, now: Date = new Date()): boolean {
  const diffMinutes = (new Date(row.slot_start_at).getTime() - now.getTime()) / 60000;
  return diffMinutes >= 0 && diffMinutes <= 60;
}

export function uiSlotState(slotState: AvailabilityRow["slot_state"]): "available" | "pending" | "taken" | "past" {
  return slotState === "confirmed" ? "taken" : slotState;
}

export function getOpenCount(availability: AvailabilityRow[]): number {
  return availability.filter((row) => row.slot_state === "available").length;
}
