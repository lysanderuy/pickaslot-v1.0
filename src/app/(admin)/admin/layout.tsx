import { redirect } from "next/navigation";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { requireAdminProfile } from "@/services/admin/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let profile: { fullName: string | null; email: string | null } = {
    fullName: null,
    email: null,
  };

  try {
    const authResult = await requireAdminProfile();
    profile = authResult.profile;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      redirect("/login");
    }
    throw error;
  }

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
