"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Nav } from "@/components/Nav";
import { LookupForm } from "@/components/lookup/LookupForm";
import { EmptyState } from "@/components/lookup/EmptyState";
import { ErrorCard } from "@/components/lookup/ErrorCard";
import { BookingResult } from "@/components/lookup/BookingResult";
import { LookupResultSkeleton } from "@/components/lookup/LookupResultSkeleton";
import type { PublicBookingLookupResult, PaymentMethod } from "@/types/bookings";
import type { BookingStatus } from "@/components/lookup/StatusBanner";

type LookupState = "idle" | "loading" | "result" | "error";

const CODE_RE = /^[0-9]{4}-[A-Z0-9]{3}$/;

export default function LookupPage() {
  return (
    <Suspense>
      <LookupContent />
    </Suspense>
  );
}

function LookupContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.toUpperCase() ?? "";

  const [input, setInput] = useState(code);
  const [state, setState] = useState<LookupState>(code ? "loading" : "idle");
  const [booking, setBooking] = useState<PublicBookingLookupResult | null>(null);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorSub, setErrorSub] = useState("");

  const [prevCode, setPrevCode] = useState(code);

  if (code !== prevCode) {
    setPrevCode(code);
    setInput(code);
    if (!code) {
      setState("idle");
      setBooking(null);
    } else {
      setState("loading");
    }
  }

  useEffect(() => {
    if (code) {
      void doLookup(code);
    }
  }, [code]);

  async function doLookup(code: string) {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setState("idle");
      return;
    }

    // Sync browser URL search parameters with the queried code
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("code") !== trimmed) {
        url.searchParams.set("code", trimmed);
        window.history.pushState({}, "", url.toString());
      }
    }

    if (!CODE_RE.test(trimmed)) {
      setErrorTitle("Invalid code format");
      setErrorSub(
        "Booking codes look like 1234-XK9: four digits, a dash, then three characters. Double-check and try again."
      );
      setState("error");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode: trimmed }),
      });
      const payload = (await response.json()) as { booking?: PublicBookingLookupResult; error?: string };

      if (!response.ok) {
        if (response.status === 404) {
          setErrorTitle("Booking not found");
          setErrorSub(
            "We couldn't find a booking with that code. Make sure you entered it exactly as shown on your confirmation screen."
          );
        } else {
          setErrorTitle("Lookup failed");
          setErrorSub(payload.error ?? "Something went wrong. Please try again.");
        }
        setState("error");
        return;
      }

      if (!payload.booking) {
        setErrorTitle("Booking not found");
        setErrorSub("We couldn't find a booking with that code.");
        setState("error");
        return;
      }

      setBooking(payload.booking);
      setState("result");
    } catch {
      setErrorTitle("Lookup failed");
      setErrorSub("Something went wrong. Please check your connection and try again.");
      setState("error");
    }
  }

  function handleLookup() {
    void doLookup(input);
  }

  function handleClear() {
    setInput("");
    setState("idle");
    setBooking(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        url.searchParams.delete("code");
        window.history.pushState({}, "", url.toString());
      }
    }
  }

  const isLoading = state === "loading";

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased">
      <Nav activeTab="lookup" />

      {/* BODY */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[560px] pb-10 pt-6 sm:pb-16 sm:pt-8">
          {/* LOOKUP FORM */}
          <LookupForm value={input} onChange={setInput} onLookup={handleLookup} loading={isLoading} />

          {/* RESULT AREA */}
          {state === "loading" && <LookupResultSkeleton />}

          {state === "idle" && <EmptyState />}

          {state === "error" && <ErrorCard title={errorTitle} description={errorSub} />}

          {state === "result" && booking && (
            <BookingResult
              status={booking.status as BookingStatus}
              bookingCode={booking.booking_code}
              fullName={booking.full_name}
              slots={booking.slots}
              paymentMethod={booking.payment_method as PaymentMethod}
              totalCostCents={booking.total_cost_cents}
              bookingDate={booking.booking_date}
              pricePerHourCents={booking.price_per_hour_cents}
              onClear={handleClear}
            />
          )}
        </div>
      </div>

    </div>
  );
}
