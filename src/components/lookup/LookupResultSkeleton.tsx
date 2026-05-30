import { Skeleton } from "@/components/ui/Skeleton";

export function LookupResultSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading booking details">
      {/* Status banner */}
      <div className="flex items-start gap-3 rounded-[12px] border border-[#2A4A35] bg-[#162E20] px-3.5 py-3.5 sm:px-4">
        <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-3.5 w-full max-w-[280px] rounded" />
        </div>
      </div>

      {/* Booking card */}
      <div className="overflow-hidden rounded-[14px] border border-[#2A4A35] bg-[#162E20]">
        <div className="flex flex-col gap-4 border-b border-[#2A4A35] px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20 rounded" />
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <Skeleton className="h-2.5 w-10 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
        </div>

        <div className="border-b border-[#2A4A35] px-4 py-4 sm:px-5">
          <Skeleton className="mb-3 h-2.5 w-24 rounded" />
          <div className="space-y-3">
            <Skeleton className="h-3.5 w-14 rounded" />
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 border-b border-[#1F3D29] py-2 last:border-b-0"
              >
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-14 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-2.5 w-10 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#2A4A35] bg-[#1C3828] px-4 py-3">
        <Skeleton className="h-4 w-4 shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
      </div>

      <Skeleton className="mt-1 h-[46px] w-full rounded-xl" />
    </div>
  );
}
