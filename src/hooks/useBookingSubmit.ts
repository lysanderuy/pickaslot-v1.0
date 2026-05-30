import { useState, useCallback } from "react";
import type { Confirmation, PaymentMethod, AvailabilityRow } from "@/types/bookings";

interface UseBookingSubmitOptions {
  courtId: string;
  bookingDate: string;
  slotStarts: string[];
}

interface UseBookingSubmitResult {
  submitting: boolean;
  submitError: string;
  confirmation: Confirmation | null;
  submitBooking: (fullName: string, contactNumber: string, paymentMethod: PaymentMethod) => Promise<boolean>;
  clearConfirmation: () => void;
}

export function useBookingSubmit(options: UseBookingSubmitOptions): UseBookingSubmitResult {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const submitBooking = useCallback(
    async (fullName: string, contactNumber: string, paymentMethod: PaymentMethod): Promise<boolean> => {
      if (!fullName.trim() || !contactNumber.trim()) {
        setSubmitError("Please fill in your name and contact number.");
        return false;
      }

      setSubmitting(true);
      setSubmitError("");

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courtId: options.courtId,
            bookingDate: options.bookingDate,
            fullName: fullName.trim(),
            contactNumber: contactNumber.trim(),
            paymentMethod,
            slotStarts: options.slotStarts,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to submit booking");
        }

        const code = payload.booking.booking_code ?? payload.booking.bookingCode ?? "Pending";
        // Build proper slot objects for confirmation
        const slots: AvailabilityRow[] = options.slotStarts.map((start) => ({
          slot_start_at: start,
          slot_end_at: new Date(new Date(start).getTime() + 3600000).toISOString(),
          slot_state: "pending",
          booking_id: null,
          booking_code: null,
          full_name: null,
          payment_method: null,
          total_cost_cents: null,
        }));
        setConfirmation({ code, slots });
        return true;
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to submit booking");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [options.courtId, options.bookingDate, options.slotStarts]
  );

  const clearConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  return { submitting, submitError, confirmation, submitBooking, clearConfirmation };
}
