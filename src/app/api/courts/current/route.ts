import { NextResponse } from "next/server";

import { getPrimaryCourt } from "@/services/courts/court-service";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const court = await getPrimaryCourt();
    return NextResponse.json({ court });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Failed to load court details" },
      { status: 500 },
    );
  }
}
