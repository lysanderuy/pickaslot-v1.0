import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";

function isSafeRedirectPath(path: string | null) {
  return !!path && path.startsWith("/");
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = isSafeRedirectPath(requestUrl.searchParams.get("next"))
    ? requestUrl.searchParams.get("next")!
    : "/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
