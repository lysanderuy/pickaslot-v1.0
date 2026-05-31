import type { ReactNode } from "react";

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

function SectionSkeleton({
  titleWidth,
  descWidth,
  children,
}: {
  titleWidth: number;
  descWidth: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <Sk className="h-[15px]" style={{ width: titleWidth }} />
        <Sk className="mt-1.5 h-[13px]" style={{ width: descWidth }} />
      </div>
      <div className="px-4 py-5 sm:px-5">{children}</div>
    </section>
  );
}

export default function AdminSettingsLoading() {
  return (
    <div className="flex flex-col">
      <AdminPageHeader>
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
            Court Settings
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-slate-500">
            Changes apply immediately to the user-facing booking site.
          </p>
        </div>
      </AdminPageHeader>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <SectionSkeleton titleWidth={128} descWidth={256}>
          <div className="flex items-center justify-between">
            <div>
              <Sk className="h-[14px] w-36" />
              <Sk className="mt-1.5 h-[13px] w-52" />
            </div>
            <Sk className="h-6 w-11 rounded-full" />
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth={96} descWidth={224}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i}>
                <Sk className="h-[13px] w-20" />
                <Sk className="mt-1.5 h-[38px] w-full rounded-lg" />
              </div>
            ))}
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth={112} descWidth={192}>
          <div className="flex flex-col gap-5">
            <div>
              <Sk className="h-[13px] w-24" />
              <Sk className="mt-1.5 h-[38px] w-full rounded-lg" />
            </div>
            <div>
              <Sk className="h-[13px] w-20" />
              <Sk className="mt-1.5 h-[38px] w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Sk className="h-[13px] w-40" />
                <Sk className="mt-1.5 h-[38px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth={72} descWidth={248}>
          <div className="flex flex-col gap-6">
            <div>
              <Sk className="h-[13px] w-40" />
              <Sk className="mt-1.5 h-24 w-full rounded-lg" />
            </div>
            <div className="border-t border-slate-200 pt-5">
              <Sk className="h-[13px] w-44" />
              <div className="mt-4 flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Sk className="h-5 w-5 rounded" />
                      <div>
                        <Sk className="h-[14px] w-16" />
                        <Sk className="mt-1 h-[12px] w-48" />
                      </div>
                    </div>
                    <Sk className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth={96} descWidth={240}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2.5"
                >
                  <Sk className="h-6 w-6 shrink-0 rounded-full" />
                  <Sk className="h-[14px] flex-1 rounded" />
                </div>
              ))}
            </div>
            <Sk className="h-[42px] w-full rounded-lg" />
          </div>
        </SectionSkeleton>
      </div>
    </div>
  );
}
