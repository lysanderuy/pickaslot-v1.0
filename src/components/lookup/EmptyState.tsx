"use client";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
      <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-[14px] border border-[#2A4A35] bg-[#162E20] text-[28px]">
        🎫
      </div>
      <p className="text-[18px] font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
        {title ?? "No booking looked up yet"}
      </p>
      <p className="max-w-[260px] text-[13px] font-medium leading-[1.5] text-[#8AAF95]">
        {description ?? "Enter the code from your booking confirmation above to see your reservation."}
      </p>
    </div>
  );
}
