import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { db, profiles } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function requireAdminProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile?.isAdmin) {
    throw new ForbiddenError();
  }

  return { user, profile };
}
