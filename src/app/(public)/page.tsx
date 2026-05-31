"use client";

import { useCallback } from "react";

import { cx } from "@/lib/cx";
import { formatMoney, formatClockValue } from "@/lib/bookings/formatting";
import { isSoon, areSlotsContinuous } from "@/lib/bookings/availability";
import { toDateKey } from "@/lib/date/utils";
import { useCourt } from "@/hooks/useCourt";
import { useBookingSubmit } from "@/hooks/useBookingSubmit";
import { BookingProvider, useBooking } from "@/contexts/BookingContext";
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
import { BookPageSkeleton } from "@/components/booking/BookPageSkeleton";
import type { Confirmation } from "@/types/bookings";

const cardClass = "border border-[#2A4A35] bg-[#162E20]";

function BookPageContent() {
  const {
    selectedDate,
    selectedSlotStarts,
    setSelectedSlotStarts,
    sheetOpen,
    setSheetOpen,
    warningOpen,
    setWarningOpen,
    warningType,
    setWarningType,
    fullName,
    setFullName,
    contactNumber,
    setContactNumber,
    paymentMethod,
    confirmation,
    setConfirmation,
  } = useBooking();

  const selectedDateKey = toDateKey(selectedDate);

  const {
    court,
    courtError,
    courtLoading,
    availability,
    availabilityError,
    availabilityLoading,
    refreshCourt,
    refreshAvailability,
  } = useCourt(selectedDateKey);

  // Filter to only currently available slots (re-computed on every render)
  const selectedSlots = availability.filter(
    (row) => selectedSlotStarts.includes(row.slot_start_at) && row.slot_state === "available"
  );

  const handleBookingSuccess = useCallback(
    (conf: Confirmation) => {
      setConfirmation(conf);
      setSheetOpen(false);
      setSelectedSlotStarts([]);
      setFullName("");
      setContactNumber("");
      refreshAvailability();
    },
    [setConfirmation, setSheetOpen, setSelectedSlotStarts, setFullName, setContactNumber, refreshAvailability]
  );

  const { submitting, submitError, submitBooking } = useBookingSubmit({
    court,
    selectedDateKey,
    selectedSlots,
    fullName,
    contactNumber,
    paymentMethod,
    onSuccess: handleBookingSuccess,
  });

  const openCount = availability.filter((row) => row.slot_state === "available").length;
  const totalAmount = selectedSlots.length * (court?.pricePerHourCents ?? 0);
  const priceLabel = court ? formatMoney(court.pricePerHourCents, court.currencyCode) : "-";
  const hoursLabel = court ? `${formatClockValue(court.openTime)} - ${formatClockValue(court.closeTime)}` : "-";
  const acceptingBookings = court?.isAcceptingBookings ?? false;

  function openSheet() {
    if (!areSlotsContinuous(selectedSlots)) {
      setWarningType("continuous");
      setWarningOpen(true);
      return;
    }

    if (selectedSlots.some((row) => isSoon(row))) {
      setWarningType("imminent");
      setWarningOpen(true);
      return;
    }

    setSheetOpen(true);
  }

  function proceedFromWarning() {
    setWarningOpen(false);
    setSheetOpen(true);
  }

  if (courtLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased">
        <Nav activeTab="book" />
        <BookPageSkeleton />
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
              onClick={refreshCourt}
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
        <section className="relative mt-3 overflow-hidden rounded-[18px] border border-[#2A4A35] bg-[#162E20] p-4 sm:mt-4 sm:rounded-[20px] sm:p-5">
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
            <div className="mb-4 flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="m-0 text-xl font-extrabold leading-[1.1] tracking-[-0.02em] text-[#F0F7F2] sm:text-[22px]">
                  {court.name}
                </h1>
                <p className="mt-1 flex items-start gap-1 text-xs font-medium text-[#8AAF95]">
                  <span className="shrink-0">📍</span>
                  <span className="min-w-0 break-words">{court.location}</span>
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
            <div className="grid grid-cols-3 gap-x-2 gap-y-3 border-t border-[#2A4A35] pt-4 sm:flex sm:items-center sm:justify-between sm:gap-0">
              <HeroStat label="Rate" value={priceLabel} accent="/hr" />
              <div className="hidden h-8 w-px bg-[#2A4A35] sm:block" />
              <HeroStat label="Hours" value={hoursLabel} />
              <div className="hidden h-8 w-px bg-[#2A4A35] sm:block" />
              <HeroStat label="Slots Today" value={availabilityLoading ? "-" : String(openCount)} accent="open" />
            </div>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 xl:grid-cols-[1fr_400px]">
          <div>
            <DatePicker />

            <SlotGrid
              availability={availability}
              loading={availabilityLoading}
              acceptingBookings={acceptingBookings}
              timezone={court.timezone}
              error={availabilityError ?? undefined}
              onRetry={refreshAvailability}
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

        <CourtInfoCard court={court} reserveBarVisible={selectedSlotStarts.length > 0} />
      </div>

      <ReserveBar
        selectedSlots={selectedSlots}
        totalAmount={totalAmount}
        currencyCode={court.currencyCode}
        onClick={openSheet}
      />

      <BookingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedSlots={selectedSlots}
        totalAmount={totalAmount}
        currencyCode={court.currencyCode}
        timezone={court.timezone}
        priceLabel={priceLabel}
        onSubmit={submitBooking}
        submitError={submitError}
        submitting={submitting}
      />

      <BookingConfirmation
        open={!!confirmation}
        code={confirmation?.code ?? ""}
        slots={confirmation?.slots ?? []}
        paymentMethod={confirmation?.paymentMethod ?? "gcash"}
        priceLabel={priceLabel}
        timezone={court.timezone}
        gcashNumber={court.gcashNumber}
        gcashName={court.gcashName}
        messengerUrl={court.messengerUrl}
        onClose={() => setConfirmation(null)}
      />

      {warningType === "imminent" ? (
        <WarningModal
          open={warningOpen}
          type="imminent"
          onGoBack={() => setWarningOpen(false)}
          onContinue={proceedFromWarning}
        />
      ) : (
        <WarningModal
          open={warningOpen}
          type="continuous"
          selectedSlots={selectedSlots}
          timezone={court.timezone}
          onGoBack={() => setWarningOpen(false)}
        />
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <BookingProvider>
      <BookPageContent />
    </BookingProvider>
  );
}
