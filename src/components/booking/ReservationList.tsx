"use client";

import { useMemo } from "react";
import { formatMoney, formatTimeRange } from "@/lib/bookings/formatting";
import { tw } from "@/lib/ui/tokens";
import type { AvailabilityRow, ConfirmedReservation } from "@/types/bookings";

interface ReservationListProps {
  availability: AvailabilityRow[];
  timezone: string;
  loading: boolean;
  pricePerHourCents: number;
  currencyCode: string;
}

export function ReservationList({
  availability,
  timezone,
  loading,
  pricePerHourCents,
  currencyCode,
}: ReservationListProps) {
  const reservations = useMemo<ConfirmedReservation[]>(() => {
    const grouped = new Map<string, AvailabilityRow[]>();

    availability.forEach((row) => {
      if (row.slot_state !== "confirmed" || !row.booking_id) {
        return;
      }

      let group = grouped.get(row.booking_id);
      if (!group) {
        group = [];
        grouped.set(row.booking_id, group);
      }
      group.push(row);
    });

    return Array.from(grouped.entries()).map(([bookingId, rows]) => {
      const sorted = [...rows].sort((left, right) =>
        left.slot_start_at.localeCompare(right.slot_start_at)
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      return {
        bookingId,
        firstName: first?.first_name ?? "Guest",
        duration: sorted.length,
        timeRange: first && last ? formatTimeRange(first.slot_start_at, last.slot_end_at, timezone) : "",
        totalCostCents: first?.total_cost_cents ?? sorted.length * pricePerHourCents,
      };
    });
  }, [availability, timezone, pricePerHourCents]);

  if (loading) {
    return (
      <section className="pt-6" aria-label="Loading reservations">
        <div className={`${tw.sectionLabel} mb-3 h-4 w-32 animate-pulse rounded bg-[#2A4A35]`} />
        <div className="flex flex-col gap-1.5" role="presentation">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-[13px] animate-pulse"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-[#2A4A35]" />
                <div className="h-3 w-16 rounded bg-[#2A4A35]" />
              </div>
              <div className="flex flex-col items-end space-y-1.5">
                <div className="h-3 w-8 rounded bg-[#2A4A35]" />
                <div className="h-4 w-12 rounded bg-[#2A4A35]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pt-6" aria-label="Today's reservations">
      <div className={`${tw.sectionLabel} mb-3`}>Reservations Today</div>
      {reservations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2A4A35] bg-[#162E20] px-4 py-5 text-center text-[13px] font-medium italic text-[#4A6B55]">
          No confirmed bookings for this day.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5 p-0 m-0 list-none">
          {reservations.map((reservation) => (
            <li
              key={reservation.bookingId}
              className="flex items-center gap-3.5 rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-[13px]"
            >
              <article className="flex w-full items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-none tracking-[-0.01em] text-[#F0F7F2]">
                    {reservation.timeRange}
                  </div>
                  <div className="mt-[3px] text-xs font-medium italic text-[#8AAF95]">
                    {reservation.firstName}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 ml-3">
                  <span className="font-mono text-[11px] font-normal text-[#4A6B55]">
                    {reservation.duration} {reservation.duration === 1 ? "hr" : "hrs"}
                  </span>
                  <span className="text-[13px] font-bold text-[#F0F7F2]">
                    {formatMoney(reservation.totalCostCents, currencyCode)}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
