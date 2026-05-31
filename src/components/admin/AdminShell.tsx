"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { SidebarProfile } from "@/components/admin/SidebarProfile";

interface AdminShellProps {
  children: React.ReactNode;
  profile: { fullName: string | null; email: string | null };
}

export function AdminShell({ children, profile }: AdminShellProps) {
  const name = profile.fullName ?? "Admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-[100dvh] max-h-[100dvh] w-[240px] max-w-[75vw] flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 lg:w-[220px] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 pb-[18px] pt-[22px]">
          <div>
            <span className="text-[17px] font-extrabold tracking-[-0.02em] text-slate-900">
              Pick<span className="text-green-700">A</span>Slot
            </span>
            <span className="ml-2 rounded bg-green-50 px-[7px] py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-green-700">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3">
          <AdminNav onNavClick={() => setSidebarOpen(false)} />
        </nav>

        <SidebarProfile name={name} onNavClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col bg-slate-50 lg:ml-[220px]">
        {/* Mobile header - sticky */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
