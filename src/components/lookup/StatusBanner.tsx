"use client";

import { cx } from "@/lib/cx";

export type BookingStatus = "pending" | "confirmed" | "rejected";

interface StatusConfig {
  label: string;
  desc: string;
  note: string | null;
  bannerBorder: string;
  bannerBg: string;
  dotClass: string;
  labelClass: string;
  descClass: string;
}

export const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: "Pending Confirmation",
    desc: "Your booking is awaiting admin approval.",
    note: "Your booking will be reviewed shortly. No action needed; just hold on to your booking code.",
    bannerBorder: "rgba(251,191,36,0.2)",
    bannerBg: "rgba(251,191,36,0.1)",
    dotClass: "bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    labelClass: "text-[#FBBF24]",
    descClass: "text-[rgba(251,191,36,0.75)]",
  },
  confirmed: {
    label: "Confirmed",
    desc: "Your booking has been confirmed. See you on the court!",
    note: null,
    bannerBorder: "rgba(74,222,128,0.2)",
    bannerBg: "rgba(74,222,128,0.12)",
    dotClass: "bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.5)]",
    labelClass: "text-[#4ADE80]",
    descClass: "text-[rgba(74,222,128,0.75)]",
  },
  rejected: {
    label: "Rejected",
    desc: "Unfortunately your booking was not approved.",
    note: "Your slot has been released and is now available for others to book. You may submit a new request for a different slot.",
    bannerBorder: "rgba(248,113,113,0.2)",
    bannerBg: "rgba(248,113,113,0.1)",
    dotClass: "bg-[#F87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    labelClass: "text-[#F87171]",
    descClass: "text-[rgba(248,113,113,0.75)]",
  },
};

interface StatusBannerProps {
  status: BookingStatus;
}

export function StatusBanner({ status }: StatusBannerProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.rejected;

  return (
    <div
      className="flex items-start gap-3 rounded-[12px] border px-3.5 py-3 sm:px-4 sm:py-3.5"
      style={{ background: cfg.bannerBg, borderColor: cfg.bannerBorder }}
    >
      <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", cfg.dotClass)} />
      <div className="flex-1">
        <p className={cx("mb-0.5 text-[11px] font-bold uppercase tracking-[0.08em]", cfg.labelClass)}>
          {cfg.label}
        </p>
        <p className={cx("text-[13px] font-medium leading-[1.4]", cfg.descClass)}>{cfg.desc}</p>
      </div>
    </div>
  );
}
