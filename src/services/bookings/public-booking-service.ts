import { BadRequestError, NotFoundError } from "@/lib/errors";
import { getDataSource } from "@/lib/db";
import { rethrowPgBusinessRule } from "@/lib/db/pg-errors";
import type {
  CreateBookingRequestInput,
  DayAvailabilityRow,
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

  if (input.slotStarts.length === 0) {
    throw new BadRequestError("Select at least one slot");
  }

  const db = await getDataSource();

  let rows: Array<Record<string, unknown>>;
  try {
    rows = (await db.query(
      `
        select *
        from public.create_booking_request(
          $1::uuid,
          $2::date,
          $3::text,
          $4::text,
          $5::payment_method,
          $6::timestamptz[]
        )
      `,
      [courtId, bookingDate, fullName, contactNumber, input.paymentMethod, input.slotStarts],
    )) as Array<Record<string, unknown>>;
  } catch (error) {
    rethrowPgBusinessRule(error);
  }

  if (rows.length === 0) {
    throw new Error("Booking request failed without a response");
  }

  return rows[0];
}

export async function lookupBookingByCode(bookingCode: string) {
  const code = ensureString(bookingCode, "Booking code is required");
  const db = await getDataSource();
  const rows = (await db.query(
    `select * from public.lookup_booking_by_code($1::text)`,
    [code],
  )) as PublicBookingLookupResult[];

  const booking = rows[0];

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  return booking;
}

export async function getDayAvailability(courtId: string, bookingDate: string) {
  const db = await getDataSource();
  return (await db.query(
    `
      select *
      from public.get_day_availability($1::uuid, $2::date)
      order by slot_start_at asc
    `,
    [courtId, bookingDate],
  )) as DayAvailabilityRow[];
}
