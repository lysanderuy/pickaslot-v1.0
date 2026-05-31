"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  function togglePassword() {
    setPasswordVisible(!passwordVisible);
  }

  function clearError() {
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-[family-name:var(--font-jakarta-sans)] sm:p-6">
      <div className="flex w-full max-w-[960px] min-h-[560px] overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1),_0_2px_8px_rgba(0,0,0,0.06)]">
        {/* LEFT PANEL - Hidden on mobile */}
        <div className="relative hidden flex-1 flex-col justify-between bg-[#1a5c35] px-12 py-[52px] md:flex">
          {/* Court line texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              background: `
                linear-gradient(90deg, transparent 49.5%, rgba(255,255,255,0.06) 49.5%, rgba(255,255,255,0.06) 50.5%, transparent 50.5%),
                linear-gradient(0deg, transparent 69%, rgba(255,255,255,0.06) 69%, rgba(255,255,255,0.06) 70%, transparent 70%),
                linear-gradient(0deg, transparent 29%, rgba(255,255,255,0.06) 29%, rgba(255,255,255,0.06) 30%, transparent 30%)
              `,
            }}
          />

          <div className="relative z-10">
            <div className="mb-12 text-[22px] font-extrabold tracking-[-0.02em] text-white/90">
              Pick<em className="not-italic text-[#4ADE80]">A</em>Slot
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="mb-3.5 text-[32px] font-extrabold tracking-[-0.03em] text-white leading-[1.15]">
              Manage your<br />court with ease.
            </h1>
            <p className="max-w-[280px] text-[14px] font-medium text-white/55 leading-[1.6]">
              Review bookings, confirm slots, and keep your court running smoothly - all from one place.
            </p>
          </div>

          {/* Court diagram SVG */}
          <svg
            className="absolute -bottom-5 -right-5 h-[180px] w-[200px] opacity-[0.08]"
            viewBox="0 0 200 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="10" y="10" width="180" height="160" stroke="white" strokeWidth="2" />
            <line x1="100" y1="10" x2="100" y2="170" stroke="white" strokeWidth="2" />
            <line x1="10" y1="60" x2="190" y2="60" stroke="white" strokeWidth="1.5" />
            <line x1="10" y1="120" x2="190" y2="120" stroke="white" strokeWidth="1.5" />
            <line x1="55" y1="60" x2="55" y2="120" stroke="white" strokeWidth="1" />
            <line x1="145" y1="60" x2="145" y2="120" stroke="white" strokeWidth="1" />
          </svg>

          <div className="relative z-10 text-[12px] font-medium text-white/30">
            Villa del Rio · Admin Panel
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex w-full flex-col justify-center bg-white px-6 py-8 md:w-[420px] md:px-12 md:py-[52px]">
          {/* Mobile logo - shown only on mobile */}
          <div className="mb-6 md:hidden">
            <div className="text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
              Pick<em className="not-italic text-[#2a7a4a]">A</em>Slot
            </div>
            <span className="mt-1 inline-block rounded bg-green-50 px-[7px] py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-green-700">
              Admin
            </span>
          </div>

          <div className="mb-2 text-[11px] font-extrabold tracking-[0.1em] uppercase text-slate-400">
            Admin Access
          </div>
          <h2 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.02em] text-slate-900">
            Welcome back.
          </h2>
          <p className="mb-9 text-[13px] font-medium text-slate-500 leading-[1.5]">
            Sign in to manage bookings and court settings.
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4.5 flex items-center gap-2.5 rounded-[7px] border border-rose-200 bg-rose-50 px-3.5 py-2.5">
              <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[13px] font-medium text-rose-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4.5">
            <div className="mb-4.5">
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-extrabold tracking-[0.08em] uppercase text-slate-500"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  }}
                  placeholder="admin@villadelrio.com"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#2a7a4a] focus:bg-white focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(42,122,74,0.08)]"
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-extrabold tracking-[0.08em] uppercase text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#2a7a4a] focus:bg-white focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(42,122,74,0.08)]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-none p-1 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M2 2l14 14M7.5 7.7A2.2 2.2 0 0111.3 11M5.3 5.4C3.3 6.8 1 9 1 9s3 5.5 8 5.5c1.6 0 3-.5 4.2-1.2M10.5 3.8C10 3.6 9.5 3.5 9 3.5c-5 0-8 5.5-8 5.5s.8 1.4 2.2 2.7"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M1 9C1 9 4 3.5 9 3.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2a7a4a] px-4 py-3 font-extrabold text-white tracking-[-0.01em] transition-all hover:bg-[#1a5c35] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-[12px] font-medium text-slate-400">
            Forgot your password? Contact your super admin.
          </div>
        </div>
      </div>
    </div>
  );
}
