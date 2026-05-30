"use client";

import { StatusBanner, STATUS_CONFIG } from "./StatusBanner";
import type { BookingStatus } from "./StatusBanner";
import { BookingCard } from "./BookingCard";
import type { PaymentMethod } from "@/types/bookings";

interface Slot {
  slot_start_at: string;
  slot_end_at: string;
}

interface BookingResultProps {
  status: BookingStatus;
  bookingCode: string;
  firstName: string;
  slots: Slot[];
  paymentMethod: PaymentMethod;
  totalCostCents: number;
  bookingDate: string;
  pricePerHourCents: number;
  onClear: () => void;
}

export function BookingResult({
  status,
  bookingCode,
  firstName,
  slots,
  paymentMethod,
  totalCostCents,
  bookingDate,
  pricePerHourCents,
  onClear,
}: BookingResultProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.rejected;

  return (
    <div className="flex animate-[fadeUp_0.25s_ease_both] flex-col gap-3">
      {/* Status banner */}
      <StatusBanner status={status} />

      {/* Booking card */}
      <BookingCard
        bookingCode={bookingCode}
        firstName={firstName}
        slots={slots}
        paymentMethod={paymentMethod}
        totalCostCents={totalCostCents}
        bookingDate={bookingDate}
        pricePerHourCents={pricePerHourCents}
      />

      {/* Note (pending / rejected) */}
      {cfg.note && (
        <div className="flex items-start gap-3 rounded-xl border border-[#2A4A35] bg-[#1C3828] px-4 py-3">
          <span className="mt-px shrink-0 text-base">ℹ️</span>
          <p className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{cfg.note}</p>
        </div>
      )}

      {/* Clear button */}
      <button
        type="button"
        onClick={onClear}
        className="mt-1 w-full rounded-xl border border-[#2A4A35] bg-transparent px-4 py-3 text-[13px] font-semibold tracking-[0.02em] text-[#4A6B55] transition duration-130 ease-out active:scale-[0.97] active:opacity-90 active:bg-[#1C3828] active:text-[#8AAF95]"
      >
        Look up a different code
      </button>
    </div>
  );
}
