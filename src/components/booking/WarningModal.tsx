"use client";

import { cx } from "@/lib/cx";
import { formatTimeRange } from "@/lib/bookings/formatting";
import type { AvailabilityRow } from "@/types/bookings";

interface ImminentWarningModalProps {
  open: boolean;
  type: "imminent";
  selectedSlots?: AvailabilityRow[];
  timezone?: string;
  onGoBack: () => void;
  onContinue: () => void;
}

interface ContinuousWarningModalProps {
  open: boolean;
  type: "continuous";
  selectedSlots?: AvailabilityRow[];
  timezone?: string;
  onGoBack: () => void;
  onContinue?: never;
}

type WarningModalProps = ImminentWarningModalProps | ContinuousWarningModalProps;

/**
 * Bottom-sheet warning that appears when:
 * - type: "imminent" - one or more selected slots starts within 60 minutes
 * - type: "continuous" - selected slots have gaps (not consecutive)
 */
export function WarningModal(props: WarningModalProps) {
  const { open, type, selectedSlots, timezone, onGoBack, onContinue } = props;
  const isImminent = type === "imminent";

  // Format slot ranges for continuous error
  const slotRanges = selectedSlots
    ? selectedSlots
        .map((slot) => formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone || "Asia/Manila"))
        .join(", ")
    : "";

  return (
    <div
      className={cx(
        "fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(5,14,9,0.75)] opacity-0 backdrop-blur-[6px] transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onGoBack();
      }}
    >
      <div
        className={cx(
          "w-full max-w-[430px] sm:max-w-[520px] rounded-[22px] border-2 bg-[#162E20] px-6 pb-6 pt-7 transition-all duration-[260ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "mx-4 max-h-[90vh] overflow-y-auto",
          isImminent ? "border-[#FBBF24]" : "border-[#F87171]",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {isImminent ? (
          <>
            <h2 id="warning-title" className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
              Heads up.
            </h2>
            <p className="mb-[22px] text-sm leading-[1.6] text-[#8AAF95]">
              Your booking time is starting soon or has already begun.
              Kindly complete your payment and head to the court in time.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                className="flex-1 rounded-[10px] border border-[#2A4A35] bg-[#1C3828] p-[14px] text-[13px] font-bold tracking-[-0.01em] text-[#8AAF95] transition-opacity duration-[130ms] active:opacity-80"
                onClick={onGoBack}
              >
                Go Back
              </button>
              <button
                type="button"
                className="flex-1 rounded-[10px] bg-[#FBBF24] p-[14px] text-[13px] font-bold tracking-[-0.01em] text-[#0F2418] transition-opacity duration-[130ms] active:opacity-80"
                onClick={onContinue}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(248,113,113,0.15)] text-[18px]">
                ⚠️
              </span>
              <h2 id="warning-title" className="text-xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
                Slots must be continuous
              </h2>
            </div>
            <div className="mb-[22px] space-y-3 text-sm text-[#8AAF95]">
              <p className="leading-[1.6]">
                Your selection has gaps and cannot be booked as one reservation.
              </p>
              {selectedSlots && selectedSlots.length > 0 && (
                <div className="rounded-[10px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.08)] px-3.5 py-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#F87171]">
                    Your selection
                  </p>
                  <p className="font-semibold text-[#F0F7F2]">{slotRanges}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <p className="leading-[1.6]">Please select consecutive hours without gaps.</p>
                <div className="mt-2 flex items-center gap-2 text-[13px]">
                  <span className="font-bold text-[#4ADE80]">✓</span>
                  <span className="text-[#F0F7F2]">9 AM – 12 PM (continuous)</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-bold text-[#F87171]">✕</span>
                  <span className="text-[#F0F7F2]">9 AM, 12 PM, 5 PM (gaps)</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-[10px] bg-[#F0F7F2] p-[14px] text-[13px] font-bold tracking-[-0.01em] text-[#0F2418] transition-opacity duration-[130ms] active:opacity-80"
              onClick={onGoBack}
            >
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
