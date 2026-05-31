"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProfileProps {
  name: string;
}

export function SidebarProfile({ name, onNavClick }: SidebarProfileProps & { onNavClick?: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
      onNavClick?.();
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-slate-200 bg-slate-50/50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-5">
      <div className="mb-3.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">ADMIN</div>
        <div className="mt-0.5 truncate text-[13px] font-bold text-slate-700">{name}</div>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut size={14} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
        {loading ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
