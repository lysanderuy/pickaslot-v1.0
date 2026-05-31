import { NextRequest, NextResponse } from "next/server";

import { requireAdminProfile } from "@/services/admin/admin-auth";
import { listAdminBookings } from "@/services/admin/admin-booking-service";
import { AppError } from "@/lib/errors";
import { bookingStatusEnum } from "@/lib/db";

const VALID_STATUSES = bookingStatusEnum.enumValues;
const VALID_DATE_RANGES = ["today", "this_week", "this_month"] as const;
const VALID_PAYMENTS = ["gcash", "cash"] as const;
type ValidDateRange = typeof VALID_DATE_RANGES[number];
type ValidPayment = typeof VALID_PAYMENTS[number];

export async function GET(request: NextRequest) {
  try {
    await requireAdminProfile();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const bookingDate = searchParams.get("bookingDate") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const dateRangeStr = searchParams.get("dateRange") ?? undefined;
    const paymentStr = searchParams.get("payment") ?? undefined;
    const dateRange: ValidDateRange | undefined = VALID_DATE_RANGES.includes(dateRangeStr as ValidDateRange)
      ? (dateRangeStr as ValidDateRange)
      : undefined;
    const payment: ValidPayment | undefined = VALID_PAYMENTS.includes(paymentStr as ValidPayment)
      ? (paymentStr as ValidPayment)
      : undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "8", 10);

    if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
    }

    const result = await listAdminBookings({
      status: status ? (status as typeof VALID_STATUSES[number]) : undefined,
      bookingDate,
      search,
      dateRange,
      payment,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 },
    );
  }
}
