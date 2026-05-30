"use client";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center sm:px-5 sm:py-10">
      <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-[14px] border border-[#2A4A35] bg-[#162E20] text-[28px]">
        🎫
      </div>
      <p className="text-base font-extrabold tracking-[-0.02em] text-[#F0F7F2] sm:text-[18px]">
        {title ?? "No booking looked up yet"}
      </p>
      <p className="max-w-[260px] text-[13px] font-medium leading-[1.5] text-[#8AAF95]">
        {description ?? "Enter the code from your booking confirmation above to see your reservation."}
      </p>
    </div>
  );
}
