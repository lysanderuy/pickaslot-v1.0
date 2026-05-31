"use client";

import { useRef } from "react";
import { cx } from "@/lib/cx";

interface LookupFormProps {
  value: string;
  onChange: (value: string) => void;
  onLookup: () => void;
  loading: boolean;
}

export function LookupForm({ value, onChange, onLookup, loading }: LookupFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-8 flex flex-col gap-3">
      <label
        htmlFor="lookupInput"
        className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]"
      >
        Find Your Booking
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          ref={inputRef}
          id="lookupInput"
          type="text"
          value={value}
          maxLength={5}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Booking code (e.g. 00042)"
          disabled={loading}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLookup()}
          className={cx(
            "min-w-0 flex-1 rounded-[10px] border bg-[#1C3828] px-4 py-3 font-mono text-base font-medium text-[#F0F7F2] outline-none transition duration-180 ease-out sm:text-lg",
            "placeholder:text-sm placeholder:tracking-[0.04em] placeholder:text-[#4A6B55]",
            loading ? "cursor-wait border-[#2A4A35] opacity-60" : "border-[#2A4A35]",
            !loading && "focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.1)]"
          )}
        />
        <button
          type="button"
          disabled={loading}
          onClick={onLookup}
          className="w-full shrink-0 rounded-[10px] bg-[#F0F7F2] px-5 py-3 text-[13px] font-extrabold tracking-[-0.01em] text-[#0F2418] transition duration-130 ease-out active:scale-[0.97] active:opacity-90 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:py-0"
        >
          {loading ? "Looking up…" : "Look Up"}
        </button>
      </div>
      <span className="text-xs font-medium italic text-[#4A6B55]">
        Enter the 5-digit code from your booking confirmation.
      </span>
    </div>
  );
}
