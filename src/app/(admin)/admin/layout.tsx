import Link from "next/link";
import { redirect } from "next/navigation";

import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { requireAdminProfile } from "@/services/admin/admin-auth";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/settings", label: "Court Settings" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await requireAdminProfile();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      redirect("/");
    }

    throw error;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-400">
            PickASlot Admin
          </Link>
          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-stone-200 transition hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          {children}
        </section>
      </div>
    </div>
  );
}
