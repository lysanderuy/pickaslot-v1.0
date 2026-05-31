import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Court, AvailabilityRow, BookingResponse, Confirmation, PaymentMethod } from "@/types/bookings";

interface UseBookingSubmitOptions {
  court: Court | null;
  selectedDateKey: string;
  selectedSlots: AvailabilityRow[];
  fullName: string;
  contactNumber: string;
  paymentMethod: PaymentMethod;
  onSuccess: (confirmation: Confirmation) => void;
}

export interface UseBookingSubmitResult {
  submitting: boolean;
  submitError: string;
  submitBooking: () => Promise<void>;
}

async function submitBookingRequest(input: {
  courtId: string;
  bookingDate: string;
  fullName: string;
  contactNumber: string;
  paymentMethod: PaymentMethod;
  slotStarts: string[];
}): Promise<BookingResponse> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as BookingResponse & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to submit booking");
  }
  return payload;
}

export function useBookingSubmit({
  court,
  selectedDateKey,
  selectedSlots,
  fullName,
  contactNumber,
  paymentMethod,
  onSuccess,
}: UseBookingSubmitOptions): UseBookingSubmitResult {
  const queryClient = useQueryClient();

  const { isPending, error, mutateAsync } = useMutation({
    mutationFn: submitBookingRequest,
    onSuccess: (data, variables) => {
      const code = data.booking.booking_code ?? "Pending";
      onSuccess({ code, slots: selectedSlots, paymentMethod: variables.paymentMethod });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const submitBooking = async () => {
    if (!court) {
      throw new Error("Court details are still loading. Please try again.");
    }
    if (!fullName.trim() || !contactNumber.trim()) {
      throw new Error("Please fill in your name and contact number.");
    }
    if (selectedSlots.length === 0) {
      throw new Error("Select at least one slot.");
    }

    await mutateAsync({
      courtId: court.id,
      bookingDate: selectedDateKey,
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      paymentMethod,
      slotStarts: selectedSlots.map((slot) => slot.slot_start_at),
    });
  };

  return {
    submitting: isPending,
    submitError: error?.message ?? "",
    submitBooking,
  };
}
