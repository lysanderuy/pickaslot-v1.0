import { NextRequest, NextResponse } from "next/server";

import { getDayAvailability } from "@/services/bookings/public-booking-service";
import { AppError, BadRequestError } from "@/lib/errors";

function assertDateString(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestError("Booking date is required");
  }

  return value;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const bookingDate = assertDateString(searchParams.get("bookingDate"));

    if (!courtId) {
      throw new BadRequestError("Court is required");
    }

    const availability = await getDayAvailability(courtId, bookingDate);
    return NextResponse.json({ availability });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 },
    );
  }
}
