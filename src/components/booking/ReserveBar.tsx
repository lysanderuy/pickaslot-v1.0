"use client";

import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/bookings/formatting";
import type { AvailabilityRow } from "@/types/bookings";

interface ReserveBarProps {
  selectedSlots: AvailabilityRow[];
  totalAmount: number;
  currencyCode: string;
  onClick: () => void;
}

export function ReserveBar({ selectedSlots, totalAmount, currencyCode, onClick }: ReserveBarProps) {
  const slotCount = selectedSlots.length;

  return (
    <>
      {/* Gradient backdrop - non-interactive */}
      <div
        className={cx(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-[60] bg-[linear-gradient(to_top,#0F2418_55%,transparent)] pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-3 transition",
          slotCount > 0 ? "translate-y-0" : "translate-y-[110%]"
        )}
      />
      {/* Clickable bar content */}
      <div
        className={cx(
          "fixed bottom-0 left-0 right-0 z-[70] pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-3 transition",
          slotCount > 0 ? "translate-y-0 pointer-events-auto" : "translate-y-[110%] pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-[14px] bg-[#F0F7F2] px-4 py-3.5 shadow-[0_8px_32px_rgba(240,247,242,0.15),0_2px_8px_rgba(0,0,0,0.3)] active:scale-[0.98] sm:px-[22px] sm:py-[17px]"
            onClick={onClick}
          >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
            <span className="text-sm font-extrabold tracking-[-0.01em] text-[#0F2418] sm:text-[15px]">
              Reserve Court
            </span>
            <span className="font-mono text-[10px] font-normal text-[rgba(15,36,24,0.5)] sm:text-[11px]">
              {slotCount} slot{slotCount === 1 ? "" : "s"} · {slotCount} hr{slotCount === 1 ? "" : "s"}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="text-lg font-extrabold leading-none tracking-[-0.02em] text-[#0F2418] sm:text-[22px]">
              {formatMoney(totalAmount, currencyCode)}
            </span>
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[rgba(15,36,24,0.12)] text-lg text-[#0F2418] sm:h-[34px] sm:w-[34px] sm:text-xl">
              →
            </span>
          </span>
        </button>
        </div>
      </div>
    </>
  );
}
