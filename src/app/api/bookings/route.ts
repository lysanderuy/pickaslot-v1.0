import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createBookingRequest } from "@/services/bookings/public-booking-service";
import { BadRequestError, AppError } from "@/lib/errors";

const BookingRequestSchema = z.object({
  courtId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fullName: z.string().min(1),
  contactNumber: z.string().min(1),
  paymentMethod: z.enum(["gcash", "cash"]),
  slotStarts: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = BookingRequestSchema.safeParse(json);

    if (!result.success) {
      throw new BadRequestError("Invalid booking payload");
    }

    const booking = await createBookingRequest(result.data);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("[Booking API Error]", error);
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to create booking", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
