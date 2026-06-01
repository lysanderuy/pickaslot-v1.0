"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { formatTimeRange } from "@/lib/bookings/formatting";
import { tw } from "@/lib/ui/tokens";
import type { AvailabilityRow, PaymentMethod } from "@/types/bookings";

interface BookingConfirmationProps {
  open: boolean;
  code: string;
  slots: AvailabilityRow[];
  priceLabel: string;
  timezone: string;
  paymentMethod: PaymentMethod;
  gcashNumber: string | null;
  gcashName: string | null;
  messengerUrl: string | null;
  onClose: () => void;
}

export function BookingConfirmation({
  open,
  code,
  slots,
  priceLabel,
  timezone,
  paymentMethod,
  gcashNumber,
  gcashName,
  messengerUrl,
  onClose,
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const slotListScrollable = slots.length > 4;


  async function handleCopyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cx(
          "fixed inset-0 z-[200] bg-[rgba(5,14,9,0.72)] opacity-0 backdrop-blur-[6px] transition-opacity duration-[180ms]",
          open ? "opacity-100 pointer-events-auto" : "pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Sheet (bottom on mobile, centered modal on desktop) */}
      <div
        className={cx(
          "fixed bottom-0 left-1/2 z-[201] flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden bg-[#0F2418]",
          "max-h-[min(92dvh,100%)] rounded-t-[22px] border-t-2 border-[#4ADE80]",
          "transition-[transform,opacity] duration-[320ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "md:bottom-auto md:top-1/2 md:max-h-[min(90dvh,100%)] md:w-[min(560px,calc(100vw-2rem))] md:max-w-none md:rounded-[22px] md:border-2",
          open ? "translate-y-0" : "translate-y-full",
          open
            ? "md:-translate-x-1/2 md:-translate-y-1/2 md:opacity-100"
            : "md:-translate-x-1/2 md:-translate-y-1/2 md:opacity-0 md:pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull handle - hidden on desktop */}
        <div className="mx-auto mt-[14px] h-[4px] w-[36px] rounded-full bg-[#2A4A35] md:hidden" />

        {/* Header */}
        <div className="shrink-0 border-b border-[#2A4A35] px-[22px] pb-5 pt-5 md:pb-6 md:pt-8">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]">
            Booking Requested
          </div>
          <h1 className="mb-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#F0F7F2] md:text-[32px] md:text-balance">
            You&apos;re on the{" "}
            <em className="not-italic text-[#4ADE80]">queue.</em>
          </h1>
          <p className="text-[13px] leading-[1.5] text-[#8AAF95]">
            Admin will confirm once payment is received. Follow the steps below.
          </p>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-5 pt-5 [scrollbar-width:none] md:pb-6 md:pt-6">
          {/* Booking code */}
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#2A4A35] bg-[#162E20] p-[18px]">
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-[linear-gradient(90deg,#4ADE80,transparent)]" />
            <div className={tw.sectionLabel}>Your Booking Code</div>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 font-mono text-[36px] font-medium leading-none tracking-[0.06em] text-[#4ADE80] md:text-[42px]">
                {code || "..."}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!code}
                aria-label={copied ? "Booking code copied" : "Copy booking code"}
                className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8AAF95] transition-[background-color,color,opacity] duration-[150ms] active:bg-[#243D2E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  "Copied!"
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Slot list */}
          <div className="mb-4 rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-3.5">
            <div className={cx(tw.sectionLabel, "mb-2.5 flex items-center justify-between gap-2")}>
              <span>Your Selection</span>
              {slotListScrollable && (
                <span className="font-mono text-[10px] font-normal normal-case tracking-[0.02em] text-[#4A6B55]">
                  {slots.length} slots
                </span>
              )}
            </div>
            <div
              className={cx(
                slotListScrollable &&
                "max-h-[min(24vh,168px)] overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
            >
              {slots.map((slot) => (
                <div
                  key={slot.slot_start_at}
                  className="flex items-center justify-between gap-3 border-b border-[#1F3D29] py-[7px] last:border-b-0"
                >
                  <span className="min-w-0 text-sm font-semibold text-[#F0F7F2]">
                    {formatTimeRange(slot.slot_start_at, slot.slot_end_at, timezone)}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-normal text-[#4A6B55]">
                    1 hr · {priceLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What to do now */}
          <div className="mb-4 rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-3.5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">
              What to do now
            </div>
            {paymentMethod === "gcash" ? (
              <div className="flex flex-col gap-3">
                <p className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                  Send your GCash payment
                  {gcashName && gcashNumber ? (
                    <>
                      {" "}to{" "}
                      <strong className="font-semibold text-[#F0F7F2]">{gcashName}</strong>
                      {" · "}
                      <strong className="font-semibold text-[#F0F7F2]">{gcashNumber}</strong>
                    </>
                  ) : gcashNumber ? (
                    <>
                      {" "}to{" "}
                      <strong className="font-semibold text-[#F0F7F2]">{gcashNumber}</strong>
                    </>
                  ) : null}
                  {", "}then tap below to send your GCash receipt.
                </p>
                {messengerUrl && (
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.07)] px-4 py-2.5 text-[13px] font-bold text-[#4ADE80] transition-opacity duration-[150ms] active:opacity-75"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.332 5.507 3.425 7.27V22l3.162-1.738A11.08 11.08 0 0 0 12 20.486c5.523 0 10-4.144 10-9.243C22 6.145 17.523 2 12 2zm.994 12.44-2.548-2.716-4.973 2.716 5.469-5.805 2.612 2.716 4.908-2.716-5.468 5.805z" />
                    </svg>
                    Send Receipt on Messenger
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                  Show your booking code{" "}
                  <strong className="font-semibold text-[#F0F7F2]">{code}</strong> or your name when you arrive at the court. Pay cash on-site.
                </p>
                {messengerUrl && (
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.07)] px-4 py-2.5 text-[13px] font-bold text-[#4ADE80] transition-opacity duration-[150ms] active:opacity-75"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.332 5.507 3.425 7.27V22l3.162-1.738A11.08 11.08 0 0 0 12 20.486c5.523 0 10-4.144 10-9.243C22 6.145 17.523 2 12 2zm.994 12.44-2.548-2.716-4.973 2.716 5.469-5.805 2.612 2.716 4.908-2.716-5.468 5.805z" />
                    </svg>
                    Notify on Messenger
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Find it again */}
          <div className="flex items-start gap-2.5 rounded-[10px] border border-[#2A4A35] px-3.5 py-3">
            <span className="mt-px shrink-0 text-[11px] font-bold text-[#4A6B55]">i</span>
            <p className="text-[12px] font-medium leading-[1.5] text-[#4A6B55]">
              Lost this screen? Find your booking anytime at{" "}
              <strong className="font-semibold text-[#8AAF95]">/lookup</strong> using your booking code.
            </p>
          </div>
        </div>

        {/* Done button */}
        <button
          type="button"
          className="flex w-full shrink-0 flex-col bg-[#F0F7F2] transition-opacity duration-[150ms] active:opacity-85"
          onClick={onClose}
        >
          <span className="flex min-h-[52px] items-center justify-center px-[22px] py-3.5 text-[15px] font-extrabold text-[#0F2418]">
            Got it
          </span>
          <span
            className="block h-[max(0.5rem,env(safe-area-inset-bottom,0px))] shrink-0 md:hidden"
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  );
}
