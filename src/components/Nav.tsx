"use client";

import Link from "next/link";
import { cx } from "@/lib/cx";

interface NavProps {
  activeTab: "book" | "lookup";
}

export function Nav({ activeTab }: NavProps) {
  return (
    <nav className="sticky top-0 z-40 bg-[#0F2418]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-[18px] sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold tracking-[-0.02em] text-[#F0F7F2] no-underline">
          Pick<span className="text-[#4ADE80]">A</span>Slot
        </Link>
        <div className="flex gap-1">
          <Link
            href="/"
            className={cx(
              "rounded-full px-3.5 py-2 text-xs font-semibold tracking-[0.04em] no-underline",
              activeTab === "book" ? "bg-[#1C3828] text-[#F0F7F2]" : "text-[#4A6B55]"
            )}
          >
            Book
          </Link>
          <Link
            href="/lookup"
            className={cx(
              "rounded-full px-3.5 py-2 text-xs font-semibold tracking-[0.04em] no-underline",
              activeTab === "lookup" ? "bg-[#1C3828] text-[#F0F7F2]" : "text-[#4A6B55]"
            )}
          >
            Find Booking
          </Link>
        </div>
      </div>
    </nav>
  );
}
