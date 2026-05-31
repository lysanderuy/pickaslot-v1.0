import { NextRequest, NextResponse } from "next/server";

import { requireAdminProfile } from "@/services/admin/admin-auth";
import { updateCourtSettings } from "@/services/courts/court-service";
import { AppError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ courtId: string }> },
) {
  try {
    await requireAdminProfile();
    const { courtId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const court = await updateCourtSettings(courtId, {
      slug: typeof body.slug === "string" ? body.slug : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      location: typeof body.location === "string" ? body.location : undefined,
      timezone: typeof body.timezone === "string" ? body.timezone : undefined,
      openTime: typeof body.openTime === "string" ? body.openTime : undefined,
      closeTime: typeof body.closeTime === "string" ? body.closeTime : undefined,
      pricePerHour:
        typeof body.pricePerHour === "number"
          ? body.pricePerHour
          : undefined,
      currencyCode:
        typeof body.currencyCode === "string" ? body.currencyCode : undefined,
      isAcceptingBookings:
        typeof body.isAcceptingBookings === "boolean"
          ? body.isAcceptingBookings
          : undefined,
      acceptsGcash:
        typeof body.acceptsGcash === "boolean"
          ? body.acceptsGcash
          : undefined,
      acceptsCash:
        typeof body.acceptsCash === "boolean"
          ? body.acceptsCash
          : undefined,
      houseRules: typeof body.houseRules === "string" ? body.houseRules : undefined,
      gcashNumber:
        body.gcashNumber === null || typeof body.gcashNumber === "string"
          ? (body.gcashNumber as string | null)
          : undefined,
      gcashName:
        body.gcashName === null || typeof body.gcashName === "string"
          ? (body.gcashName as string | null)
          : undefined,
      messengerUrl:
        body.messengerUrl === null || typeof body.messengerUrl === "string"
          ? (body.messengerUrl as string | null)
          : undefined,
    });

    return NextResponse.json({ court });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to update court settings" },
      { status: 500 },
    );
  }
}
