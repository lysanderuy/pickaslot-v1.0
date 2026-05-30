import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { getRequiredEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  const supabase = createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.signOut();

  return response;
}
