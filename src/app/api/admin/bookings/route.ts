import { NextRequest, NextResponse } from "next/server";

import { requireAdminProfile } from "@/services/admin/admin-auth";
import { listAdminBookings } from "@/services/admin/admin-booking-service";
import { AppError } from "@/lib/errors";
import { BookingStatus } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await requireAdminProfile();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const bookingDate = searchParams.get("bookingDate") ?? undefined;

    if (
      status &&
      status !== BookingStatus.Pending &&
      status !== BookingStatus.Confirmed &&
      status !== BookingStatus.Rejected
    ) {
      return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
    }

    const bookings = await listAdminBookings({
      status: status ? (status as BookingStatus) : undefined,
      bookingDate,
    });

    return NextResponse.json({ bookings });
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
