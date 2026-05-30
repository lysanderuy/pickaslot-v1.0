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

export function BookingConfirmation({
  open,
  code,
  slots,
  priceLabel,
  timezone,
  onClose,
}: BookingConfirmationProps) {
  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 z-[120] translate-y-5 opacity-0 transition",
        "md:flex md:items-center md:justify-center md:bg-[rgba(5,14,9,0.72)] md:backdrop-blur-md",
        open && "pointer-events-auto translate-y-0 opacity-100"
      )}
    >
      <div className="flex h-full flex-col bg-[#0F2418] md:h-auto md:w-full md:max-w-[480px] md:overflow-hidden md:rounded-[22px]">
        <div className="px-6 pb-[22px] pt-[54px] md:pt-10">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4ADE80]">
            Booking Requested
          </div>
          <div className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#F0F7F2]">
            You&apos;re on
            <br />
            the <em className="not-italic text-[#4ADE80]">queue.</em>
          </div>
          <div className="mt-4 max-w-[300px] text-sm leading-6 text-[#8AAF95]">
            Admin will confirm shortly. Save your booking code - you&apos;ll need it to check your status.
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3.5 px-5 pb-6">
          <div className={cx("border border-[#2A4A35] bg-[#162E20] rounded-[18px] p-[18px]")}>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]">
              Your Booking Code
            </div>
            <div className="my-3 font-mono text-[42px] font-medium tracking-[0.06em] text-[#4ADE80]">
              {code || "-"}
            </div>
            <div className="flex flex-col gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.slot_start_at}
                  className="flex justify-between gap-3 border-t border-[#1F3D29] pt-2"
                >
                  <span className="text-[14px] font-semibold text-[#F0F7F2]">
                    {formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone)}
                  </span>
                  <span className="font-mono text-[11px] font-normal text-[#4A6B55]">
                    1 hr · {priceLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2.5 rounded-xl border border-[rgba(251,191,36,0.16)] bg-[rgba(251,191,36,0.1)] p-3">
            <span>⚠️</span>
            <span className="text-xs font-medium leading-5 text-[#FBBF24]">
              Screenshot this page. This code won&apos;t appear again. Use it under My Booking to check your status.
            </span>
          </div>
        </div>
        <button
          type="button"
          className="mx-5 mb-[34px] rounded-[14px] bg-[#F0F7F2] p-4 text-[15px] font-extrabold text-[#0F2418]"
          onClick={onClose}
        >
          Got it - I saved the code
        </button>
      </div>
    </div>
  );
}
