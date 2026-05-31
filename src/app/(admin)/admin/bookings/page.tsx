"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cx } from "@/lib/cx";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookingActionButtons } from "@/components/admin/BookingActionButtons";
import { SlotDisplay } from "@/components/admin/SlotDisplay";
import { ChevronDown } from "lucide-react";

interface Booking {
  id: string;
  bookingCode: string;
  bookingDate: string;
  fullName: string;
  contactNumber: string;
  paymentMethod: string;
  status: "pending" | "confirmed" | "rejected";
  slotCount: number;
  totalAmount: number;
  slotLabels: string | null;
  timezone: string | null;
}

interface PaginatedResponse {
  bookings: Booking[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 6;

function useBookings(params: {
  page: number;
  search?: string;
  dateRange?: string;
  status?: string;
  payment?: string;
}) {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);

      const searchParams = new URLSearchParams();
      searchParams.set("page", String(params.page));
      searchParams.set("limit", String(PAGE_SIZE));
      if (params.search) searchParams.set("search", params.search);
      if (params.dateRange && params.dateRange !== "all") searchParams.set("dateRange", params.dateRange);
      if (params.status && params.status !== "all") searchParams.set("status", params.status);
      if (params.payment && params.payment !== "all") searchParams.set("payment", params.payment);

      try {
        const res = await fetch(`/api/admin/bookings?${searchParams.toString()}`, { signal: controller.signal });
        const result = await res.json();
        if (!controller.signal.aborted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [params.page, params.search, params.dateRange, params.status, params.payment, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { data, isLoading, refresh };
}

type DateRangeFilter = "all" | "today" | "this_week" | "this_month";
type StatusFilter = "all" | "pending" | "confirmed" | "rejected";
type PaymentFilter = "all" | "gcash" | "cash";

interface FilterOption {
  value: string;
  label: string;
}

const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
];

const PAYMENT_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Payment" },
  { value: "gcash", label: "GCash" },
  { value: "cash", label: "Cash" },
];

function formatBookingDate(dateVal: unknown, timezone: string = "Asia/Manila"): string {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal as string);
  return d.toLocaleDateString("en-PH", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPaymentMethod(method: unknown): string {
  const m = typeof method === "string" ? method.toLowerCase() : "";
  if (m === "gcash") return "GCash";
  if (m === "cash") return "Cash";
  return typeof method === "string" && method ? method : "—";
}

function getPaymentIcon(method: unknown): string {
  const m = typeof method === "string" ? method.toLowerCase() : "";
  if (m === "gcash") return "💳";
  if (m === "cash") return "💵";
  return "";
}

function formatSlotCount(slotCount: unknown): string {
  const hrs = Number(slotCount);
  return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
}

function formatAmount(totalAmount: unknown): string {
  const amount = Math.round(Number(totalAmount));
  return `₱${amount.toLocaleString("en-PH")}`;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    pillClass: "bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    pillClass: "bg-green-50 text-green-800",
    dotClass: "bg-green-600",
  },
  rejected: {
    label: "Rejected",
    pillClass: "bg-rose-50 text-rose-700",
    dotClass: "bg-rose-600",
  },
} as const satisfies Record<string, {
  label: string;
  pillClass: string;
  dotClass: string;
}>;

function FilterDropdown({
  label,
  isOpen,
  onToggle,
  options,
  onSelect,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  options: FilterOption[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative" data-dropdown>
      <button
        onClick={onToggle}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={cx("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg" data-dropdown>
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className="flex w-full items-center px-3 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", cfg.pillClass)}>
      <span className={cx("h-1 w-1 shrink-0 rounded-full", cfg.dotClass)} />
      {cfg.label}
    </span>
  );
}

function ViewBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <Link
      href={`/admin/bookings/${bookingId}`}
      className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
    >
      View
    </Link>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-between">
      <p className="text-[12px] font-medium text-slate-500">
        Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cx(
                "flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                p === page
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<"dateRange" | "status" | "payment" | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchParam = searchParams.get("search") || "";
  const dateRangeParam = (searchParams.get("dateRange") as DateRangeFilter) || "all";
  const statusParam = (searchParams.get("status") as StatusFilter) || "all";
  const paymentParam = (searchParams.get("payment") as PaymentFilter) || "all";

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchQuery(searchParam);
  }

  const { data, isLoading, refresh } = useBookings({
    page: currentPage,
    search: searchParam,
    dateRange: dateRangeParam,
    status: statusParam,
    payment: paymentParam,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as Element).closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    if (searchQuery) params.set("search", searchQuery);
    if (dateRangeParam !== "all") params.set("dateRange", dateRangeParam);
    if (statusParam !== "all") params.set("status", statusParam);
    if (paymentParam !== "all") params.set("payment", paymentParam);
    router.push(`/admin/bookings?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("page", "1");
      if (searchQuery) params.set("search", searchQuery);
      if (dateRangeParam !== "all") params.set("dateRange", dateRangeParam);
      if (statusParam !== "all") params.set("status", statusParam);
      if (paymentParam !== "all") params.set("payment", paymentParam);
      router.push(`/admin/bookings?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, router, dateRangeParam, statusParam, paymentParam]);

  const setFilter = (key: "dateRange" | "status" | "payment", value: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (searchQuery) params.set("search", searchQuery);

    // Include existing filters (excluding the one being changed)
    if (key !== "dateRange" && dateRangeParam !== "all") params.set("dateRange", dateRangeParam);
    if (key !== "status" && statusParam !== "all") params.set("status", statusParam);
    if (key !== "payment" && paymentParam !== "all") params.set("payment", paymentParam);

    // Add new value if not "all"
    if (value !== "all") params.set(key, value);

    router.push(`/admin/bookings?${params.toString()}`, { scroll: false });
  };

  const bookings = data?.bookings ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <AdminPageHeader className="sm:py-5">
        <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
          All Bookings
        </h1>
        <p className="mt-0.5 text-[13px] font-medium text-slate-500">
          Manage and review all court reservations.
        </p>
      </AdminPageHeader>

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name or code..."
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pl-9 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <svg
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <FilterDropdown
              label={DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeParam)?.label || "All Time"}
              isOpen={openDropdown === "dateRange"}
              onToggle={() => setOpenDropdown(openDropdown === "dateRange" ? null : "dateRange")}
              options={DATE_RANGE_OPTIONS}
              onSelect={(value) => {
                setFilter("dateRange", value);
                setOpenDropdown(null);
              }}
            />

            <FilterDropdown
              label={STATUS_OPTIONS.find((o) => o.value === statusParam)?.label || "All Status"}
              isOpen={openDropdown === "status"}
              onToggle={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
              options={STATUS_OPTIONS}
              onSelect={(value) => {
                setFilter("status", value);
                setOpenDropdown(null);
              }}
            />

            <FilterDropdown
              label={PAYMENT_OPTIONS.find((o) => o.value === paymentParam)?.label || "All Payment"}
              isOpen={openDropdown === "payment"}
              onToggle={() => setOpenDropdown(openDropdown === "payment" ? null : "payment")}
              options={PAYMENT_OPTIONS}
              onSelect={(value) => {
                setFilter("payment", value);
                setOpenDropdown(null);
              }}
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {isLoading && !data ? (
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3">
                <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="h-5 w-full max-w-[180px] animate-pulse rounded bg-slate-100" />
                      <div className="h-5 w-full max-w-[120px] animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-slate-700">
                {searchQuery ? "No results found" : "No bookings yet"}
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                {searchQuery ? `No bookings match "${searchQuery}"` : "Bookings will appear here once created"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 px-3 py-4 sm:hidden">
                {bookings.map((booking) => {
                  const status = booking.status as "pending" | "confirmed" | "rejected";
                  const statusConfig = STATUS_CONFIG[status];

                  return (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5"
                    >
                      {/* Header: Status + Code */}
                      <div className="flex items-center justify-between">
                        <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", statusConfig.pillClass)}>
                          <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", statusConfig.dotClass)} />
                          {statusConfig.label}
                        </span>
                        <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                          {booking.bookingCode}
                        </span>
                      </div>

                      {/* Guest Info */}
                      <div className="mt-3">
                        <p className="text-[14px] font-bold text-slate-900 break-words">
                          {booking.fullName}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] font-medium text-slate-400 break-all">
                          {booking.contactNumber}
                        </p>
                      </div>

                      {/* Date & Time */}
                      <div className="mt-3 flex items-center gap-1.5 text-slate-600">
                        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[13px] font-semibold break-words">
                          {formatBookingDate(booking.bookingDate, booking.timezone ?? undefined)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-slate-600">
                        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <SlotDisplay
                          slotLabels={booking.slotLabels}
                          slotCount={booking.slotCount}
                          timezone={booking.timezone ?? undefined}
                          bookingDate={booking.bookingDate ?? undefined}
                        />
                        <span className="font-mono text-[11px] font-medium text-slate-400">
                          ({formatSlotCount(booking.slotCount)})
                        </span>
                      </div>

                      {/* Payment */}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-[13px] font-bold text-slate-900">
                          {formatAmount(booking.totalAmount)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                          <span>{getPaymentIcon(booking.paymentMethod)}</span>
                          <span>{formatPaymentMethod(booking.paymentMethod)}</span>
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3">
                        {status === "pending" ? (
                          <BookingActionButtons bookingId={booking.id} onActionComplete={refresh} />
                        ) : (
                          <ViewBookingButton bookingId={booking.id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[80px]" />
                    <col className="w-[90px]" />
                    <col className="w-[150px]" />
                    <col className="w-[90px]" />
                    <col className="w-[150px]" />
                    <col className="w-[110px]" />
                    <col className="w-[100px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Status", "Code", "Guest", "Date", "Slots", "Payment", "Actions"].map((col, i) => (
                        <th
                          key={col}
                          className={cx(
                            "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400",
                            i === 6 && "text-right",
                          )}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const status = booking.status as "pending" | "confirmed" | "rejected";

                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-3.5 align-top">
                            <StatusPill status={status} />
                          </td>
                          <td className="px-3 py-3.5 align-top">
                            <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                              {booking.bookingCode}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <p className="text-[13px] font-bold leading-none text-slate-900 break-words">
                              {booking.fullName}
                            </p>
                            <p className="mt-[3px] font-mono text-[11px] font-medium text-slate-400 break-all">
                              {booking.contactNumber}
                            </p>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <span className="text-[13px] font-semibold text-slate-700 break-words">
                              {formatBookingDate(booking.bookingDate, booking.timezone ?? undefined)}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <SlotDisplay
                              slotLabels={booking.slotLabels}
                              slotCount={booking.slotCount}
                              timezone={booking.timezone ?? undefined}
                              bookingDate={booking.bookingDate ?? undefined}
                            />
                            <p className="mt-[3px] font-mono text-[11px] font-medium text-slate-400">
                              {formatSlotCount(booking.slotCount)}
                            </p>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <span className="flex items-center gap-1.5">
                              <span className="text-[13px] font-bold text-slate-900 break-words">
                                {formatAmount(booking.totalAmount)}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">
                                · {getPaymentIcon(booking.paymentMethod)} {formatPaymentMethod(booking.paymentMethod)}
                              </span>
                            </span>
                          </td>

                          <td className="px-3 py-3.5 align-top text-right">
                            {status === "pending" ? (
                              <BookingActionButtons bookingId={booking.id} onActionComplete={refresh} />
                            ) : (
                              <ViewBookingButton bookingId={booking.id} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
