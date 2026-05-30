import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getDataSource } from "@/lib/db";
import { ProfileEntity } from "@/lib/db/entities";

export async function requireAdminProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  const db = await getDataSource();
  const profile = await db.getRepository(ProfileEntity).findOneBy({ id: user.id });

  if (!profile?.isAdmin) {
    throw new ForbiddenError();
  }

  return { user, profile };
}
