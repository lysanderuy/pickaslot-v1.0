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
  fullName: string;
  slots: Slot[];
  paymentMethod: PaymentMethod;
  totalAmount: number;
  bookingDate: string;
  pricePerHour: number;
  timezone: string;
  gcashNumber: string | null;
  gcashName: string | null;
  messengerUrl: string | null;
  onClear: () => void;
}

export function BookingResult({
  status,
  bookingCode,
  fullName,
  slots,
  paymentMethod,
  totalAmount,
  bookingDate,
  pricePerHour,
  timezone,
  gcashNumber,
  gcashName,
  messengerUrl,
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
        fullName={fullName}
        slots={slots}
        paymentMethod={paymentMethod}
        totalAmount={totalAmount}
        bookingDate={bookingDate}
        pricePerHour={pricePerHour}
        timezone={timezone}
      />

      {/* What to do now — pending only */}
      {status === "pending" && (
        <div className="rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-3.5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">
            What to do now
          </div>
          {paymentMethod === "gcash" ? (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                Send your GCash payment
                {gcashName && gcashNumber ? (
                  <>
                    {" "}to{" "}
                    <strong className="font-semibold text-[#F0F7F2]">{gcashName}</strong>
                    {" · "}
                    <strong className="font-semibold text-[#F0F7F2]">{gcashNumber}</strong>
                  </>
                ) : gcashNumber ? (
                  <>
                    {" "}to{" "}
                    <strong className="font-semibold text-[#F0F7F2]">{gcashNumber}</strong>
                  </>
                ) : null}
                {", "}then message your receipt with your booking code.
              </p>
              {messengerUrl && (
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.07)] px-4 py-2.5 text-[13px] font-bold text-[#4ADE80] transition-opacity duration-[150ms] active:opacity-75"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.332 5.507 3.425 7.27V22l3.162-1.738A11.08 11.08 0 0 0 12 20.486c5.523 0 10-4.144 10-9.243C22 6.145 17.523 2 12 2zm.994 12.44-2.548-2.716-4.973 2.716 5.469-5.805 2.612 2.716 4.908-2.716-5.468 5.805z" />
                  </svg>
                  Send Receipt on Messenger
                </a>
              )}
            </div>
          ) : (
            <p className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
              Show your booking code{" "}
              <strong className="font-semibold text-[#F0F7F2]">{bookingCode}</strong> or your name when you arrive at the court. Pay cash on-site.
            </p>
          )}
        </div>
      )}

      {/* Note (rejected only — confirmed has no note) */}
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
