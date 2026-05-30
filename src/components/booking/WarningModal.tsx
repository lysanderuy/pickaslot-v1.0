"use client";

import { cx } from "@/lib/cx";

interface WarningModalProps {
  open: boolean;
  onGoBack: () => void;
  onContinue: () => void;
}

/**
 * Bottom-sheet warning that appears when one or more selected slots
 * is imminent (starts within 60 minutes or has already started).
 * Design matches the `.wov` / `.wbox` pattern from the design reference.
 */
export function WarningModal({ open, onGoBack, onContinue }: WarningModalProps) {
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
          "w-full max-w-[430px] sm:max-w-[520px] rounded-[22px] border-2 border-[#FBBF24] bg-[#162E20] px-6 pb-6 pt-7 transition-all duration-[260ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "mx-4 max-h-[90vh] overflow-y-auto",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <h2
          id="warning-title"
          className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]"
        >
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
      </div>
    </div>
  );
}
