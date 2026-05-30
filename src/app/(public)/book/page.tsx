"use client";

import Link from "next/link";
import type { SubmitEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type SlotState = "available" | "pending" | "confirmed" | "past";
type UiSlotState = "available" | "pending" | "taken" | "past";
type PaymentMethod = "gcash" | "cash";

interface Court {
  id: string;
  name: string;
  location: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  pricePerHourCents: number;
  currencyCode: string;
  isAcceptingBookings: boolean;
  houseRules: string;
  paymentInstructions: string;
}

interface AvailabilityRow {
  slot_start_at: string;
  slot_end_at: string;
  slot_state: SlotState;
  booking_id: string | null;
  booking_code: string | null;
  first_name: string | null;
  payment_method: PaymentMethod | null;
  total_cost_cents: number | null;
}

interface BookingResponse {
  booking: {
    booking_code?: string;
    bookingCode?: string;
  };
}

interface ConfirmedReservation {
  bookingId: string;
  timeRange: string;
  firstName: string;
  duration: number;
  totalCostCents: number;
}

interface Confirmation {
  code: string;
  slots: AvailabilityRow[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const shellClass =
  "flex min-h-[100dvh] w-full flex-col bg-[#0F2418] text-[#F0F7F2] antialiased";
const sectionClass = "pt-6";
const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]";
const cardClass = "border border-[#2A4A35] bg-[#162E20]";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekNumber(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatMoney(cents: number, currencyCode: string) {
  const amount = cents / 100;

  if (currencyCode === "PHP") {
    return `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
}

function formatTimeRange(slotStart: string, slotEnd: string, timezone: string) {
  return `${formatTime(slotStart, timezone)} - ${formatTime(slotEnd, timezone)}`;
}

function formatClockValue(value: string) {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}${minute > 0 ? `:${String(minute).padStart(2, "0")}` : ""}${suffix}`;
}

function dateLabel(date: Date) {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const prefix = sameDay(date, today) ? "Today" : sameDay(date, tomorrow) ? "Tomorrow" : DAYS[date.getDay()];
  return `${prefix}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function isSoon(row: AvailabilityRow) {
  const diffMinutes = (new Date(row.slot_start_at).getTime() - Date.now()) / 60000;
  return diffMinutes >= 0 && diffMinutes <= 60;
}

function uiSlotState(row: AvailabilityRow): UiSlotState {
  return row.slot_state === "confirmed" ? "taken" : row.slot_state;
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

function weekStart(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function getCalendarCells(year: number, month: number) {
  const today = getToday();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells: Array<{ date: Date | null; label: number; other: boolean; disabled: boolean }> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({
      date: null,
      label: previousMonthDays - firstDay + index + 1,
      other: true,
      disabled: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    cells.push({
      date,
      label: day,
      other: false,
      disabled: date < today,
    });
  }

  return cells;
}

function slotCardClass(state: UiSlotState, selected: boolean) {
  const base =
    "relative flex min-h-[73px] flex-col gap-[5px] overflow-hidden rounded-[14px] px-3 py-[11px] text-left transition active:scale-[0.96]";

  if (selected) {
    return cx(base, "border border-[#4ADE80] bg-[#4ADE80] shadow-[0_4px_20px_rgba(74,222,128,0.3)]");
  }

  if (state === "available") {
    return cx(
      base,
      "cursor-pointer border border-[#2A4A35] bg-[#1C3828] shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]",
    );
  }

  if (state === "taken") {
    return cx(base, "cursor-default border border-[rgba(248,113,113,0.15)] bg-[rgba(248,113,113,0.1)] opacity-70");
  }

  if (state === "pending") {
    return cx(base, "cursor-default border border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.1)]");
  }

  return cx(base, "cursor-default border border-[#1F3D29] bg-transparent opacity-35");
}

function slotTextClass(state: UiSlotState, selected: boolean) {
  if (selected) {
    return "text-[#0F2418]";
  }

  if (state === "taken") {
    return "text-[#F87171]";
  }

  if (state === "pending") {
    return "text-[#FBBF24]";
  }

  if (state === "past") {
    return "text-[#4A6B55]";
  }

  return "text-[#F0F7F2]";
}

function statusTextClass(state: UiSlotState, selected: boolean) {
  if (selected) {
    return "text-[rgba(15,36,24,0.7)]";
  }

  if (state === "taken") {
    return "text-[#F87171]";
  }

  if (state === "pending") {
    return "text-[#FBBF24]";
  }

  if (state === "past") {
    return "text-[#2E4D38]";
  }

  return "text-[#4ADE80]";
}

export default function BookPage() {
  const [court, setCourt] = useState<Court | null>(null);
  const [courtError, setCourtError] = useState("");
  const [courtLoading, setCourtLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getToday());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = getToday();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [courtInfoOpen, setCourtInfoOpen] = useState(false);
  const [selectedSlotStarts, setSelectedSlotStarts] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedSlots = availability.filter((row) => selectedSlotStarts.includes(row.slot_start_at));
  const openCount = availability.filter((row) => row.slot_state === "available").length;
  const totalCostCents = selectedSlots.length * (court?.pricePerHourCents ?? 0);
  const calendarCells = getCalendarCells(calendarMonth.year, calendarMonth.month);
  const ruleLines = splitLines(court?.houseRules ?? "");
  const paymentLines = splitLines(court?.paymentInstructions ?? "");

  const reservations = useMemo<ConfirmedReservation[]>(() => {
    if (!court) {
      return [];
    }

    const grouped = new Map<string, AvailabilityRow[]>();

    availability.forEach((row) => {
      if (row.slot_state !== "confirmed" || !row.booking_id) {
        return;
      }

      grouped.set(row.booking_id, [...(grouped.get(row.booking_id) ?? []), row]);
    });

    return Array.from(grouped.entries()).map(([bookingId, rows]) => {
      const sorted = [...rows].sort(
        (left, right) => new Date(left.slot_start_at).getTime() - new Date(right.slot_start_at).getTime(),
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      return {
        bookingId,
        firstName: first.first_name ?? "Guest",
        duration: sorted.length,
        timeRange: formatTimeRange(first.slot_start_at, last.slot_end_at, court.timezone),
        totalCostCents: first.total_cost_cents ?? sorted.length * court.pricePerHourCents,
      };
    });
  }, [availability, court]);

  async function fetchCourt() {
    const response = await fetch("/api/courts/current", { cache: "no-store" });
    const payload = (await response.json()) as { court?: Court; error?: string };

    if (!response.ok || !payload.court) {
      throw new Error(payload.error ?? "Failed to load court details");
    }

    return payload.court;
  }

  async function fetchAvailability(nextCourt: Court, dateKey: string) {
    const params = new URLSearchParams({
      courtId: nextCourt.id,
      bookingDate: dateKey,
    });
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
        nextAvailability.some((row) => row.slot_start_at === slotStart && row.slot_state === "available"),
      ),
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

        if (active) {
          setCourt(nextCourt);
        }
      } catch (error) {
        if (active) {
          setCourtError(error instanceof Error ? error.message : "Failed to load court details");
        }
      } finally {
        if (active) {
          setCourtLoading(false);
        }
      }
    }

    void loadInitialCourt();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!court) {
      return;
    }

    let active = true;
    const currentCourt = court;

    async function loadSelectedDateAvailability() {
      try {
        const nextAvailability = await fetchAvailability(currentCourt, selectedDateKey);

        if (active) {
          applyAvailability(nextAvailability);
        }
      } catch (error) {
        if (active) {
          setAvailability([]);
          setAvailabilityError(error instanceof Error ? error.message : "Failed to load availability");
        }
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadSelectedDateAvailability();

    return () => {
      active = false;
    };
  }, [court, selectedDateKey]);

  function pickDate(date: Date) {
    setAvailabilityLoading(true);
    setAvailabilityError("");
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

  function toggleSlot(row: AvailabilityRow) {
    if (row.slot_state !== "available") {
      return;
    }

    setSelectedSlotStarts((current) =>
      current.includes(row.slot_start_at)
        ? current.filter((slotStart) => slotStart !== row.slot_start_at)
        : [...current, row.slot_start_at],
    );
  }

  function openSheet() {
    setSubmitError("");

    if (selectedSlots.some(isSoon)) {
      setWarningOpen(true);
      return;
    }

    setSheetOpen(true);
  }

  function proceedFromWarning() {
    setWarningOpen(false);
    setSheetOpen(true);
  }

  async function submitBooking(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!court) {
      setSubmitError("Court details are still loading. Please try again.");
      return;
    }

    if (!firstName.trim() || !contactNumber.trim()) {
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
          firstName: firstName.trim(),
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
      setFirstName("");
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
      <div className={shellClass}>
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
      <div className={shellClass}>
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

  const hoursLabel = `${formatClockValue(court.openTime)} - ${formatClockValue(court.closeTime)}`;
  const priceLabel = formatMoney(court.pricePerHourCents, court.currencyCode);
  const acceptingBookings = court.isAcceptingBookings;

  return (
    <div className={shellClass}>
      <nav className="sticky top-0 z-40 bg-[#0F2418]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-[18px] sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-[-0.02em] text-[#F0F7F2] no-underline">
            Pick<span className="text-[#4ADE80]">A</span>Slot
          </Link>
          <div className="flex gap-1">
            <span className="rounded-full bg-[#1C3828] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#F0F7F2]">
              Book
            </span>
            <Link
              href="/lookup"
              className="rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#4A6B55] no-underline"
            >
              My Booking
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <section
          className={cx(
            cardClass,
            "relative mt-4 overflow-hidden rounded-[20px] p-5",
          )}
        >
          {/* Pickleball court — top-down, proportionally accurate (44ft × 20ft), rotated as bg art */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
            viewBox="0 0 1000 454"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <g stroke="#4ADE80" fill="none" strokeLinecap="square" transform="rotate(-7 500 227)">
              {/* Court surface — faint fill */}
              <rect x="-200" y="-200" width="1400" height="854" strokeWidth="3" fill="#4ADE80" fillOpacity="0.04" />
              {/* Net */}
              <line x1="500" y1="-200" x2="500" y2="654" strokeWidth="3" />
              {/* NVZ lines — 7ft from net (7/44 × 1000 ≈ 159) */}
              <line x1="341" y1="-200" x2="341" y2="654" strokeWidth="2" />
              <line x1="659" y1="-200" x2="659" y2="654" strokeWidth="2" />
              {/* Center service lines */}
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
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#8AAF95]">📍 {court.location}</p>
              </div>
              <div
                className={cx(
                  "flex shrink-0 items-center gap-[7px] rounded-full border px-3 py-1.5",
                  acceptingBookings
                    ? "border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.12)]"
                    : "border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)]",
                )}
              >
                <span
                  className={cx(
                    "h-[7px] w-[7px] rounded-full",
                    acceptingBookings
                      ? "bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                      : "bg-[#F87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]",
                  )}
                />
                <span
                  className={cx(
                    "text-[11px] font-bold uppercase tracking-[0.06em]",
                    acceptingBookings ? "text-[#4ADE80]" : "text-[#F87171]",
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
            <section className={sectionClass}>
            <div className={cx(eyebrowClass, "mb-3")}>Pick a Date</div>
          <button
            type="button"
            className={cx(
              "flex w-full items-center justify-between gap-3 border bg-[#162E20] px-4 py-3.5 text-left transition",
              calendarOpen ? "rounded-t-[14px] border-[#4ADE80] border-b-transparent" : "rounded-[14px] border-[#2A4A35]",
            )}
            onClick={() => {
              setCalendarMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });
              setCalendarOpen((current) => !current);
            }}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.12)] text-[#4ADE80]">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 1v3M12 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-base font-bold leading-none tracking-[-0.01em] text-[#F0F7F2]">
                  {dateLabel(selectedDate)}
                </span>
                <span className="mt-[3px] block font-mono text-[11px] font-normal text-[#8AAF95]">
                  {DAYS[selectedDate.getDay()]} · Week {getWeekNumber(selectedDate)}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#4ADE80]">Change</span>
              <span
                className={cx(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[rgba(74,222,128,0.12)] text-[#4ADE80] transition",
                  calendarOpen && "rotate-180",
                )}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </button>

          <div
            className={cx(
              "overflow-hidden rounded-b-[14px] border-x border-b border-[#4ADE80] bg-[#162E20] transition-[max-height]",
              calendarOpen ? "max-h-80" : "max-h-0 border-transparent",
            )}
          >
            <div className="px-4 pb-4 pt-3.5">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" className="h-7 w-7 rounded-md border border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  ‹
                </button>
                <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#F0F7F2]">
                  {MONTHS[calendarMonth.month]} {calendarMonth.year}
                </span>
                <button type="button" className="h-7 w-7 rounded-md border border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]" onClick={() => shiftMonth(1)} aria-label="Next month">
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 gap-[3px]">
                {DAYS_SHORT.map((day) => (
                  <div key={day} className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[#4A6B55]">
                    {day[0]}
                  </div>
                ))}
                {calendarCells.map((cell, index) => {
                  const isSelected = cell.date ? sameDay(cell.date, selectedDate) : false;
                  const isToday = cell.date ? sameDay(cell.date, getToday()) : false;

                  return (
                    <button
                      key={`${cell.label}-${index}`}
                      type="button"
                      className={cx(
                        "flex h-8 w-full items-center justify-center rounded-md border-0 bg-transparent text-[13px] font-medium transition enabled:hover:bg-[#1C3828]",
                        isToday && "font-extrabold text-[#4ADE80]",
                        isSelected && "bg-[#4ADE80] font-bold text-[#0F2418] hover:bg-[#4ADE80]",
                        (cell.other || cell.disabled) && !isSelected && "text-[#2E4D38]",
                      )}
                      disabled={!cell.date || cell.disabled}
                      onClick={() => cell.date && pickDate(cell.date)}
                    >
                      {cell.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-[5px]">
            {Array.from({ length: 7 }, (_, index) => {
              const start = weekStart(selectedDate);
              const day = new Date(start);
              day.setDate(start.getDate() + index);
              const today = getToday();
              const disabled = day < today;
              const active = sameDay(day, selectedDate);
              const isToday = sameDay(day, today);

              return (
                <button
                  key={toDateKey(day)}
                  type="button"
                  className={cx(
                    "flex flex-col items-center gap-1 rounded-[10px] border px-1 py-2 transition active:scale-95",
                    active
                      ? "border-[#4ADE80] bg-[#4ADE80] shadow-[0_3px_14px_rgba(74,222,128,0.25)]"
                      : "border-[#2A4A35] bg-[#162E20]",
                    isToday && !active && "border-[rgba(74,222,128,0.3)]",
                    disabled && "cursor-default opacity-30",
                  )}
                  disabled={disabled}
                  onClick={() => pickDate(day)}
                >
                  <span
                    className={cx(
                      "text-[9px] font-bold uppercase tracking-[0.08em] leading-none",
                      active ? "text-[rgba(15,36,24,0.65)]" : isToday ? "text-[#4ADE80]" : "text-[#4A6B55]",
                    )}
                  >
                    {DAYS_SHORT[day.getDay()]}
                  </span>
                  <span className={cx("text-base font-bold leading-none", active ? "text-[#0F2418]" : isToday ? "text-[#4ADE80]" : "text-[#8AAF95]")}>
                    {day.getDate()}
                  </span>
                  <span className={cx("h-1 w-1 rounded-full", active ? "bg-[rgba(15,36,24,0.3)]" : !disabled ? "bg-[#2A4A35]" : "bg-transparent")} />
                </button>
              );
            })}
          </div>
          </section>

            <section className={sectionClass}>
              <div className={cx(eyebrowClass, "mb-3 flex items-center justify-between")}>
                <span>Choose Your Slot</span>
                <span className="font-mono text-[11px] font-normal normal-case tracking-[0.02em] text-[#4A6B55]">
                  {availabilityLoading ? "-" : `${openCount} open`}
                </span>
              </div>
              <p className="mb-3 text-xs font-medium italic text-[#4A6B55]">
                {acceptingBookings ? "Tap a slot to select it." : "This court is closed for new booking requests."}
              </p>

              {availabilityError ? (
                <div className="rounded-xl border border-dashed border-[#2A4A35] bg-[#162E20] px-4 py-5 text-center text-[13px] font-medium italic text-[#4A6B55]">
                  {availabilityError}
                  <button type="button" className="mx-auto mt-2 block font-extrabold not-italic text-[#4ADE80]" onClick={() => loadAvailability(court, selectedDateKey)}>
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availabilityLoading
                    ? Array.from({ length: 8 }, (_, index) => (
                        <div
                          key={index}
                          className="min-h-[73px] animate-pulse rounded-[14px] border border-[#2A4A35] bg-[#1C3828]"
                        />
                      ))
                    : availability.map((row) => {
                        const selected = selectedSlotStarts.includes(row.slot_start_at);
                        const state = uiSlotState(row);
                        const stateText = selected ? "Selected" : state === "taken" ? "Taken" : state[0].toUpperCase() + state.slice(1);
                        const canSelect = acceptingBookings && row.slot_state === "available";

                        return (
                          <button
                            key={row.slot_start_at}
                            type="button"
                            className={slotCardClass(state, selected)}
                            disabled={!canSelect}
                            onClick={() => toggleSlot(row)}
                          >
                            <span className={cx("whitespace-nowrap text-base font-extrabold leading-none tracking-[-0.02em]", slotTextClass(state, selected))}>
                              {formatTime(row.slot_start_at, court.timezone)}
                            </span>
                            <span className="mt-auto flex items-center justify-between">
                              <span className={cx("text-[10px] font-bold uppercase tracking-[0.08em]", statusTextClass(state, selected))}>
                                {stateText}
                              </span>
                              {(canSelect || selected) && (
                                <span
                                  className={cx(
                                    "flex h-5 w-5 items-center justify-center rounded-full border-[1.5px]",
                                    selected
                                      ? "border-[rgba(15,36,24,0.3)] bg-[rgba(15,36,24,0.25)] text-[rgba(15,36,24,0.8)]"
                                      : "border-[#2A4A35] bg-[#162E20] text-[#4A6B55]",
                                  )}
                                >
                                  {selected && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                </div>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <section className={sectionClass}>
              <div className={cx(eyebrowClass, "mb-3")}>Reservations Today</div>
              {reservations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2A4A35] bg-[#162E20] px-4 py-5 text-center text-[13px] font-medium italic text-[#4A6B55]">
                  No confirmed bookings for this day.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {reservations.map((reservation) => (
                    <article key={reservation.bookingId} className={cx(cardClass, "flex items-center gap-3.5 rounded-xl px-4 py-[13px]")}>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold leading-none tracking-[-0.01em] text-[#F0F7F2]">{reservation.timeRange}</div>
                        <div className="mt-[3px] text-xs font-medium italic text-[#8AAF95]">{reservation.firstName}</div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="font-mono text-[11px] font-normal text-[#4A6B55]">
                          {reservation.duration} hr{reservation.duration === 1 ? "" : "s"}
                        </span>
                        <span className="text-[13px] font-bold text-[#F0F7F2]">
                          {formatMoney(reservation.totalCostCents, court.currencyCode)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>

        <section className={cx(sectionClass, "pb-36")}>
          <div className={cx(eyebrowClass, "mb-3")}>Court Info</div>
          <div className={cx(cardClass, "overflow-hidden rounded-[14px]")}>
            <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-[15px] text-left lg:hidden" onClick={() => setCourtInfoOpen((current) => !current)}>
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.12)]">
                  🏓
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold tracking-[-0.01em] text-[#F0F7F2]">{court.name}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-[#4A6B55]">Rules, rates & payment details</span>
                </span>
              </span>
              <span className={cx("text-[#4A6B55] transition", courtInfoOpen && "rotate-180")}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className={cx("overflow-hidden transition-[max-height] lg:max-h-none", courtInfoOpen ? "max-h-[2000px]" : "max-h-0")}>
              <div className="border-t border-[#2A4A35] px-4 pb-4 lg:border-t-0 lg:pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 lg:border-b lg:border-[#1F3D29] lg:pb-4">
                  <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                    <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">📍</div>
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Location</div>
                      <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{court.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                    <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">💰</div>
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Rate</div>
                      <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">
                        <strong className="font-bold text-[#F0F7F2]">{priceLabel} per hour</strong> · No extensions
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] lg:border-b-0 lg:py-0">
                    <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">💳</div>
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
                              return <span key={line} className={isLast ? "mt-0.5 text-[11px] italic text-[#4A6B55]" : ""}>{line}</span>;
                            })}
                          </div>
                        ) : "Pay via GCash or cash after admin confirmation."}
                      </div>
                    </div>
                  </div>
                </div>
                <InfoRow icon="📋" label="House Rules">
                  <div className="flex flex-col gap-1.5">
                    {(ruleLines.length > 0 ? ruleLines : ["Please keep the court clean and respect the schedule."]).map((rule) => (
                      <span key={rule} className="flex items-start gap-2 text-xs font-medium leading-6 text-[#8AAF95]">
                        <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#4ADE80] opacity-60" />
                        {rule}
                      </span>
                    ))}
                  </div>
                </InfoRow>
              </div>
            </div>
          </div>
          <div className="h-2" />
        </section>
      </div>

      <div
        className={cx(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-50 bg-[linear-gradient(to_top,#0F2418_55%,transparent)] pb-9 pt-3 transition",
          selectedSlots.length > 0 ? "pointer-events-auto translate-y-0" : "translate-y-[110%]",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[14px] bg-[#F0F7F2] px-[22px] py-[17px] shadow-[0_8px_32px_rgba(240,247,242,0.15),0_2px_8px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            onClick={openSheet}
          >
            <span className="flex flex-col gap-0.5 text-left">
              <span className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F2418]">Reserve Court</span>
              <span className="font-mono text-[11px] font-normal text-[rgba(15,36,24,0.5)]">
                {selectedSlots.length} slot{selectedSlots.length === 1 ? "" : "s"} · {selectedSlots.length} hr
                {selectedSlots.length === 1 ? "" : "s"}
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-[#0F2418]">
                {formatMoney(totalCostCents, court.currencyCode)}
              </span>
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(15,36,24,0.12)] text-xl text-[#0F2418]">
                →
              </span>
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className={cx(
          "pointer-events-none fixed inset-0 z-[100] border-0 bg-[rgba(5,14,9,0.7)] opacity-0 backdrop-blur-md transition",
          sheetOpen && "pointer-events-auto opacity-100",
        )}
        onClick={() => setSheetOpen(false)}
        aria-label="Close booking sheet"
      />
      <div
        className={cx(
          "fixed bottom-0 left-1/2 z-[101] max-h-[93dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[22px] border-t-2 border-[#4ADE80] bg-[#162E20] transition",
          sheetOpen ? "translate-y-0" : "translate-y-[104%]",
          "md:bottom-auto md:top-1/2 md:max-w-[520px] md:rounded-[22px] md:border-2",
          sheetOpen ? "md:-translate-y-1/2 md:opacity-100" : "md:-translate-y-1/2 md:opacity-0 md:pointer-events-none",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <form className="px-5 pb-[52px]" onSubmit={submitBooking}>
          <div className="mx-auto mb-[22px] mt-3.5 h-1 w-9 rounded-sm bg-[#2A4A35]" />
          <h2 id="sheet-title" className="mb-1 text-2xl font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
            Reserve Court
          </h2>
          <p className="mb-[22px] text-[13px] italic text-[#8AAF95]">Fill in your details to submit a booking request.</p>
          <div className="mb-6 rounded-xl border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5">
            <div className={cx(eyebrowClass, "mb-2.5")}>Your Selection</div>
            {selectedSlots.map((slot) => (
              <div key={slot.slot_start_at} className="flex items-center justify-between border-b border-[#1F3D29] py-[7px]">
                <span className="text-sm font-semibold text-[#F0F7F2]">{formatTimeRange(slot.slot_start_at, slot.slot_end_at, court.timezone)}</span>
                <span className="font-mono text-[12px] font-normal text-[#8AAF95]">{priceLabel}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center justify-between border-t border-[#2A4A35] pt-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">Estimated Total</span>
              <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#4ADE80]">
                {formatMoney(totalCostCents, court.currencyCode)}
              </span>
            </div>
          </div>

          <Field label="First Name">
            <input
              id="first-name"
              className="w-full rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5 text-base font-medium text-[#F0F7F2] outline-none transition focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)]"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="e.g. Maria"
              autoComplete="given-name"
            />
          </Field>
          <Field label="Contact Number">
            <input
              id="contact-number"
              className="w-full rounded-[10px] border border-[#2A4A35] bg-[#1C3828] px-4 py-3.5 text-base font-medium text-[#F0F7F2] outline-none transition focus:border-[#4ADE80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)]"
              type="tel"
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              placeholder="09XX XXX XXXX"
              autoComplete="tel"
            />
          </Field>
          <div className="mb-5">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8AAF95]">Payment Method</span>
            <div className="grid grid-cols-2 gap-2">
              <PaymentButton selected={paymentMethod === "gcash"} onClick={() => setPaymentMethod("gcash")}>
                <span>💳</span>
                <span>GCash</span>
              </PaymentButton>
              <PaymentButton selected={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")}>
                <span>💵</span>
                <span>Cash</span>
              </PaymentButton>
            </div>
          </div>
          {submitError && (
            <div className="mb-4 rounded-[10px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)] px-3 py-2.5 text-xs font-bold text-[#F87171]">
              {submitError}
            </div>
          )}
          <button type="submit" className="w-full rounded-xl bg-[#4ADE80] p-4 text-[15px] font-black text-[#0F2418] disabled:cursor-wait disabled:opacity-65" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </div>

      <div
        className={cx(
          "pointer-events-none fixed inset-0 z-[120] translate-y-5 opacity-0 transition",
          "md:flex md:items-center md:justify-center md:bg-[rgba(5,14,9,0.72)] md:backdrop-blur-md",
          confirmation && "pointer-events-auto translate-y-0 opacity-100",
        )}
      >
        <div className="flex h-full flex-col bg-[#0F2418] md:h-auto md:w-full md:max-w-[480px] md:overflow-hidden md:rounded-[22px]">
          <div className="px-6 pb-[22px] pt-[54px] md:pt-10">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4ADE80]">Booking Requested</div>
            <div className="text-5xl font-black leading-[0.95] tracking-[-0.05em] text-[#F0F7F2]">
              You&apos;re on
              <br />
              the <em className="not-italic text-[#4ADE80]">queue.</em>
            </div>
            <div className="mt-4 max-w-[300px] text-sm leading-6 text-[#8AAF95]">
              Admin will confirm shortly. Save your booking code - you&apos;ll need it to check your status.
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3.5 px-5 pb-6">
            <div className={cx(cardClass, "rounded-[18px] p-[18px]")}>
              <div className={eyebrowClass}>Your Booking Code</div>
              <div className="my-3 font-mono text-[42px] font-medium tracking-[0.04em] text-[#4ADE80]">
                {confirmation?.code ?? "-"}
              </div>
              <div className="flex flex-col gap-2">
                {confirmation?.slots.map((slot) => (
                  <div key={slot.slot_start_at} className="flex justify-between gap-3 border-t border-[#1F3D29] pt-2">
                    <span className="text-[13px] font-bold text-[#F0F7F2]">{formatTimeRange(slot.slot_start_at, slot.slot_end_at, court.timezone)}</span>
                    <span className="font-mono text-[12px] font-normal text-[#4A6B55]">1 hr · {priceLabel}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 rounded-xl border border-[rgba(251,191,36,0.16)] bg-[rgba(251,191,36,0.1)] p-3">
              <span>⚠️</span>
              <span className="text-xs leading-5 text-[#FBBF24]">
                Screenshot this screen. This code won&apos;t appear again. Use it under My Booking to check your status.
              </span>
            </div>
          </div>
          <button type="button" className="mx-5 mb-[34px] rounded-[14px] bg-[#F0F7F2] p-4 text-[15px] font-black text-[#0F2418]" onClick={() => setConfirmation(null)}>
            Got it - I saved the code
          </button>
        </div>
      </div>

      <div
        className={cx(
          "pointer-events-none fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(5,14,9,0.72)] p-6 opacity-0 backdrop-blur-md transition",
          warningOpen && "pointer-events-auto opacity-100",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="warning-title"
      >
        <div className={cx(cardClass, "w-full max-w-[350px] rounded-[18px] p-5")}>
          <h2 id="warning-title" className="m-0 text-[22px] font-black text-[#F0F7F2]">
            Heads up.
          </h2>
          <p className="my-4 text-[13px] leading-6 text-[#8AAF95]">
            One or more selected slots begins within the next 60 minutes. Make sure you can get to the court in time.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="rounded-[10px] bg-[#1C3828] p-[13px] font-black text-[#8AAF95]" onClick={() => setWarningOpen(false)}>
              Go Back
            </button>
            <button type="button" className="rounded-[10px] bg-[#4ADE80] p-[13px] font-black text-[#0F2418]" onClick={proceedFromWarning}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={eyebrowClass}>{label}</span>
      <span className="text-[17px] font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
        {value} {accent && <em className="not-italic text-[#4ADE80]">{accent}</em>}
      </span>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] last:border-b-0">
      <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">{icon}</div>
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">{label}</div>
        <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8AAF95]">{label}</label>
      {children}
    </div>
  );
}

function PaymentButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx(
        "flex items-center justify-center gap-2 rounded-[10px] border p-[13px] text-[13px] font-extrabold",
        selected
          ? "border-[#4ADE80] bg-[rgba(74,222,128,0.12)] text-[#4ADE80]"
          : "border-[#2A4A35] bg-[#1C3828] text-[#8AAF95]",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
