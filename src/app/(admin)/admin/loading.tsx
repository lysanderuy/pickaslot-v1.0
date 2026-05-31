import type React from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cx } from "@/lib/cx";

function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cx("animate-pulse rounded-md bg-slate-200", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function AdminOverviewLoading() {
  return (
    <>
      <AdminPageHeader className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {getTodayLabel()}
          </p>
          <h1 className="mt-0.5 text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
            {getGreeting()}
          </h1>
          <Sk className="mt-1 h-[13px] w-52" />
        </div>
      </AdminPageHeader>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <Sk className="h-[10px] w-24" />
              <Sk className="mt-3 h-8 w-16" />
              <Sk className="mt-1.5 h-[12px] w-32" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <Sk className="h-[13px] w-28" />
            <Sk className="h-[12px] w-16" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {[110, 200, 110, 200, 130, 140].map((w, i) => (
                <Sk key={i} className="h-[10px] w-full max-w-[140px] min-w-0" style={{ width: w }} />
              ))}
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0 sm:grid sm:grid-cols-[110px_200px_110px_200px_130px_1fr] sm:items-center"
            >
              <Sk className="h-[13px] w-full max-w-[110px] sm:w-[110px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[200px] sm:w-[200px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[110px] sm:w-[110px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[200px] sm:w-[200px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[130px] sm:w-[130px] min-w-0" />
              <Sk className="h-7 w-full max-w-[80px] rounded-lg min-w-0 self-end sm:self-auto" />
            </div>
          ))}
        </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <Sk className="h-[13px] w-36" />
            <Sk className="h-[12px] w-16" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {[100, 110, 200, 110, 200, 130, 140].map((w, i) => (
                <Sk key={i} className="h-[10px] w-full max-w-[140px] min-w-0" style={{ width: w }} />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0 sm:grid sm:grid-cols-[100px_110px_200px_110px_200px_130px_1fr] sm:items-center"
            >
              <Sk className="h-5 w-full max-w-[100px] rounded-full sm:w-[100px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[110px] sm:w-[110px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[200px] sm:w-[200px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[110px] sm:w-[110px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[200px] sm:w-[200px] min-w-0" />
              <Sk className="h-[13px] w-full max-w-[130px] sm:w-[130px] min-w-0" />
              <Sk className="h-7 w-full max-w-[60px] rounded-lg sm:w-[60px] min-w-0 self-end sm:self-auto" />
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}

