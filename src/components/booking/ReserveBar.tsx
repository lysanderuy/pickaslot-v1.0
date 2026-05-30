"use client";

import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/bookings/formatting";
import type { AvailabilityRow } from "@/types/bookings";

interface ReserveBarProps {
  selectedSlots: AvailabilityRow[];
  totalCostCents: number;
  currencyCode: string;
  onClick: () => void;
}

export function ReserveBar({ selectedSlots, totalCostCents, currencyCode, onClick }: ReserveBarProps) {
  const slotCount = selectedSlots.length;

  return (
    <>
      {/* Gradient backdrop - non-interactive */}
      <div
        className={cx(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-[60] bg-[linear-gradient(to_top,#0F2418_55%,transparent)] pb-9 pt-3 transition",
          slotCount > 0 ? "translate-y-0" : "translate-y-[110%]"
        )}
      />
      {/* Clickable bar content */}
      <div
        className={cx(
          "fixed bottom-0 left-0 right-0 z-[70] pb-9 pt-3 transition",
          slotCount > 0 ? "translate-y-0 pointer-events-auto" : "translate-y-[110%] pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[14px] bg-[#F0F7F2] px-[22px] py-[17px] shadow-[0_8px_32px_rgba(240,247,242,0.15),0_2px_8px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            onClick={onClick}
          >
          <span className="flex flex-col gap-0.5 text-left">
            <span className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F2418]">
              Reserve Court
            </span>
            <span className="font-mono text-[11px] font-normal text-[rgba(15,36,24,0.5)]">
              {slotCount} slot{slotCount === 1 ? "" : "s"} · {slotCount} hr{slotCount === 1 ? "" : "s"}
            </span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-[#0F2418]">
              {formatMoney(totalCostCents, currencyCode)}
            </span>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(15,36,24,0.12)] text-xl text-[#0F2418]">
              →
            </span>
          </span>
        </button>
        </div>
      </div>
    </>
  );
}
