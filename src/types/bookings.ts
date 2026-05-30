import type { BookingStatus, PaymentMethod } from "@/lib/db";

export interface CreateBookingRequestInput {
  courtId: string;
  bookingDate: string;
  firstName: string;
  contactNumber: string;
  paymentMethod: PaymentMethod;
  slotStarts: string[];
}

export interface PublicBookingLookupSlot {
  slot_start_at: string;
  slot_end_at: string;
  status: BookingStatus;
}

export interface PublicBookingLookupResult {
  booking_id: string;
  booking_code: string;
  court_id: string;
  court_name: string;
  booking_date: string;
  first_name: string;
  contact_number: string;
  payment_method: PaymentMethod;
  status: BookingStatus;
  slot_count: number;
  price_per_hour_cents: number;
  total_cost_cents: number;
  reviewed_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
  slots: PublicBookingLookupSlot[];
}

export interface DayAvailabilityRow {
  slot_start_at: string;
  slot_end_at: string;
  slot_state: "available" | "pending" | "confirmed" | "past";
  booking_id: string | null;
  booking_code: string | null;
  first_name: string | null;
  payment_method: PaymentMethod | null;
  total_cost_cents: number | null;
}
