import Link from "next/link";

import { cx } from "@/lib/cx";
import { getOverviewStats, getRecentPendingBookings, getRecentActivityBookings } from "@/services/admin/admin-booking-service";
import { getPrimaryCourt } from "@/services/courts/court-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OverviewBookings } from "@/components/admin/OverviewBookings";
import { SlotDisplay } from "@/components/admin/SlotDisplay";

function formatRevenue(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

function getGreeting(): string {
  const hour = parseInt(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      hour12: false,
    }),
    10,
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

export default async function AdminOverviewPage() {
  const [stats, pendingBookings, recentBookings, court] = await Promise.all([
    getOverviewStats(),
    getRecentPendingBookings(3),
    getRecentActivityBookings(5),
    getPrimaryCourt(),
  ]);

  return (
    <>
      <AdminPageHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {getTodayLabel()}
          </p>
          <h1 className="mt-0.5 text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
            {getGreeting()}
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-slate-500">
            {`Here's what's happening at ${court.name}.`}
          </p>
        </div>
        {stats.pendingCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-700">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            {stats.pendingCount} pending review
          </div>
        )}
      </AdminPageHeader>

      <div className="flex flex-col gap-6 px-4 sm:px-6 py-4 sm:py-6">

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Needs Action
            </p>
          </div>
          <p className="mt-3 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-amber-600">
            {stats.pendingCount}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-400">
            {stats.pendingCount === 1 ? "booking needs" : "bookings need"} review
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-green-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Confirmed Today
            </p>
          </div>
          <p className="mt-3 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-green-700">
            {stats.confirmedTodayCount}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-400">
            {stats.confirmedTodayCount === 1 ? "booking" : "bookings"} confirmed for today
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Total Today
            </p>
          </div>
          <p className="mt-3 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-slate-800">
            {stats.totalTodayCount}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-400">
            total {stats.totalTodayCount === 1 ? "booking" : "bookings"} today
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-green-800" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Week Revenue
            </p>
          </div>
          <p className="mt-3 font-mono text-[20px] font-extrabold leading-none tracking-[-0.03em] text-slate-900">
            {formatRevenue(stats.weekRevenue)}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-400">
            from confirmed bookings this week
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Needs Action
          </span>
          <Link
            href="/admin/bookings"
            className="text-[12px] font-semibold text-green-700 hover:text-green-800"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <OverviewBookings pendingBookings={pendingBookings} />
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Recent Bookings
          </span>
          <Link
            href="/admin/bookings"
            className="text-[12px] font-semibold text-green-700 hover:text-green-800"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {recentBookings.length === 0 ? (
            <p className="py-7 text-center text-[13px] font-medium italic text-slate-400">
              No recent bookings.
            </p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 px-3 py-4 sm:hidden">
                {recentBookings.map((booking) => {
                  const status = booking.status as "pending" | "confirmed" | "rejected";
                  const statusConfig = STATUS_CONFIG[status];

                  return (
                    <div
                      key={booking.id as string}
                      className="rounded-xl border border-slate-200 bg-white p-3.5"
                    >
                      {/* Header: Status + Code */}
                      <div className="flex items-center justify-between">
                        <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", statusConfig.pillClass)}>
                          <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", statusConfig.dotClass)} />
                          {statusConfig.label}
                        </span>
                        <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                          {booking.bookingCode as string}
                        </span>
                      </div>

                      {/* Guest Info */}
                      <div className="mt-3">
                        <p className="text-[14px] font-bold text-slate-900 break-words">
                          {booking.fullName as string}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] font-medium text-slate-400 break-all">
                          {booking.contactNumber as string}
                        </p>
                      </div>

                      {/* Date & Time */}
                      <div className="mt-3 flex items-center gap-1.5 text-slate-600">
                        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[13px] font-semibold break-words">
                          {formatBookingDate(booking.bookingDate, booking.timezone as string | undefined)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-slate-600">
                        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <SlotDisplay
                          slotLabels={booking.slotLabels as string | null | undefined}
                          slotCount={booking.slotCount}
                          timezone={booking.timezone as string | null | undefined}
                          bookingDate={booking.bookingDate as string | null | undefined}
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
                        <ViewBookingButton bookingId={booking.id as string} />
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
                    {recentBookings.map((booking) => {
                      const status = booking.status as "pending" | "confirmed" | "rejected";

                      return (
                        <tr
                          key={booking.id as string}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-3.5 align-top">
                            <StatusPill status={status} />
                          </td>
                          <td className="px-3 py-3.5 align-top">
                            <span className="font-mono text-[12px] font-medium text-slate-500 break-all">
                              {booking.bookingCode as string}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <p className="text-[13px] font-bold leading-none text-slate-900 break-words">
                              {booking.fullName as string}
                            </p>
                            <p className="mt-[3px] font-mono text-[11px] font-medium text-slate-400 break-all">
                              {booking.contactNumber as string}
                            </p>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <span className="text-[13px] font-semibold text-slate-700 break-words">
                              {formatBookingDate(booking.bookingDate, booking.timezone as string | undefined)}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 align-top">
                            <SlotDisplay
                              slotLabels={booking.slotLabels as string | null | undefined}
                              slotCount={booking.slotCount}
                              timezone={booking.timezone as string | null | undefined}
                              bookingDate={booking.bookingDate as string | null | undefined}
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
                            <ViewBookingButton bookingId={booking.id as string} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      </div>
    </>
  );
}
