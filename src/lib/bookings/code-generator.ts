export function generateBookingCode(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-4).padStart(4, "0");
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 3 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
  return `${digits}-${suffix}`;
}
