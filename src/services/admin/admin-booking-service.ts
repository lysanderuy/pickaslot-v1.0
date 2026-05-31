import { BadRequestError, NotFoundError } from "@/lib/errors";
import { db, bookings, bookingSlots, courts, bookingStatusEnum, sql } from "@/lib/db";
import { eq, and, desc, or, ilike, inArray } from "drizzle-orm";
import { getPrimaryCourt } from "@/services/courts/court-service";

type AdminBookingStatus = typeof bookingStatusEnum.enumValues[number];

export interface BookingListFilters {
  status?: AdminBookingStatus;
  bookingDate?: string;
  search?: string;
  dateRange?: "today" | "this_week" | "this_month";
  payment?: "gcash" | "cash";
  limit?: number;
  page?: number;
}

export interface PaginatedBookings {
  bookings: typeof bookings.$inferSelect[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OverviewStats {
  pendingCount: number;
  confirmedTodayCount: number;
  totalTodayCount: number;
  weekRevenue: number;
}

function getLocalDateStr(timezone: string): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: timezone });
}

function getLocalStartOfWeekStr(timezone: string): string {
  const today = getLocalDateStr(timezone);
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setDate(day - daysFromMonday);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildWhereConditions(filters: BookingListFilters, timezone: string) {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(bookings.status, filters.status));
  }

  if (filters.bookingDate) {
    conditions.push(eq(bookings.bookingDate, filters.bookingDate));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(bookings.fullName, term), ilike(bookings.bookingCode, term)));
  }

  if (filters.dateRange) {
    const today = getLocalDateStr(timezone);
    if (filters.dateRange === "today") {
      conditions.push(eq(bookings.bookingDate, today));
    } else if (filters.dateRange === "this_week") {
      conditions.push(sql`${bookings.bookingDate} >= ${getLocalStartOfWeekStr(timezone)}`);
    } else if (filters.dateRange === "this_month") {
      conditions.push(sql`${bookings.bookingDate} >= ${today.slice(0, 7) + "-01"}`);
    }
  }

  if (filters.payment) {
    conditions.push(eq(bookings.paymentMethod, filters.payment));
  }

  return conditions;
}

const slotLabelsSql = sql<string>`string_agg(
  to_char(${bookingSlots.slotStartAt} at time zone ${courts.timezone}, 'HH12:MI AM'),
  ', '
  order by ${bookingSlots.slotStartAt}
)`;

const BOOKING_SELECT = {
  id: bookings.id,
  bookingCode: bookings.bookingCode,
  bookingDate: bookings.bookingDate,
  fullName: bookings.fullName,
  contactNumber: bookings.contactNumber,
  paymentMethod: bookings.paymentMethod,
  status: bookings.status,
  slotCount: bookings.slotCount,
  pricePerHourSnapshot: bookings.pricePerHourSnapshot,
  totalAmount: bookings.totalAmount,
  reviewedAt: bookings.reviewedAt,
  rejectedReason: bookings.rejectedReason,
  createdAt: bookings.createdAt,
  updatedAt: bookings.updatedAt,
  courtId: courts.id,
  courtSlug: courts.slug,
  courtName: courts.name,
  timezone: courts.timezone,
  slotLabels: slotLabelsSql,
};

function bookingQueryBase() {
  return db
    .select(BOOKING_SELECT)
    .from(bookings)
    .innerJoin(courts, eq(bookings.courtId, courts.id))
    .innerJoin(bookingSlots, eq(bookingSlots.bookingId, bookings.id))
    .$dynamic();
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const court = await getPrimaryCourt();
  const today = getLocalDateStr(court.timezone);
  const startOfWeek = getLocalStartOfWeekStr(court.timezone);

  const result = await db.execute(sql`
    select
      (select count(*) from public.bookings where status = 'pending')::text as pending_count,
      (select count(*) from public.bookings where status = 'confirmed' and booking_date = ${today}::date)::text as confirmed_today_count,
      (select count(*) from public.bookings where booking_date = ${today}::date)::text as total_today_count,
      coalesce(
        (select sum(total_amount) from public.bookings where status = 'confirmed' and booking_date >= ${startOfWeek}::date),
        0
      )::text as week_revenue
  `);

  const row = result[0] as {
    pending_count: string;
    confirmed_today_count: string;
    total_today_count: string;
    week_revenue: string;
  };

  return {
    pendingCount: Number(row.pending_count),
    confirmedTodayCount: Number(row.confirmed_today_count),
    totalTodayCount: Number(row.total_today_count),
    weekRevenue: Number(row.week_revenue),
  };
}

export async function listAdminBookings(filters: BookingListFilters = {}): Promise<PaginatedBookings> {
  const court = await getPrimaryCourt();
  const conditions = buildWhereConditions(filters, court.timezone);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit ?? 8;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    bookingQueryBase()
      .where(whereClause)
      .groupBy(bookings.id, courts.id)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(bookings)
      .where(whereClause),
  ]);

  return {
    bookings: rows as unknown as typeof bookings.$inferSelect[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRecentPendingBookings(limit: number) {
  return bookingQueryBase()
    .where(eq(bookings.status, "pending"))
    .groupBy(bookings.id, courts.id)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function getRecentActivityBookings(limit: number) {
  return bookingQueryBase()
    .where(inArray(bookings.status, ["confirmed", "rejected"]))
    .groupBy(bookings.id, courts.id)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function respondToBooking(
  bookingId: string,
  action: "confirm" | "reject",
  reviewerId: string,
) {
  if (!bookingId) {
    throw new BadRequestError("Booking id is required");
  }

  return db.transaction(async (tx) => {
    const booking = await tx.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.status !== "pending") {
      return booking;
    }

    const nextStatus: typeof bookingStatusEnum.enumValues[number] =
      action === "confirm" ? "confirmed" : "rejected";

    const [updatedBooking] = await tx
      .update(bookings)
      .set({
        status: nextStatus,
        reviewerId,
        reviewedAt: new Date(),
        rejectedReason: action === "reject" ? "Rejected by admin" : null,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      throw new NotFoundError("Booking not found after update");
    }

    await tx
      .update(bookingSlots)
      .set({ status: nextStatus })
      .where(eq(bookingSlots.bookingId, bookingId));

    return updatedBooking;
  });
}
