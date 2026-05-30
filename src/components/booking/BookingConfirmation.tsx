"use client";

import { cx } from "@/lib/cx";
import { formatTimeRange } from "@/lib/bookings/formatting";
import type { AvailabilityRow } from "@/types/bookings";

interface BookingConfirmationProps {
  open: boolean;
  code: string;
  slots: AvailabilityRow[];
  priceLabel: string;
  timezone: string;
  onClose: () => void;
}

/**
 * Full-screen confirmation that appears after a successful booking submission.
 * Design matches the `.cs` pattern from the design reference.
 */
export function BookingConfirmation({
  open,
  code,
  slots,
  priceLabel,
  timezone,
  onClose,
}: BookingConfirmationProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cx(
          "fixed inset-0 z-[200] bg-[rgba(5,14,9,0.72)] opacity-0 backdrop-blur-[6px] transition-opacity duration-[180ms]",
          open ? "opacity-100 pointer-events-auto" : "pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Sheet (bottom on mobile, centered modal on desktop) */}
      <div
        className={cx(
          "fixed bottom-0 left-1/2 z-[201] flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden bg-[#0F2418]",
          "max-h-[min(92dvh,100%)] rounded-t-[22px] border-t-2 border-[#4ADE80]",
          "transition-[transform,opacity] duration-[320ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "md:bottom-auto md:top-1/2 md:max-h-[min(90dvh,100%)] md:w-[min(560px,calc(100vw-2rem))] md:max-w-none md:rounded-[22px] md:border-2",
          open ? "translate-y-0" : "translate-y-full",
          open
            ? "md:-translate-x-1/2 md:-translate-y-1/2 md:opacity-100"
            : "md:-translate-x-1/2 md:-translate-y-1/2 md:opacity-0 md:pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull handle - hidden on desktop */}
        <div className="mx-auto mt-[14px] h-[4px] w-[36px] rounded-full bg-[#2A4A35] md:hidden" />

        {/* Header */}
        <div className="shrink-0 border-b border-[#2A4A35] px-[22px] pb-5 pt-5 md:pb-6 md:pt-8">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]">
            Booking Requested
          </div>
          <h1 className="mb-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#F0F7F2] md:text-[32px] md:text-balance">
            You&apos;re on the{" "}
            <em className="not-italic text-[#4ADE80]">queue.</em>
          </h1>
          <p className="text-[13px] leading-[1.5] text-[#8AAF95]">
            Admin will confirm shortly. Save your booking code; you&apos;ll need it to check
            your status.
          </p>
        </div>

        {/* Body - scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-5 pt-5 [scrollbar-width:none] md:pb-6 md:pt-6">
          {/* Booking code card */}
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#2A4A35] bg-[#162E20] p-[18px]">
            {/* Green top-accent bar per design */}
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-[linear-gradient(90deg,#4ADE80,transparent)]" />

            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]">
              Your Booking Code
            </div>
            <div className="mb-4 mt-2.5 font-mono text-[36px] font-medium leading-none tracking-[0.06em] text-[#4ADE80] md:text-[42px]">
              {code || "..."}
            </div>

            {/* Slot list */}
            <div className="flex flex-col gap-[7px] border-t border-[#2A4A35] pt-[13px]">
              {slots.map((slot) => (
                <div
                  key={slot.slot_start_at}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-[#F0F7F2]">
                    {formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone)}
                  </span>
                  <span className="font-mono text-[11px] font-normal text-[#4A6B55]">
                    1 hr · {priceLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 rounded-[10px] border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.1)] px-3.5 py-[13px]">
            <span aria-hidden="true">⚠️</span>
            <span className="text-xs font-medium leading-[1.5] text-[#FBBF24]">
              Screenshot this screen. This code won&apos;t appear again. Use it under My
              Booking to check your status.
            </span>
          </div>
        </div>

        {/* Done button - label centered; safe-area spacer below so text isn't pushed up */}
        <button
          type="button"
          className="flex w-full shrink-0 flex-col bg-[#F0F7F2] transition-opacity duration-[150ms] active:opacity-85"
          onClick={onClose}
        >
          <span className="flex min-h-[52px] items-center justify-center px-[22px] py-3.5 text-[15px] font-extrabold text-[#0F2418]">
            Got it, I saved the code
          </span>
          <span
            className="block h-[max(0.5rem,env(safe-area-inset-bottom,0px))] shrink-0 md:hidden"
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  );
}
