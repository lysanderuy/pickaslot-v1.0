"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, Settings } from "lucide-react";
import { cx } from "@/lib/cx";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  // { href: "/admin/schedule", label: "Schedule", icon: Clock }, // Hidden for now
  { href: "/admin/settings", label: "Court Settings", icon: Settings },
];

export function AdminNav({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cx(
              "flex items-center gap-2.5 rounded-lg px-3 py-[9px] text-[13px] font-semibold transition-all duration-[150ms]",
              active
                ? "bg-green-50 text-green-800"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            )}
          >
            <Icon
              size={16}
              className={cx("shrink-0", active ? "opacity-100" : "opacity-70")}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
