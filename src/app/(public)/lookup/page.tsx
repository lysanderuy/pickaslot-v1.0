"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Nav } from "@/components/Nav";
import { LookupForm } from "@/components/lookup/LookupForm";
import { EmptyState } from "@/components/lookup/EmptyState";
import { ErrorCard } from "@/components/lookup/ErrorCard";
import { BookingResult } from "@/components/lookup/BookingResult";
import { LookupResultSkeleton } from "@/components/lookup/LookupResultSkeleton";
import { detectLookupInput } from "@/lib/bookings/validation";
import type { PublicBookingLookupResult, PaymentMethod } from "@/types/bookings";
import type { BookingStatus } from "@/components/lookup/StatusBanner";

type LookupState = "idle" | "loading" | "result" | "error";

export default function LookupPage() {
  return (
    <Suspense>
      <LookupContent />
    </Suspense>
  );
}

function LookupContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? searchParams.get("code") ?? "";

  const [input, setInput] = useState(query);
  const [state, setState] = useState<LookupState>(query ? "loading" : "idle");
  const [booking, setBooking] = useState<PublicBookingLookupResult | null>(null);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorSub, setErrorSub] = useState("");

  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setInput(query);
    if (!query) {
      setState("idle");
      setBooking(null);
    } else {
      setState("loading");
    }
  }

  useEffect(() => {
    if (query) {
      void doLookup(query);
    }
  }, [query]);

  async function doLookup(raw: string) {
    const trimmed = raw.trim();

    if (!trimmed) {
      setState("idle");
      return;
    }

    const detected = detectLookupInput(trimmed);

    if (detected.type === "invalid") {
      setErrorTitle("Invalid input");
      setErrorSub(detected.error!);
      setState("error");
      return;
    }

    // Sync URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("q") !== trimmed) {
        url.searchParams.delete("code");
        url.searchParams.set("q", trimmed);
        window.history.pushState({}, "", url.toString());
      }
    }

    setState("loading");

    const body = { bookingCode: detected.value };

    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { booking?: PublicBookingLookupResult; error?: string };

      if (!response.ok) {
        if (response.status === 404) {
          setErrorTitle("Booking not found");
          setErrorSub(
            detected.type === "code"
              ? "We couldn't find an upcoming booking with that code."
              : "No upcoming booking found for that number.",
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
        setErrorSub("No upcoming booking found.");
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
      url.searchParams.delete("q");
      url.searchParams.delete("code");
      window.history.pushState({}, "", url.toString());
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
              totalAmount={booking.total_amount}
              bookingDate={booking.booking_date}
              pricePerHour={booking.price_per_hour}
              timezone={booking.court_timezone}
              gcashNumber={booking.gcash_number}
              gcashName={booking.gcash_name}
              messengerUrl={booking.messenger_url}
              onClear={handleClear}
            />
          )}
        </div>
      </div>

    </div>
  );
}
