import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/queryClient";
import { getToday, toDateKey } from "@/lib/date/utils";
import { getPrimaryCourt } from "@/services/courts/court-service";
import { getDayAvailability } from "@/services/bookings/public-booking-service";

import { BookPageClient } from "./BookPageClient";

// Court settings and today's availability change with bookings, so this page
// must render per-request rather than being statically cached at build time.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const queryClient = getQueryClient();
  let timeZone: string | undefined;

  try {
    // Fetch the court server-side and seed the client cache, so the first paint
    // already has real content (no skeleton) and crawlers see the real page.
    const court = await queryClient.fetchQuery({
      queryKey: ["court"],
      queryFn: () => getPrimaryCourt(),
    });

    // The client anchors "today" to the court's timezone so its default query
    // key matches the one prefetched below regardless of where the server runs.
    timeZone = court.timezone;

    // Built from the same getToday/toDateKey helpers the client uses for its
    // default selected date, so the prefetched key is guaranteed to match the
    // client's key (a cache hit on first paint) rather than coincidentally
    // agreeing. court.id is known here, so this prefetches with no waterfall.
    const dateKey = toDateKey(getToday(court.timezone));
    await queryClient.prefetchQuery({
      queryKey: ["availability", court.id, dateKey],
      queryFn: () => getDayAvailability(court.id, dateKey),
    });
  } catch {
    // If the server prefetch fails, render the client shell anyway; it retries
    // over the API and surfaces its own loading/error states.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookPageClient timeZone={timeZone} />
    </HydrationBoundary>
  );
}
