"use client";

import { cx } from "@/lib/cx";
import { formatMoney, formatTimeRange } from "@/lib/bookings/formatting";
import { tw } from "@/lib/ui/tokens";
import { FormField } from "@/components/shared/FormField";
import { PaymentButton } from "@/components/shared/PaymentButton";
import type { AvailabilityRow, PaymentMethod } from "@/types/bookings";

/* ─── Constants ─── */

const INPUT_CLASS =
  "w-full rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5 text-base font-medium text-[#F0F7F2] placeholder:text-[#4A6B55] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.1)]";

/* ─── Props ─── */

interface BookingSheetProps {
  open: boolean;
  onClose: () => void;
  selectedSlots: AvailabilityRow[];
  totalCostCents: number;
  currencyCode: string;
  timezone: string;
  priceLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  fullName: string;
  setFullName: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  submitError: string;
  submitting: boolean;
}

/* ─── Component ─── */

export function BookingSheet({
  open,
  onClose,
  selectedSlots,
  totalCostCents,
  currencyCode,
  timezone,
  priceLabel,
  onSubmit,
  fullName,
  setFullName,
  contactNumber,
  setContactNumber,
  paymentMethod,
  setPaymentMethod,
  submitError,
  submitting,
}: BookingSheetProps) {
  const slotListScrollable = selectedSlots.length > 4;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cx(
          "fixed inset-0 z-[100] bg-[rgba(5,14,9,0.7)] opacity-0 backdrop-blur-[6px] transition-opacity duration-[220ms]",
          open ? "opacity-100 pointer-events-auto" : "pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cx(
          "fixed bottom-0 left-1/2 z-[101] flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[22px] border-t-2 border-[#4ADE80] bg-[#162E20] transition-transform duration-[320ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "max-h-[min(93dvh,100%)]",
          open ? "translate-y-0" : "translate-y-[104%]",
          "md:bottom-auto md:top-1/2 md:max-h-[min(90dvh,100%)] md:max-w-[600px] md:rounded-[22px] md:border-2",
          open
            ? "md:-translate-y-1/2 md:opacity-100"
            : "md:-translate-y-1/2 md:opacity-0 md:pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <form
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(52px,env(safe-area-inset-bottom))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-6 md:pb-6"
          onSubmit={onSubmit}
        >
          {/* Pull handle */}
          <div className="mx-auto mb-[22px] mt-3.5 h-1 w-9 rounded-sm bg-[#2A4A35]" />

          {/* Title */}
          <h2
            id="sheet-title"
            className="mb-1 text-2xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]"
          >
            Reserve Court
          </h2>
          <p className="mb-[22px] text-[13px] italic text-[#8AAF95]">
            Fill in your details to submit a booking request.
          </p>

          {/* Summary box */}
          <div className="mb-6 rounded-xl border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5">
            <div className={cx(tw.sectionLabel, "mb-2.5 flex items-center justify-between gap-2")}>
              <span>Your Selection</span>
              {slotListScrollable && (
                <span className="font-mono text-[10px] font-normal normal-case tracking-[0.02em] text-[#4A6B55]">
                  {selectedSlots.length} slots
                </span>
              )}
            </div>
            <div
              className={cx(
                slotListScrollable &&
                  "max-h-[min(24vh,168px)] overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
            >
              {selectedSlots.map((slot) => (
                <div
                  key={slot.slot_start_at}
                  className="flex items-center justify-between gap-3 border-b border-[#1F3D29] py-[7px] last:border-b-0"
                >
                  <span className="min-w-0 text-sm font-semibold text-[#F0F7F2]">
                    {formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone)}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] font-normal text-[#8AAF95]">
                    {priceLabel}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t border-[#2A4A35] pt-[11px]">
              <span className={tw.sectionLabel}>Estimated Total</span>
              <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#4ADE80]">
                {formatMoney(totalCostCents, currencyCode)}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <FormField label="Full Name">
            <input
              id="full-name"
              className={INPUT_CLASS}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Maria Santos"
              autoComplete="name"
            />
          </FormField>

          {/* Contact Number */}
          <FormField label="Contact Number">
            <input
              id="contact-number"
              className={INPUT_CLASS}
              type="tel"
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              placeholder="09XX XXX XXXX"
              autoComplete="tel"
            />
          </FormField>

          {/* Payment Method */}
          <FormField label="Payment Method">
            <div className="grid grid-cols-2 gap-2.5">
              <PaymentButton
                selected={paymentMethod === "gcash"}
                onClick={() => setPaymentMethod("gcash")}
              >
                <span>💳</span>
                <span>GCash</span>
              </PaymentButton>
              <PaymentButton
                selected={paymentMethod === "cash"}
                onClick={() => setPaymentMethod("cash")}
              >
                <span>💵</span>
                <span>Cash</span>
              </PaymentButton>
            </div>
          </FormField>

          {/* Inline error */}
          {submitError && (
            <div className="mb-4 rounded-[10px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)] px-3 py-2.5 text-xs font-bold text-[#F87171]">
              {submitError}
            </div>
          )}

          {/* Submit - accent button per design system (--accent = #F0F7F2) */}
          <button
            type="submit"
            className="mt-[26px] w-full rounded-xl bg-[#F0F7F2] p-4 text-[15px] font-extrabold tracking-[-0.01em] text-[#0F2418] shadow-[0_4px_20px_rgba(240,247,242,0.12)] transition-[transform,opacity] duration-[150ms] active:scale-[0.98] active:opacity-90 disabled:cursor-wait disabled:opacity-65"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </>
  );
}
