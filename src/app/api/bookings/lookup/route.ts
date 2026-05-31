import { NextRequest, NextResponse } from "next/server";

import { lookupBookingByCode } from "@/services/bookings/public-booking-service";
import { AppError, BadRequestError } from "@/lib/errors";

function extractBookingCode(body: unknown): string {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const b = body as Record<string, unknown>;

  if (typeof b.bookingCode === "string") return b.bookingCode;

  throw new BadRequestError("bookingCode is required");
}

export async function POST(request: NextRequest) {
  try {
    const code = extractBookingCode(await request.json());
    const booking = await lookupBookingByCode(code);
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[Lookup API Error]", error);
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to look up booking" },
      { status: 500 },
    );
  }
}
