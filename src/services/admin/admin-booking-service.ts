import { BadRequestError, NotFoundError } from "@/lib/errors";
import { getDataSource } from "@/lib/db";
import { BookingEntity, BookingSlotEntity, BookingStatus } from "@/lib/db/entities";

export interface BookingListFilters {
  status?: BookingStatus;
  bookingDate?: string;
}

export async function listAdminBookings(filters: BookingListFilters = {}) {
  const db = await getDataSource();
  const conditions: string[] = [];
  const values: Array<string> = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`b.status = $${values.length}::booking_status`);
  }

  if (filters.bookingDate) {
    values.push(filters.bookingDate);
    conditions.push(`b.booking_date = $${values.length}::date`);
  }

  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  return (await db.query(
    `
      select
        b.id,
        b.booking_code,
        b.booking_date,
        b.first_name,
        b.contact_number,
        b.payment_method,
        b.status,
        b.slot_count,
        b.price_per_hour_cents_snapshot,
        b.total_cost_cents,
        b.reviewed_at,
        b.rejected_reason,
        b.created_at,
        b.updated_at,
        c.id as court_id,
        c.slug as court_slug,
        c.name as court_name,
        c.timezone,
        string_agg(
          to_char(bs.slot_start_at at time zone c.timezone, 'HH12:MI AM'),
          ', '
          order by bs.slot_start_at
        ) as slot_labels,
        min(bs.slot_start_at) as first_slot_start_at,
        max(bs.slot_end_at) as last_slot_end_at
      from public.bookings b
      join public.courts c on c.id = b.court_id
      join public.booking_slots bs on bs.booking_id = b.id
      ${whereClause}
      group by
        b.id,
        c.id
      order by b.created_at desc
    `,
    values,
  )) as Array<Record<string, unknown>>;
}

export async function respondToBooking(
  bookingId: string,
  action: "confirm" | "reject",
  reviewerId: string,
) {
  if (!bookingId) {
    throw new BadRequestError("Booking id is required");
  }

  const db = await getDataSource();

  return db.transaction(async (manager) => {
    const bookingRepository = manager.getRepository(BookingEntity);
    const slotRepository = manager.getRepository(BookingSlotEntity);
    const booking = await bookingRepository.findOneBy({ id: bookingId });

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.status !== BookingStatus.Pending) {
      return booking;
    }

    const nextStatus =
      action === "confirm" ? BookingStatus.Confirmed : BookingStatus.Rejected;
    const rejectedReason = action === "reject" ? "Rejected by admin" : null;

    await bookingRepository.update(
      { id: bookingId },
      {
        status: nextStatus,
        reviewerId,
        reviewedAt: new Date(),
        rejectedReason,
      },
    );

    await slotRepository.update(
      { bookingId },
      {
        status: nextStatus,
      },
    );

    const updatedBooking = await bookingRepository.findOneBy({ id: bookingId });

    if (!updatedBooking) {
      throw new NotFoundError("Booking not found after update");
    }

    return updatedBooking;
  });
}
