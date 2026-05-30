import { NextRequest, NextResponse } from "next/server";

import { createBookingRequest } from "@/services/bookings/public-booking-service";
import { BadRequestError, AppError } from "@/lib/errors";
import { PaymentMethod } from "@/lib/db";

function parseJsonBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  return body as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = parseJsonBody(await request.json());

    const courtId = body.courtId;
    const bookingDate = body.bookingDate;
    const firstName = body.firstName;
    const contactNumber = body.contactNumber;
    const paymentMethod = body.paymentMethod;
    const slotStarts = body.slotStarts;

    if (
      typeof courtId !== "string" ||
      typeof bookingDate !== "string" ||
      typeof firstName !== "string" ||
      typeof contactNumber !== "string" ||
      (paymentMethod !== PaymentMethod.Cash && paymentMethod !== PaymentMethod.GCash) ||
      !Array.isArray(slotStarts) ||
      slotStarts.some((slot) => typeof slot !== "string")
    ) {
      throw new BadRequestError("Invalid booking payload");
    }

    const booking = await createBookingRequest({
      courtId,
      bookingDate,
      firstName,
      contactNumber,
      paymentMethod,
      slotStarts,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
