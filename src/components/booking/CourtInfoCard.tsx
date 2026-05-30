"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { tw } from "@/lib/ui/tokens";
import type { Court } from "@/types/bookings";

interface CourtInfoCardProps {
  court: Court;
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] last:border-b-0">
      <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">
        {icon}
      </div>
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">{label}</div>
        <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{children}</div>
      </div>
    </div>
  );
}

export function CourtInfoCard({ court }: CourtInfoCardProps) {
  const [open, setOpen] = useState(false);
  const ruleLines = splitLines(court.houseRules ?? "");
  const paymentLines = splitLines(court.paymentInstructions ?? "");
  const priceLabel = `${(court.pricePerHourCents / 100).toLocaleString("en-PH", { maximumFractionDigits: 0, style: "currency", currency: "PHP" })}`;

  return (
    <section className="pt-6 pb-36">
      <div className={`${tw.sectionLabel} mb-3`}>Court Info</div>
      <div className="overflow-hidden rounded-[14px] border border-[#2A4A35] bg-[#162E20]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-[15px] text-left lg:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.12)]">
              🏓
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-[-0.01em] text-[#F0F7F2]">
                {court.name}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-[#4A6B55]">
                Rules, rates & payment details
              </span>
            </span>
          </span>
          <span
            className={cx("text-[#4A6B55] transition", open && "rotate-180")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <div
          className={cx(
            "overflow-hidden transition-[max-height] lg:max-h-none",
            open ? "max-h-[2000px]" : "max-h-0"
          )}
        >
          <div className="border-t border-[#2A4A35] px-4 pb-4 lg:border-t-0 lg:pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 lg:border-b lg:border-[#1F3D29] lg:pb-4">
              <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">
                  📍
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Location</div>
                  <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{court.location}</div>
                </div>
              </div>
              <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">
                  💰
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Rate</div>
                  <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                    <strong className="font-bold text-[#F0F7F2]">{priceLabel} per hour</strong> · No extensions
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">
                  💳
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Payment</div>
                  <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                    {paymentLines.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {paymentLines.map((line, i) => {
                          const sep = line.indexOf(" — ");
                          const isLast = i === paymentLines.length - 1 && paymentLines.length > 1;
                          if (sep !== -1 && !isLast) {
                            return (
                              <span key={line}>
                                <strong className="font-semibold text-[#F0F7F2]">{line.slice(0, sep)}</strong>
                                <span>{line.slice(sep)}</span>
                              </span>
                            );
                          }
                          return (
                            <span key={line} className={isLast ? "mt-0.5 text-[11px] italic text-[#4A6B55]" : ""}>
                              {line}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      "Pay via GCash or cash after admin confirmation."
                    )}
                  </div>
                </div>
              </div>
            </div>
            <InfoRow icon="📋" label="House Rules">
              <div className="flex flex-col gap-1.5">
                {(ruleLines.length > 0 ? ruleLines : ["Please keep the court clean and respect the schedule."]).map(
                  (rule) => (
                    <span
                      key={rule}
                      className="flex items-start gap-2 text-xs font-medium leading-6 text-[#8AAF95]"
                    >
                      <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#4ADE80] opacity-60" />
                      {rule}
                    </span>
                  )
                )}
              </div>
            </InfoRow>
          </div>
        </div>
      </div>
      <div className="h-2" />
    </section>
  );
}
