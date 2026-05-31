export type SlotState = "available" | "pending" | "confirmed" | "past";
export type UiSlotState = "available" | "pending" | "taken" | "past";
export type PaymentMethod = "gcash" | "cash";
export type LookupState = "idle" | "loading" | "result" | "error";

export interface Court {
  id: string;
  name: string;
  location: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  pricePerHourCents: number;
  currencyCode: string;
  isAcceptingBookings: boolean;
  acceptsGcash: boolean;
  acceptsCash: boolean;
  houseRules: string;
  gcashNumber: string | null;
  gcashName: string | null;
  messengerUrl: string | null;
}

export interface AvailabilityRow {
  slot_start_at: string;
  slot_end_at: string;
  slot_state: SlotState;
  booking_id: string | null;
  booking_code: string | null;
  full_name: string | null;
  payment_method: PaymentMethod | null;
  total_amount: number | null;
}

export interface PublicBookingLookupResult {
  booking_code: string;
  full_name: string;
  status: "pending" | "confirmed" | "rejected";
  payment_method: PaymentMethod;
  price_per_hour_cents: number;
  total_amount: number;
  booking_date: string;
  court_timezone: string;
  gcash_number: string | null;
  gcash_name: string | null;
  messenger_url: string | null;
  slots: Array<{
    slot_start_at: string;
    slot_end_at: string;
  }>;
}

export interface ConfirmedReservation {
  bookingId: string;
  timeRange: string;
  fullName: string;
  duration: number;
  totalAmount: number;
}

export interface Confirmation {
  code: string;
  slots: AvailabilityRow[];
  paymentMethod: PaymentMethod;
}

export interface BookingResponse {
  booking: {
    booking_code: string;
  };
}

export interface CreateBookingRequestInput {
  courtId: string;
  bookingDate: string;
  fullName: string;
  contactNumber: string;
  paymentMethod: PaymentMethod;
  slotStarts: string[];
}
