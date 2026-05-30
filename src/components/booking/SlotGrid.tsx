"use client";

import { cx } from "@/lib/cx";
import { formatTimeParts } from "@/lib/bookings/formatting";
import { uiSlotState } from "@/lib/bookings/availability";
import { tw } from "@/lib/ui/tokens";
import type { AvailabilityRow, UiSlotState } from "@/types/bookings";

interface SlotGridProps {
  availability: AvailabilityRow[];
  selectedSlotStarts: string[];
  onSlotSelect: (slotStarts: string[]) => void;
  loading: boolean;
  acceptingBookings: boolean;
  timezone: string;
  error?: string;
  onRetry?: () => void;
}

function slotCardClass(state: UiSlotState, selected: boolean) {
  const base =
    "relative flex flex-col gap-[5px] overflow-hidden rounded-[14px] px-3 pt-[11px] pb-[10px] text-left transition active:scale-[0.96]";

  if (selected) {
    return cx(base, "border border-[#4ADE80] bg-[#4ADE80] shadow-[0_4px_20px_rgba(74,222,128,0.3)]");
  }

  if (state === "available") {
    return cx(
      base,
      "cursor-pointer border border-[#2A4A35] bg-[#1C3828] shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]"
    );
  }

  if (state === "taken") {
    return cx(base, "cursor-default border border-[rgba(248,113,113,0.15)] bg-[rgba(248,113,113,0.1)] opacity-70");
  }

  if (state === "pending") {
    return cx(base, "cursor-default border border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.1)]");
  }

  return cx(base, "cursor-default border border-[#1F3D29] bg-transparent opacity-35");
}

function slotTextClass(state: UiSlotState, selected: boolean) {
  if (selected) {
    return "text-[#0F2418]";
  }

  if (state === "taken") {
    return "text-[#F87171]";
  }

  if (state === "pending") {
    return "text-[#FBBF24]";
  }

  if (state === "past") {
    return "text-[#F0F7F2]";
  }

  return "text-[#F0F7F2]";
}

function statusTextClass(state: UiSlotState, selected: boolean) {
  if (selected) {
    return "text-[rgba(15,36,24,0.7)]";
  }

  if (state === "taken") {
    return "text-[#F87171]";
  }

  if (state === "pending") {
    return "text-[#FBBF24]";
  }

  if (state === "past") {
    return "text-[#4A6B55]";
  }

  return "text-[#4ADE80]";
}

export function SlotGrid({
  availability,
  selectedSlotStarts,
  onSlotSelect,
  loading,
  acceptingBookings,
  timezone,
  error,
  onRetry,
}: SlotGridProps) {
  const openCount = availability.filter((row) => row.slot_state === "available").length;

  function toggleSlot(row: AvailabilityRow) {
    if (row.slot_state !== "available") {
      return;
    }

    onSlotSelect(
      selectedSlotStarts.includes(row.slot_start_at)
        ? selectedSlotStarts.filter((slotStart) => slotStart !== row.slot_start_at)
        : [...selectedSlotStarts, row.slot_start_at]
    );
  }

  return (
    <section className="pt-6">
      <div className={cx(tw.sectionLabel, "mb-3 flex items-center justify-between")}>
        <span>Choose Your Slot</span>
        <span className="font-mono text-[11px] font-normal normal-case tracking-[0.02em] text-[#4A6B55]">
          {loading ? "-" : `${openCount} open`}
        </span>
      </div>
      <p className="mb-3 text-xs font-medium italic text-[#4A6B55]">
        {acceptingBookings ? "Tap a slot to select it." : "This court is closed for new booking requests."}
      </p>

      {error ? (
        <div className="rounded-xl border border-dashed border-[#2A4A35] bg-[#162E20] px-4 py-5 text-center text-[13px] font-medium italic text-[#4A6B55]">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              className="mx-auto mt-2 block font-extrabold not-italic text-[#4ADE80] transition hover:text-[#5ef095] active:scale-95 cursor-pointer"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="min-h-[73px] animate-pulse rounded-[14px] border border-[#2A4A35] bg-[#1C3828]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availability.map((row) => {
            const selected = selectedSlotStarts.includes(row.slot_start_at);
            const state = uiSlotState(row.slot_state);
            const stateText = selected
              ? "Selected"
              : state === "taken"
              ? "Taken"
              : (state[0].toUpperCase() + state.slice(1)) as string;
            const canSelect = acceptingBookings && row.slot_state === "available";
            const { time: slotTime, suffix: slotSuffix } = formatTimeParts(row.slot_start_at, timezone);

            return (
              <button
                key={row.slot_start_at}
                type="button"
                className={slotCardClass(state, selected)}
                disabled={!canSelect}
                onClick={() => toggleSlot(row)}
              >
                <span
                  className={cx(
                    "whitespace-nowrap text-base font-extrabold leading-none tracking-[-0.02em]",
                    slotTextClass(state, selected)
                  )}
                >
                  {slotTime} <span className="text-[12px] font-semibold opacity-70">{slotSuffix}</span>
                </span>
                <span className="mt-[1px] flex items-center justify-between">
                  <span
                    className={cx(
                      "text-[10px] font-bold uppercase tracking-[0.08em]",
                      statusTextClass(state, selected)
                    )}
                  >
                    {stateText}
                  </span>
                  {(canSelect || selected) && (
                    <span
                      className={cx(
                        "flex h-5 w-5 items-center justify-center rounded-full border-[1.5px]",
                        selected
                          ? "border-[rgba(15,36,24,0.3)] bg-[rgba(15,36,24,0.25)] text-[rgba(15,36,24,0.8)]"
                          : "border-[#2A4A35] bg-[#162E20] text-[#4A6B55]"
                      )}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
