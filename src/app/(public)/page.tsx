"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { cx } from "@/lib/cx";
import { formatMoney, formatClockValue } from "@/lib/bookings/formatting";
import { isSoon } from "@/lib/bookings/availability";
import { toDateKey } from "@/lib/date/utils";
import { getToday } from "@/lib/date/calendar";
import { Nav } from "@/components/Nav";
import { DatePicker } from "@/components/booking/DatePicker";
import { HeroStat } from "@/components/booking/HeroStat";
import { SlotGrid } from "@/components/booking/SlotGrid";
import { ReservationList } from "@/components/booking/ReservationList";
import { CourtInfoCard } from "@/components/booking/CourtInfoCard";
import { ReserveBar } from "@/components/booking/ReserveBar";
import { BookingSheet } from "@/components/booking/BookingSheet";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { WarningModal } from "@/components/booking/WarningModal";
import type {
  Court,
  AvailabilityRow,
  BookingResponse,
  Confirmation,
  PaymentMethod,
} from "@/types/bookings";

const cardClass = "border border-[#2A4A35] bg-[#162E20]";

export default function BookPage() {
  const [court, setCourt] = useState<Court | null>(null);
  const [courtError, setCourtError] = useState("");
  const [courtLoading, setCourtLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => getToday());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = getToday();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSlotStarts, setSelectedSlotStarts] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedSlots = availability.filter((row) => selectedSlotStarts.includes(row.slot_start_at));
  const openCount = availability.filter((row) => row.slot_state === "available").length;
  const totalCostCents = selectedSlots.length * (court?.pricePerHourCents ?? 0);
  const priceLabel = court ? formatMoney(court.pricePerHourCents, court.currencyCode) : "-";
  const hoursLabel = court ? `${formatClockValue(court.openTime)} - ${formatClockValue(court.closeTime)}` : "-";
  const acceptingBookings = court?.isAcceptingBookings ?? false;

  async function fetchCourt() {
    const response = await fetch("/api/courts/current", { cache: "no-store" });
    const payload = (await response.json()) as { court?: Court; error?: string };
    if (!response.ok || !payload.court) {
      throw new Error(payload.error ?? "Failed to load court details");
    }
    return payload.court;
  }

  async function fetchAvailability(nextCourt: Court, dateKey: string) {
    const params = new URLSearchParams({ courtId: nextCourt.id, bookingDate: dateKey });
    const response = await fetch(`/api/bookings/availability?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as { availability?: AvailabilityRow[]; error?: string };
    if (!response.ok || !payload.availability) {
      throw new Error(payload.error ?? "Failed to load availability");
    }
    return payload.availability;
  }


  function applyAvailability(nextAvailability: AvailabilityRow[]) {
    setAvailability(nextAvailability);
    setSelectedSlotStarts((current) =>
      current.filter((slotStart) =>
        nextAvailability.some((row) => row.slot_start_at === slotStart && row.slot_state === "available")
      )
    );
  }

  async function loadCourt() {
    setCourtLoading(true);
    setCourtError("");
    try {
      setCourt(await fetchCourt());
    } catch (error) {
      setCourtError(error instanceof Error ? error.message : "Failed to load court details");
    } finally {
      setCourtLoading(false);
    }
  }

  async function loadAvailability(nextCourt: Court, dateKey: string) {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      applyAvailability(await fetchAvailability(nextCourt, dateKey));
    } catch (error) {
      setAvailability([]);
      setAvailabilityError(error instanceof Error ? error.message : "Failed to load availability");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function loadInitialCourt() {
      try {
        const nextCourt = await fetchCourt();
        if (active) setCourt(nextCourt);
      } catch (error) {
        if (active) setCourtError(error instanceof Error ? error.message : "Failed to load court details");
      } finally {
        if (active) setCourtLoading(false);
      }
    }
    void loadInitialCourt();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!court) return;
    let active = true;
    const currentCourt = court;
    async function loadSelectedDateAvailability() {
      if (active) {
        setAvailabilityLoading(true);
        setAvailabilityError("");
      }
      try {
        const nextAvailability = await fetchAvailability(currentCourt, selectedDateKey);
        if (active) applyAvailability(nextAvailability);
      } catch (error) {
        if (active) {
          setAvailability([]);
          setAvailabilityError(error instanceof Error ? error.message : "Failed to load availability");
        }
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    }
    void loadSelectedDateAvailability();
    return () => {
      active = false;
    };
  }, [court, selectedDateKey]);

  function pickDate(date: Date) {
    setAvailabilityLoading(true);
    setSelectedDate(date);
    setSelectedSlotStarts([]);
    setCalendarOpen(false);
  }

  function shiftMonth(delta: number) {
    setCalendarMonth((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function openSheet() {
    setSubmitError("");
    if (selectedSlots.some((row) => isSoon(row))) {
      setWarningOpen(true);
      return;
    }
    setSheetOpen(true);
  }

  function proceedFromWarning() {
    setWarningOpen(false);
    setSheetOpen(true);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!court) {
      setSubmitError("Court details are still loading. Please try again.");
      return;
    }
    if (!fullName.trim() || !contactNumber.trim()) {
      setSubmitError("Please fill in your name and contact number.");
      return;
    }
    if (selectedSlots.length === 0) {
      setSubmitError("Select at least one slot.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: court.id,
          bookingDate: selectedDateKey,
          fullName: fullName.trim(),
          contactNumber: contactNumber.trim(),
          paymentMethod,
          slotStarts: selectedSlots.map((slot) => slot.slot_start_at),
        }),
      });
      const payload = (await response.json()) as BookingResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit booking");
      }
      const code = payload.booking.booking_code ?? payload.booking.bookingCode ?? "Pending";
      setConfirmation({ code, slots: selectedSlots });
      setSheetOpen(false);
      setSelectedSlotStarts([]);
      setFullName("");
      setContactNumber("");
      await loadAvailability(court, selectedDateKey);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (courtLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased">
        <Nav activeTab="book" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className={cx(cardClass, "w-full max-w-sm rounded-[18px] p-6 text-center text-sm font-medium text-[#8AAF95]")}>
            Loading court details...
          </div>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased">
        <Nav activeTab="book" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className={cx(cardClass, "w-full max-w-sm rounded-[18px] p-6 text-center")}>
            <h1 className="text-xl font-extrabold text-[#F0F7F2]">Could not load the court.</h1>
            <p className="mt-2 text-sm text-[#8AAF95]">{courtError || "Please try again in a moment."}</p>
            <button
              type="button"
              onClick={loadCourt}
              className="mt-4 rounded-full bg-[#4ADE80] px-5 py-2 text-sm font-black text-[#0F2418]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased">
      <Nav activeTab="book" />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {/* Hero Card */}
        <section className="relative mt-4 overflow-hidden rounded-[20px] border border-[#2A4A35] bg-[#162E20] p-5">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
            viewBox="0 0 1000 454"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <g stroke="#4ADE80" fill="none" strokeLinecap="square" transform="rotate(-7 500 227)">
              <rect x="-200" y="-200" width="1400" height="854" strokeWidth="3" fill="#4ADE80" fillOpacity="0.04" />
              <line x1="500" y1="-200" x2="500" y2="654" strokeWidth="3" />
              <line x1="341" y1="-200" x2="341" y2="654" strokeWidth="2" />
              <line x1="659" y1="-200" x2="659" y2="654" strokeWidth="2" />
              <line x1="-200" y1="227" x2="341" y2="227" strokeWidth="2" />
              <line x1="659" y1="227" x2="1200" y2="227" strokeWidth="2" />
            </g>
          </svg>
          <div className="relative z-[1]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="m-0 text-[22px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#F0F7F2]">
                  {court.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#8AAF95]">
                  📍 {court.location}
                </p>
              </div>
              <div
                className={cx(
                  "flex shrink-0 items-center gap-[7px] rounded-full border px-3 py-1.5",
                  acceptingBookings
                    ? "border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.12)]"
                    : "border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)]"
                )}
              >
                <span
                  className={cx(
                    "h-[7px] w-[7px] rounded-full",
                    acceptingBookings
                      ? "bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                      : "bg-[#F87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                  )}
                />
                <span
                  className={cx(
                    "text-[11px] font-bold uppercase tracking-[0.06em]",
                    acceptingBookings ? "text-[#4ADE80]" : "text-[#F87171]"
                  )}
                >
                  {acceptingBookings ? "Open" : "Closed"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#2A4A35] pt-4">
              <HeroStat label="Rate" value={priceLabel} accent="/hr" />
              <div className="h-8 w-px bg-[#2A4A35]" />
              <HeroStat label="Hours" value={hoursLabel} />
              <div className="h-8 w-px bg-[#2A4A35]" />
              <HeroStat label="Slots Today" value={availabilityLoading ? "-" : String(openCount)} accent="open" />
            </div>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 xl:grid-cols-[1fr_400px]">
          <div>
            <DatePicker
              selectedDate={selectedDate}
              calendarMonth={calendarMonth}
              calendarOpen={calendarOpen}
              onCalendarToggle={() => {
                setCalendarMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });
                setCalendarOpen((current) => !current);
              }}
              onShiftMonth={shiftMonth}
              onPickDate={pickDate}
              loading={availabilityLoading}
            />

            <SlotGrid
              availability={availability}
              selectedSlotStarts={selectedSlotStarts}
              onSlotSelect={setSelectedSlotStarts}
              loading={availabilityLoading}
              acceptingBookings={acceptingBookings}
              timezone={court.timezone}
              error={availabilityError}
              onRetry={() => loadAvailability(court, selectedDateKey)}
            />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start lg:h-fit">
            <ReservationList
              availability={availability}
              timezone={court.timezone}
              loading={availabilityLoading}
              pricePerHourCents={court.pricePerHourCents}
              currencyCode={court.currencyCode}
            />
          </div>
        </div>

        <CourtInfoCard court={court} />
      </div>

      <ReserveBar
        selectedSlots={selectedSlots}
        totalCostCents={totalCostCents}
        currencyCode={court.currencyCode}
        onClick={openSheet}
      />

      <BookingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedSlots={selectedSlots}
        totalCostCents={totalCostCents}
        currencyCode={court.currencyCode}
        timezone={court.timezone}
        priceLabel={priceLabel}
        onSubmit={submitBooking}
        fullName={fullName}
        setFullName={setFullName}
        contactNumber={contactNumber}
        setContactNumber={setContactNumber}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        submitError={submitError}
        submitting={submitting}
      />

      <BookingConfirmation
        open={!!confirmation}
        code={confirmation?.code ?? ""}
        slots={confirmation?.slots ?? []}
        priceLabel={priceLabel}
        timezone={court.timezone}
        onClose={() => setConfirmation(null)}
      />

      <WarningModal open={warningOpen} onGoBack={() => setWarningOpen(false)} onContinue={proceedFromWarning} />
    </div>
  );
}
