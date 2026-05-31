import { BadRequestError, NotFoundError } from "@/lib/errors";
import { db, courts } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { serverEnv } from "@/lib/env.server";

/**
 * MVP Single-Court Configuration
 *
 * This application is designed for a single court (MVP).
 * The schema supports multiple courts, but the app logic assumes one primary court.
 *
 * Configuration options:
 * 1. Set COURT_ID env var to explicitly specify which court to use (recommended for production)
 * 2. If COURT_ID is not set, falls back to first court by createdAt (development default)
 */

export interface CourtSettingsUpdateInput {
  slug?: string;
  name?: string;
  location?: string;
  timezone?: string;
  openTime?: string;
  closeTime?: string;
  pricePerHourCents?: number;
  currencyCode?: string;
  isAcceptingBookings?: boolean;
  acceptsGcash?: boolean;
  acceptsCash?: boolean;
  houseRules?: string;
  gcashNumber?: string | null;
  gcashName?: string | null;
  messengerUrl?: string | null;
}

export async function getPrimaryCourt() {
  // If COURT_ID is explicitly set, use that court
  if (serverEnv.COURT_ID) {
    const court = await db.query.courts.findFirst({
      where: eq(courts.id, serverEnv.COURT_ID),
    });

    if (!court) {
      throw new NotFoundError(`Court with ID ${serverEnv.COURT_ID} not found`);
    }

    return court;
  }

  // MVP fallback: return first court by createdAt
  // This is for development/initial setup before COURT_ID is configured
  const court = await db.query.courts.findFirst({
    orderBy: asc(courts.createdAt),
  });

  if (!court) {
    throw new NotFoundError("Court not found");
  }

  return court;
}

export async function updateCourtSettings(
  courtId: string,
  input: CourtSettingsUpdateInput,
) {
  const updates: Partial<typeof courts.$inferInsert> = {};

  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.name !== undefined) updates.name = input.name;
  if (input.location !== undefined) updates.location = input.location;
  if (input.timezone !== undefined) updates.timezone = input.timezone;
  if (input.openTime !== undefined) updates.openTime = input.openTime;
  if (input.closeTime !== undefined) updates.closeTime = input.closeTime;
  if (input.pricePerHourCents !== undefined) updates.pricePerHourCents = input.pricePerHourCents;
  if (input.currencyCode !== undefined) updates.currencyCode = input.currencyCode;
  if (input.isAcceptingBookings !== undefined) updates.isAcceptingBookings = input.isAcceptingBookings;
  if (input.acceptsGcash !== undefined) updates.acceptsGcash = input.acceptsGcash;
  if (input.acceptsCash !== undefined) updates.acceptsCash = input.acceptsCash;
  if (input.houseRules !== undefined) updates.houseRules = input.houseRules;
  if (input.gcashNumber !== undefined) updates.gcashNumber = input.gcashNumber;
  if (input.gcashName !== undefined) updates.gcashName = input.gcashName;
  if (input.messengerUrl !== undefined) updates.messengerUrl = input.messengerUrl;

  if (Object.keys(updates).length === 0) {
    throw new BadRequestError("At least one court setting must be provided");
  }

  const rows = await db
    .update(courts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(courts.id, courtId))
    .returning();

  const court = rows[0];

  if (!court) {
    throw new NotFoundError("Court not found");
  }

  return court;
}
