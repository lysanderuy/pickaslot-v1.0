"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";

interface Props {
  bookingId: string;
  onActionComplete?: () => void;
}

export function BookingActionButtons({ bookingId, onActionComplete }: Props) {
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [done, setDone] = useState<"confirmed" | "rejected" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(action: "confirm" | "reject") {
    setActionError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(action === "confirm" ? "confirmed" : "rejected");
        onActionComplete?.();
      } else {
        const payload = await res.json().catch(() => ({}));
        setActionError(payload.error ?? "Action failed. Please try again.");
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <span
        className={cx(
          "text-[12px] font-bold",
          done === "confirmed" ? "text-green-700" : "text-rose-700",
        )}
      >
        {done === "confirmed" ? "✓ Confirmed" : "✕ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:justify-end">
        <button
          onClick={() => act("confirm")}
          disabled={!!loading}
          className="w-full rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading === "confirm" ? "Confirming..." : "Confirm"}
        </button>
        <button
          onClick={() => act("reject")}
          disabled={!!loading}
          className="w-full rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {actionError && (
        <p className="text-[11px] font-medium text-rose-600">
          {actionError}
        </p>
      )}
    </div>
  );
}
