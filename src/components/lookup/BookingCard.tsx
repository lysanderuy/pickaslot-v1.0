"use client";

import { tw } from "@/lib/ui/tokens";
import type { PaymentMethod } from "@/types/bookings";

interface Slot {
  slot_start_at: string;
  slot_end_at: string;
}

interface BookingCardProps {
  bookingCode: string;
  firstName: string;
  slots: Slot[];
  paymentMethod: PaymentMethod;
  totalCostCents: number;
  bookingDate: string;
  pricePerHourCents: number;
}

const PAY_ICON: Record<string, string> = { gcash: "💳", cash: "💵" };
const PAY_LABEL: Record<string, string> = { gcash: "GCash", cash: "Cash" };

function slotDateLabel(bookingDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [y, m, d] = bookingDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", hour12: true }).format(
    new Date(iso)
  );
}

function formatTimeRange(start: string, end: string): string {
  return `${formatSlotTime(start)} – ${formatSlotTime(end)}`;
}

function formatMoney(cents: number): string {
  return `₱${(cents / 100).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export function BookingCard({
  bookingCode,
  firstName,
  slots,
  paymentMethod,
  totalCostCents,
  bookingDate,
  pricePerHourCents,
}: BookingCardProps) {
  const dateLabel = slotDateLabel(bookingDate);
  const pricePerSlot = formatMoney(pricePerHourCents);
  const total = formatMoney(totalCostCents);
  const payIcon = PAY_ICON[paymentMethod] ?? "";

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#2A4A35] bg-[#162E20]">
      {/* Code + name row */}
      <div className="flex items-center justify-between gap-3 border-b border-[#2A4A35] px-5 pb-4 pt-5">
        <div>
          <p className={`${tw.sectionLabel} mb-1`}>Booking Code</p>
          <p className="font-mono text-[28px] font-medium leading-none tracking-[0.08em] text-[#4ADE80]">
            {bookingCode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-[3px]">
          <span className={tw.sectionLabel}>Name</span>
          <span className="text-base font-bold tracking-[-0.01em] text-[#F0F7F2]">{firstName}</span>
        </div>
      </div>

      {/* Slots */}
      <div className="border-b border-[#2A4A35] px-5 py-4">
        <p className={`${tw.sectionLabel} mb-2`}>Reserved Slots</p>
        {slots.map((slot) => (
          <div
            key={slot.slot_start_at}
            className="flex items-center justify-between border-b border-[#1F3D29] py-2 last:border-b-0"
          >
            <span className="text-[15px] font-bold tracking-[-0.01em] text-[#F0F7F2]">
              {formatTimeRange(slot.slot_start_at, slot.slot_end_at)}
            </span>
            <span className="font-mono text-[11px] text-[#4A6B55]">
              {dateLabel} · 1 hr · {pricePerSlot}
            </span>
          </div>
        ))}
      </div>

      {/* Payment + total */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-[3px]">
          <span className={tw.sectionLabel}>Payment</span>
          <span className="flex items-center gap-1.5 text-[15px] font-bold text-[#F0F7F2]">
            <span>{payIcon}</span>
            <span>{PAY_LABEL[paymentMethod] ?? paymentMethod}</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-[3px]">
          <span className={tw.sectionLabel}>Total</span>
          <span className="text-xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]">{total}</span>
        </div>
      </div>
    </div>
  );
}
