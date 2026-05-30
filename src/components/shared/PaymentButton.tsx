"use client";

import { cx } from "@/lib/cx";

interface PaymentButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function PaymentButton({ selected, onClick, children }: PaymentButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "flex items-center justify-center gap-2 rounded-[10px] border p-[13px] text-[13px] font-extrabold",
        selected
          ? "border-[#4ADE80] bg-[rgba(74,222,128,0.12)] text-[#4ADE80]"
          : "border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
