"use client";

import { tw } from "@/lib/ui/tokens";
import type { PaymentMethod } from "@/types/bookings";

interface Slot {
  slot_start_at: string;
  slot_end_at: string;
}

interface BookingCardProps {
  bookingCode: string;
  fullName: string;
  slots: Slot[];
  paymentMethod: PaymentMethod;
  totalCostCents: number;
  bookingDate: string;
  pricePerHourCents: number;
}

const PAY_ICON: Record<string, string> = { gcash: "💳", cash: "💵" };
const PAY_LABEL: Record<string, string> = { gcash: "GCash", cash: "Cash" };

function localCalendarDate(value: string): Date {
  const dateOnly = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [y, m, d] = dateOnly.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function slotDateLabel(bookingDate: string, firstSlotStart?: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const date = firstSlotStart ? localCalendarDate(firstSlotStart) : localCalendarDate(bookingDate);
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
  return `${formatSlotTime(start)} - ${formatSlotTime(end)}`;
}

function formatMoney(cents: number): string {
  return `₱${(cents / 100).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

function calendarDateKey(value: string): string {
  const date = localCalendarDate(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function groupSlotsByDate(slots: Slot[], bookingDate: string) {
  const groups = new Map<string, Slot[]>();

  for (const slot of slots) {
    const key = calendarDateKey(slot.slot_start_at);
    const list = groups.get(key) ?? [];
    list.push(slot);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupSlots]) => {
      const sorted = [...groupSlots].sort(
        (a, b) => new Date(a.slot_start_at).getTime() - new Date(b.slot_start_at).getTime()
      );
      return {
        key,
        label: slotDateLabel(bookingDate, sorted[0].slot_start_at),
        slots: sorted,
      };
    });
}

export function BookingCard({
  bookingCode,
  fullName,
  slots,
  paymentMethod,
  totalCostCents,
  bookingDate,
  pricePerHourCents,
}: BookingCardProps) {
  const pricePerSlot = formatMoney(pricePerHourCents);
  const total = formatMoney(totalCostCents);
  const payIcon = PAY_ICON[paymentMethod] ?? "";
  const slotGroups = groupSlotsByDate(slots, bookingDate);

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#2A4A35] bg-[#162E20]">
      {/* Code + name row */}
      <div className="flex flex-col gap-4 border-b border-[#2A4A35] px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <div className="min-w-0">
          <p className={`${tw.sectionLabel} mb-1`}>Booking Code</p>
          <p className="font-mono text-[24px] font-medium leading-none tracking-[0.08em] text-[#4ADE80] sm:text-[28px]">
            {bookingCode}
          </p>
        </div>
        <div className="flex flex-col gap-[3px] sm:items-end">
          <span className={tw.sectionLabel}>Name</span>
          <span className="text-base font-bold tracking-[-0.01em] text-[#F0F7F2]">{fullName}</span>
        </div>
      </div>

      {/* Slots */}
      <div className="border-b border-[#2A4A35] px-4 py-4 sm:px-5">
        <p className={`${tw.sectionLabel} mb-2`}>Reserved Slots</p>
        <div className="space-y-3">
          {slotGroups.map((group) => (
            <div key={group.key}>
              <p className="mb-1.5 text-[13px] font-bold tracking-[-0.01em] text-[#8AAF95]">
                {group.label}
              </p>
              {group.slots.map((slot) => (
                <div
                  key={slot.slot_start_at}
                  className="flex items-center justify-between gap-3 border-b border-[#1F3D29] py-2 last:border-b-0"
                >
                  <span className="min-w-0 text-sm font-bold tracking-[-0.01em] text-[#F0F7F2] sm:text-[15px]">
                    {formatTimeRange(slot.slot_start_at, slot.slot_end_at)}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-[#4A6B55]">
                    1 hr · {pricePerSlot}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Payment + total */}
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
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
