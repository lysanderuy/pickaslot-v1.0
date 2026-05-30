"use client";

import { cx } from "@/lib/cx";
import { formatMoney, formatTimeRange } from "@/lib/bookings/formatting";
import { tw } from "@/lib/ui/tokens";
import type { AvailabilityRow, PaymentMethod } from "@/types/bookings";

interface BookingSheetProps {
  open: boolean;
  onClose: () => void;
  selectedSlots: AvailabilityRow[];
  totalCostCents: number;
  currencyCode: string;
  timezone: string;
  priceLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  submitError: string;
  submitting: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8AAF95]">
        {label}
      </label>
      {children}
    </div>
  );
}

function PaymentButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx(
        "flex items-center justify-center gap-2 rounded-[10px] border px-4 py-3.5 text-sm font-semibold transition",
        selected
          ? "border-[#4ADE80] bg-[#4ADE80] text-[#0F2418]"
          : "border-[#2A4A35] bg-[#1C3828] text-[#8AAF95] hover:border-[#4ADE80]"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BookingSheet({
  open,
  onClose,
  selectedSlots,
  totalCostCents,
  currencyCode,
  timezone,
  priceLabel,
  onSubmit,
  firstName,
  setFirstName,
  contactNumber,
  setContactNumber,
  paymentMethod,
  setPaymentMethod,
  submitError,
  submitting,
}: BookingSheetProps) {
  return (
    <>
      <button
        type="button"
        className={cx(
          "pointer-events-none fixed inset-0 z-[100] border-0 bg-[rgba(5,14,9,0.7)] opacity-0 backdrop-blur-md transition",
          open && "pointer-events-auto opacity-100"
        )}
        onClick={onClose}
        aria-label="Close booking sheet"
      />
      <div
        className={cx(
          "fixed bottom-0 left-1/2 z-[101] max-h-[93dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[22px] border-t-2 border-[#4ADE80] bg-[#162E20] transition",
          open ? "translate-y-0" : "translate-y-[104%]",
          "md:bottom-auto md:top-1/2 md:max-w-[520px] md:rounded-[22px] md:border-2",
          open ? "md:-translate-y-1/2 md:opacity-100" : "md:-translate-y-1/2 md:opacity-0 md:pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <form className="px-5 pb-[52px]" onSubmit={onSubmit}>
          <div className="mx-auto mb-[22px] mt-3.5 h-1 w-9 rounded-sm bg-[#2A4A35]" />
          <h2 id="sheet-title" className="mb-1 text-2xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
            Reserve Court
          </h2>
          <p className="mb-[22px] text-[13px] italic text-[#8AAF95]">
            Fill in your details to submit a booking request.
          </p>
          <div className="mb-6 rounded-xl border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5">
            <div className={`${tw.sectionLabel} mb-2.5`}>
              Your Selection
            </div>
            {selectedSlots.map((slot) => (
              <div
                key={slot.slot_start_at}
                className="flex items-center justify-between border-b border-[#1F3D29] py-[7px]"
              >
                <span className="text-sm font-semibold text-[#F0F7F2]">
                  {formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone)}
                </span>
                <span className="font-mono text-[12px] font-normal text-[#8AAF95]">{priceLabel}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center justify-between border-t border-[#2A4A35] pt-[11px]">
              <span className={tw.sectionLabel}>
                Estimated Total
              </span>
              <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#4ADE80]">
                {formatMoney(totalCostCents, currencyCode)}
              </span>
            </div>
          </div>

          <Field label="First Name">
            <input
              id="first-name"
              className="w-full rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5 text-base font-medium text-[#F0F7F2] outline-none transition focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)]"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="e.g. Maria"
              autoComplete="given-name"
            />
          </Field>
          <Field label="Contact Number">
            <input
              id="contact-number"
              className="w-full rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5 text-base font-medium text-[#F0F7F2] outline-none transition focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)]"
              type="tel"
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              placeholder="09XX XXX XXXX"
              autoComplete="tel"
            />
          </Field>
          <div className="mb-5">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8AAF95]">
              Payment Method
            </span>
            <div className="grid grid-cols-2 gap-2">
              <PaymentButton selected={paymentMethod === "gcash"} onClick={() => setPaymentMethod("gcash")}>
                <span>💳</span>
                <span>GCash</span>
              </PaymentButton>
              <PaymentButton selected={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")}>
                <span>💵</span>
                <span>Cash</span>
              </PaymentButton>
            </div>
          </div>
          {submitError && (
            <div className="mb-4 rounded-[10px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)] px-3 py-2.5 text-xs font-bold text-[#F87171]">
              {submitError}
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#4ADE80] p-4 text-[15px] font-extrabold text-[#0F2418] disabled:cursor-wait disabled:opacity-65"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </>
  );
}
