import { BadRequestError, NotFoundError } from "@/lib/errors";
import { db, sql, bookings, bookingSlots, courts } from "@/lib/db";
import { rethrowPgBusinessRule } from "@/lib/db/pg-errors";
import { and, eq, gte } from "drizzle-orm";
import type {
  AvailabilityRow,
  CreateBookingRequestInput,
  PublicBookingLookupResult,
} from "@/types/bookings";

function ensureString(value: string | undefined, message: string): string {
  if (!value || value.trim().length === 0) {
    throw new BadRequestError(message);
  }

  return value.trim();
}

export async function createBookingRequest(input: CreateBookingRequestInput) {
  const courtId = ensureString(input.courtId, "Court is required");
  const bookingDate = ensureString(input.bookingDate, "Booking date is required");
  const fullName = ensureString(input.fullName, "Full name is required");
  const contactNumber = ensureString(input.contactNumber, "Contact number is required");

  // The SQL function is the single source of truth for booking validation
  // (court open/closed, slots ended, continuity, court hours, payment method,
  // slot collisions). Business-rule failures surface as P0001 and are mapped
  // to client errors by rethrowPgBusinessRule below.
  const slotStartsArray = input.slotStarts.map((s) => new Date(s));
  // Format as PostgreSQL array literal: '{val1,val2,...}'
  const slotStartsPgArray = `{${slotStartsArray.map((d) => d.toISOString()).join(",")}}`;

  let result;
  try {
    result = await db.execute(sql`
      select *
      from public.create_booking_request(
        ${courtId}::uuid,
        ${bookingDate}::date,
        ${fullName}::text,
        ${contactNumber}::text,
        ${input.paymentMethod}::payment_method,
        ${slotStartsPgArray}::timestamptz[]
      )
    `);
  } catch (error) {
    rethrowPgBusinessRule(error);
  }

  const rows = result as Array<Record<string, unknown>>;

  if (rows.length === 0) {
    throw new Error("Booking request failed without a response");
  }

  return rows[0];
}

export async function lookupBookingByCode(bookingCode: string): Promise<PublicBookingLookupResult> {
  const code = ensureString(bookingCode, "Booking code is required");

  const [row] = await db
    .select({
      booking_code: bookings.bookingCode,
      full_name: bookings.fullName,
      status: bookings.status,
      payment_method: bookings.paymentMethod,
      price_per_hour: bookings.pricePerHourSnapshot,
      total_amount: bookings.totalAmount,
      booking_date: bookings.bookingDate,
      court_timezone: courts.timezone,
      gcash_number: courts.gcashNumber,
      gcash_name: courts.gcashName,
      messenger_url: courts.messengerUrl,
      slots: sql<Array<{ slot_start_at: string; slot_end_at: string }>>`
        coalesce(
          json_agg(
            json_build_object(
              'slot_start_at', ${bookingSlots.slotStartAt},
              'slot_end_at', ${bookingSlots.slotEndAt}
            )
            order by ${bookingSlots.slotStartAt}
          ),
          '[]'::json
        )
      `,
    })
    .from(bookings)
    .innerJoin(courts, eq(bookings.courtId, courts.id))
    .innerJoin(bookingSlots, eq(bookingSlots.bookingId, bookings.id))
    .where(and(eq(bookings.bookingCode, code), gte(bookings.bookingDate, sql`current_date`)))
    .groupBy(bookings.id, courts.id);

  if (!row) {
    throw new NotFoundError("Booking not found");
  }

  return row as PublicBookingLookupResult;
}


export async function getDayAvailability(courtId: string, bookingDate: string) {
  const result = await db.execute(sql`
    select *
    from public.get_day_availability(${courtId}::uuid, ${bookingDate}::date)
    order by slot_start_at asc
  `);

  return result as unknown as AvailabilityRow[];
}
