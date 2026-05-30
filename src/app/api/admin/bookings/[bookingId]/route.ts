import { NextRequest, NextResponse } from "next/server";

import { requireAdminProfile } from "@/services/admin/admin-auth";
import { respondToBooking } from "@/services/admin/admin-booking-service";
import { AppError, BadRequestError } from "@/lib/errors";

function getAction(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Invalid request body");
  }

  const action = (body as Record<string, unknown>).action;

  if (action !== "confirm" && action !== "reject") {
    throw new BadRequestError("Action must be confirm or reject");
  }

  return action;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await context.params;
    const action = getAction(await request.json());
    const {
      user: { id: reviewerId },
    } = await requireAdminProfile();

    const booking = await respondToBooking(bookingId, action, reviewerId);
    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
