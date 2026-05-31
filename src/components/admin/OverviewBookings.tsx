"use client";

import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { BookingActionButtons } from "@/components/admin/BookingActionButtons";
import { SlotDisplay } from "@/components/admin/SlotDisplay";

type Booking = {
  id: string;
  bookingCode: string | null;
  fullName: string | null;
  contactNumber: string | null;
  bookingDate: string | null;
  slotCount: number | null;
  slotLabels: string | null;
  totalAmount: number | null;
  paymentMethod: string | null;
  timezone: string | null;
};

interface OverviewBookingsProps {
  pendingBookings: Booking[];
}

function formatBookingDate(dateVal: unknown, timezone: string = "Asia/Manila"): string {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal as string);
  return d.toLocaleDateString("en-PH", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPaymentMethod(method: unknown): string {
  const m = typeof method === "string" ? method.toLowerCase() : "";
  if (m === "gcash") return "GCash";
  if (m === "cash") return "Cash";
  return typeof method === "string" && method ? method : "—";
}

function getPaymentIcon(method: unknown): string {
  const m = typeof method === "string" ? method.toLowerCase() : "";
  if (m === "gcash") return "💳";
  if (m === "cash") return "💵";
  return "";
}

function formatSlotCount(slotCount: unknown): string {
  const hrs = Number(slotCount);
  return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
}

function formatAmount(totalAmount: unknown): string {
  const cost = Math.round(Number(totalAmount) / 100);
  return `₱${cost.toLocaleString("en-PH")}`;
}

export function OverviewBookings({ pendingBookings }: OverviewBookingsProps) {
  const router = useRouter();

  function handleActionComplete() {
    setTimeout(() => {
      router.refresh();
    }, 500);
  }

  if (pendingBookings.length === 0) {
    return (
      <p className="py-7 text-center text-[13px] font-medium italic text-slate-400">
        No pending bookings.
      </p>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="flex flex-col gap-3 px-3 py-4 sm:hidden">
        {pendingBookings.map((booking) => (
          <div
            key={booking.id as string}
            className="rounded-xl border border-slate-200 bg-white p-3.5"
          >
            {/* Header: Code */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                {booking.bookingCode as string}
              </span>
            </div>

            {/* Guest Info */}
            <div className="mt-3">
              <p className="text-[14px] font-bold text-slate-900 break-words">
                {booking.fullName as string}
              </p>
              <p className="mt-0.5 font-mono text-[11px] font-medium text-slate-400 break-all">
                {booking.contactNumber as string}
              </p>
            </div>

            {/* Date & Time */}
            <div className="mt-3 flex items-center gap-1.5 text-slate-600">
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[13px] font-semibold break-words">
                {formatBookingDate(booking.bookingDate, booking.timezone as string | undefined)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-slate-600">
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <SlotDisplay
                slotLabels={booking.slotLabels as string | null | undefined}
                slotCount={booking.slotCount}
                timezone={booking.timezone as string | null | undefined}
                bookingDate={booking.bookingDate as string | null | undefined}
              />
              <span className="font-mono text-[11px] font-medium text-slate-400">
                ({formatSlotCount(booking.slotCount)})
              </span>
            </div>

            {/* Payment */}
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-[13px] font-bold text-slate-900">
                {formatAmount(booking.totalAmount)}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <span>{getPaymentIcon(booking.paymentMethod)}</span>
                <span>{formatPaymentMethod(booking.paymentMethod)}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3">
              <BookingActionButtons
                bookingId={booking.id as string}
                onActionComplete={handleActionComplete}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[150px]" />
            <col className="w-[90px]" />
            <col className="w-[150px]" />
            <col className="w-[110px]" />
            <col className="w-[100px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Code", "Guest", "Date", "Slots", "Payment", "Actions"].map((col, i) => (
                <th
                  key={col}
                  className={cx(
                    "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400",
                    i === 5 && "text-right",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((booking) => {
              return (
                <tr
                  key={booking.id as string}
                  className="border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50"
                >
                  <td className="px-3 py-3.5 align-top">
                    <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                      {booking.bookingCode as string}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <p className="text-[13px] font-bold leading-none text-slate-900 break-words">
                      {booking.fullName as string}
                    </p>
                    <p className="mt-[3px] font-mono text-[11px] font-medium text-slate-400 break-all">
                      {booking.contactNumber as string}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <span className="text-[13px] font-semibold text-slate-700 break-words">
                      {formatBookingDate(booking.bookingDate, booking.timezone as string | undefined)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <SlotDisplay
                      slotLabels={booking.slotLabels as string | null | undefined}
                      slotCount={booking.slotCount}
                      timezone={booking.timezone as string | null | undefined}
                      bookingDate={booking.bookingDate as string | null | undefined}
                    />
                    <p className="mt-[3px] font-mono text-[11px] font-medium text-slate-400">
                      {formatSlotCount(booking.slotCount)}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-slate-900 break-words">
                        {formatAmount(booking.totalAmount)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        · {getPaymentIcon(booking.paymentMethod)} {formatPaymentMethod(booking.paymentMethod)}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-top text-right">
                    <BookingActionButtons
                      bookingId={booking.id as string}
                      onActionComplete={handleActionComplete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
