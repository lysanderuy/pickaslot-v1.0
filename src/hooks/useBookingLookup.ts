import { useState, useCallback } from "react";
import type { PublicBookingLookupResult, LookupState } from "@/types/bookings";
import { validateBookingCode } from "@/lib/bookings/validation";

interface UseBookingLookupResult {
  state: LookupState;
  booking: PublicBookingLookupResult | null;
  error: { title: string; sub: string } | null;
  lookup: (code: string) => Promise<void>;
  clear: () => void;
}

export function useBookingLookup(): UseBookingLookupResult {
  const [state, setState] = useState<LookupState>("idle");
  const [booking, setBooking] = useState<PublicBookingLookupResult | null>(null);
  const [error, setError] = useState<{ title: string; sub: string } | null>(null);

  const lookup = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setState("idle");
      return;
    }

    const validation = validateBookingCode(trimmed);
    if (!validation.valid) {
      setError({ title: "Invalid code format", sub: validation.error! });
      setState("error");
      return;
    }

    setState("loading");
    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode: trimmed }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError({
            title: "Booking not found",
            sub: "We couldn't find a booking with that code. Make sure you entered it exactly as shown on your confirmation screen.",
          });
        } else {
          setError({
            title: "Lookup failed",
            sub: (data as { error?: string }).error ?? "Something went wrong. Please try again.",
          });
        }
        setState("error");
        return;
      }

      if (!data.booking) {
        setError({ title: "Booking not found", sub: "We couldn't find a booking with that code." });
        setState("error");
        return;
      }

      setBooking(data.booking);
      setState("result");
    } catch {
      setError({ title: "Lookup failed", sub: "Something went wrong. Please check your connection and try again." });
      setState("error");
    }
  }, []);

  const clear = useCallback(() => {
    setState("idle");
    setBooking(null);
    setError(null);
  }, []);

  return { state, booking, error, lookup, clear };
}
