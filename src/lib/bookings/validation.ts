export const BOOKING_CODE_REGEX = /^[0-9]{5}$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBookingCode(code: string): ValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, error: "Code is required" };
  }
  if (!BOOKING_CODE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Booking codes are 5 digits, e.g. 00042.",
    };
  }
  return { valid: true };
}

export type LookupInputType = "code" | "invalid";

export function detectLookupInput(raw: string): {
  type: LookupInputType;
  value: string;
  error?: string;
} {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 5) {
    return { type: "code", value: digits };
  }
  return {
    type: "invalid",
    value: raw,
    error: "Enter your 5-digit booking code.",
  };
}
