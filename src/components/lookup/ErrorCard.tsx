"use client";

interface ErrorCardProps {
  title: string;
  description: string;
}

export function ErrorCard({ title, description }: ErrorCardProps) {
  return (
    <div
      className="flex animate-[fadeUp_0.18s_ease_both] items-start gap-3 rounded-[14px] border bg-[rgba(248,113,113,0.1)] px-4 py-4 sm:px-5"
      style={{ borderColor: "rgba(248,113,113,0.2)" }}
    >
      <span className="mt-px shrink-0 text-xl">⚠️</span>
      <div>
        <p className="mb-1 text-base font-bold text-[#F87171]">{title}</p>
        <p className="text-[13px] font-medium leading-[1.5] text-[rgba(248,113,113,0.7)]">{description}</p>
      </div>
    </div>
  );
}
