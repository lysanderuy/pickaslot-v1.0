export const BOOKING_CODE_REGEX = /^[0-9]{4}-[A-Z0-9]{3}$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBookingCode(code: string): ValidationResult {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: "Code is required" };
  }
  if (!BOOKING_CODE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Booking codes look like 1234-XK9 — four digits, a dash, then three characters.",
    };
  }
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, error: "Phone number is required" };
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) {
    return { valid: false, error: "Please enter a valid phone number" };
  }
  return { valid: true };
}
