import { Skeleton } from "@/components/ui/Skeleton";
import { tw } from "@/lib/ui/tokens";

function SectionLabelSkeleton() {
  return <Skeleton className="mb-3 h-3 w-24 rounded" />;
}

export function BookPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading court details">
      {/* Hero */}
      <section className="relative mt-3 overflow-hidden rounded-[18px] border border-[#2A4A35] bg-[#162E20] p-4 sm:mt-4 sm:rounded-[20px] sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-3/5 max-w-[220px] rounded-lg sm:h-7" />
            <Skeleton className="h-3.5 w-4/5 max-w-[280px] rounded" />
          </div>
          <Skeleton className="h-8 w-[72px] shrink-0 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-[#2A4A35] pt-4 sm:flex sm:items-center sm:justify-between sm:gap-0">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col gap-1.5 sm:items-center">
              <Skeleton className="h-2.5 w-10 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 xl:grid-cols-[1fr_400px]">
        <div>
          {/* Date picker */}
          <section className="pt-6">
            <SectionLabelSkeleton />
            <Skeleton className="h-[62px] w-full rounded-[14px]" />
            <div className="mt-1.5 grid grid-cols-7 gap-[5px]">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton key={index} className="h-[58px] rounded-[10px]" />
              ))}
            </div>
          </section>

          {/* Slot grid */}
          <section className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <Skeleton className="mb-3 h-3 w-48 max-w-full rounded" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="min-h-[73px] rounded-[14px]" />
              ))}
            </div>
          </section>
        </div>

        {/* Reservations sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start lg:h-fit">
          <section className="pt-6">
            <div className={`${tw.sectionLabel} mb-3`}>
              <span className="sr-only">Loading reservations</span>
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-[#2A4A35] bg-[#162E20] px-4 py-[13px]"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Skeleton className="h-3 w-8 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Court info */}
      <section className="pb-12 pt-6 lg:pb-16">
        <SectionLabelSkeleton />
        <Skeleton className="h-[52px] w-full rounded-[14px] lg:h-[180px]" />
      </section>
    </div>
  );
}
