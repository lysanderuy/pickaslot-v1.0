import { useState, useEffect, useCallback } from "react";
import type { Court, AvailabilityRow } from "@/types/bookings";
import { toDateKey } from "@/lib/date/toDateKey";

interface UseCourtResult {
  court: Court | null;
  availability: AvailabilityRow[];
  courtError: string;
  availabilityError: string;
  courtLoading: boolean;
  availabilityLoading: boolean;
  loadCourt: () => Promise<void>;
  loadAvailability: (court: Court, dateKey: string) => Promise<void>;
}

async function fetchCourt(): Promise<Court> {
  const response = await fetch("/api/courts/current", { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.court) {
    throw new Error(payload.error ?? "Failed to load court details");
  }
  return payload.court;
}

async function fetchAvailability(court: Court, dateKey: string): Promise<AvailabilityRow[]> {
  const params = new URLSearchParams({ courtId: court.id, bookingDate: dateKey });
  const response = await fetch(`/api/bookings/availability?${params.toString()}`, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.availability) {
    throw new Error(payload.error ?? "Failed to load availability");
  }
  return payload.availability;
}

export function useCourt(): UseCourtResult {
  const [court, setCourt] = useState<Court | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [courtError, setCourtError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [courtLoading, setCourtLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  const loadCourt = useCallback(async () => {
    setCourtLoading(true);
    setCourtError("");
    try {
      const fetchedCourt = await fetchCourt();
      setCourt(fetchedCourt);
    } catch (error) {
      setCourtError(error instanceof Error ? error.message : "Failed to load court details");
    } finally {
      setCourtLoading(false);
    }
  }, []);

  const loadAvailability = useCallback(async (nextCourt: Court, dateKey: string) => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const nextAvailability = await fetchAvailability(nextCourt, dateKey);
      setAvailability(nextAvailability);
    } catch (error) {
      setAvailability([]);
      setAvailabilityError(error instanceof Error ? error.message : "Failed to load availability");
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Initial court load
  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    void loadCourt();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  // Load availability when court is ready (initial load for today)
  useEffect(() => {
    if (!court) return;

    let active = true;

    async function loadInitialAvailability() {
      if (!court) return;
      try {
        const todayKey = toDateKey(new Date());
        const nextAvailability = await fetchAvailability(court, todayKey);
        if (active) {
          setAvailability(nextAvailability);
        }
      } catch (error) {
        if (active) {
          setAvailability([]);
          setAvailabilityError(error instanceof Error ? error.message : "Failed to load availability");
        }
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadInitialAvailability();

    return () => {
      active = false;
    };
  }, [court]);

  return {
    court,
    availability,
    courtError,
    availabilityError,
    courtLoading,
    availabilityLoading,
    loadCourt,
    loadAvailability,
  };
}
