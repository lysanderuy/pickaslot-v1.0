import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

/** Reusable form field wrapper with a design-system-compliant uppercase label. */
export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="mb-5">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8AAF95]">
        {label}
      </span>
      {children}
    </div>
  );
}
