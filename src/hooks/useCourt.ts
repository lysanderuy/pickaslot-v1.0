import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Court, AvailabilityRow } from "@/types/bookings";

async function fetchCourt(): Promise<Court> {
  const response = await fetch("/api/courts/current");
  const payload = (await response.json()) as { court?: Court; error?: string };
  if (!response.ok || !payload.court) {
    throw new Error(payload.error ?? "Failed to load court details");
  }
  return payload.court;
}

async function fetchAvailability(courtId: string, dateKey: string): Promise<AvailabilityRow[]> {
  const params = new URLSearchParams({ courtId, bookingDate: dateKey });
  const response = await fetch(`/api/bookings/availability?${params.toString()}`);
  const payload = (await response.json()) as { availability?: AvailabilityRow[]; error?: string };
  if (!response.ok || !payload.availability) {
    throw new Error(payload.error ?? "Failed to load availability");
  }
  return payload.availability;
}

export interface UseCourtResult {
  court: Court | null;
  courtError: string | null;
  courtLoading: boolean;
  availability: AvailabilityRow[];
  availabilityError: string | null;
  availabilityLoading: boolean;
  refreshCourt: () => void;
  refreshAvailability: () => void;
}

export function useCourt(selectedDateKey: string): UseCourtResult {
  const queryClient = useQueryClient();

  const {
    data: court,
    error: courtError,
    isLoading: courtLoading,
  } = useQuery<Court, Error>({
    queryKey: ["court"],
    queryFn: fetchCourt,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: availability = [],
    error: availabilityError,
    isLoading: availabilityLoading,
  } = useQuery<AvailabilityRow[], Error>({
    queryKey: ["availability", court?.id, selectedDateKey],
    queryFn: () => fetchAvailability(court!.id, selectedDateKey),
    enabled: !!court,
    staleTime: 10 * 1000, // 10 seconds
  });

  const refreshCourt = () => {
    queryClient.invalidateQueries({ queryKey: ["court"] });
  };

  const refreshAvailability = () => {
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  return {
    court: court ?? null,
    courtError: courtError?.message ?? null,
    courtLoading,
    availability,
    availabilityError: availabilityError?.message ?? null,
    availabilityLoading,
    refreshCourt,
    refreshAvailability,
  };
}
