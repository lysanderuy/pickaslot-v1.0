import { NextRequest, NextResponse } from "next/server";

import { lookupBookingByCode } from "@/services/bookings/public-booking-service";
import { AppError, BadRequestError } from "@/lib/errors";

function extractBookingCode(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const value = (body as Record<string, unknown>).bookingCode;

  if (typeof value !== "string") {
    throw new BadRequestError("Booking code is required");
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const bookingCode = extractBookingCode(await request.json());
    const booking = await lookupBookingByCode(bookingCode);
    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to look up booking" },
      { status: 500 },
    );
  }
}
