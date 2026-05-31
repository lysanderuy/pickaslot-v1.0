import { cx } from "@/lib/cx";

interface AdminPageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/** Sticky page header; sits below the mobile topbar (h-14) and at top on lg+. */
export function AdminPageHeader({ children, className }: AdminPageHeaderProps) {
  return (
    <div
      className={cx(
        "sticky top-14 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-3.5 lg:top-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
