import type { ReactNode } from "react";

interface InfoRowProps {
  icon: string;
  label: string;
  children: ReactNode;
}

export function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex gap-3 border-b border-[#1F3D29] py-[13px] last:border-b-0">
      <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#1C3828] text-sm">
        {icon}
      </div>
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4A6B55]">{label}</div>
        <div className="text-[13px] font-medium leading-[1.55] text-[#8AAF95]">{children}</div>
      </div>
    </div>
  );
}
