"use client";

import { cx } from "@/lib/cx";

interface WarningModalProps {
  open: boolean;
  onGoBack: () => void;
  onContinue: () => void;
}

export function WarningModal({ open, onGoBack, onContinue }: WarningModalProps) {
  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(5,14,9,0.72)] p-6 opacity-0 backdrop-blur-md transition",
        open && "pointer-events-auto opacity-100"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-title"
    >
      <div className={cx("border border-[#2A4A35] bg-[#162E20] w-full max-w-[350px] rounded-[18px] p-5")}>
        <h2 id="warning-title" className="m-0 text-[20px] font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
          Heads up.
        </h2>
        <p className="my-4 text-[13px] leading-6 text-[#8AAF95]">
          One or more selected slots begins within the next 60 minutes. Make sure you can get to the court in time.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-[10px] bg-[#1C3828] p-[13px] text-[13px] font-bold tracking-[-0.01em] text-[#8AAF95]"
            onClick={onGoBack}
          >
            Go Back
          </button>
          <button
            type="button"
            className="rounded-[10px] bg-[#4ADE80] p-[13px] text-[13px] font-bold tracking-[-0.01em] text-[#0F2418]"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
