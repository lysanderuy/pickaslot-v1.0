import Link from "next/link";

export default function LookupPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
            My Booking
          </p>
          <h1 className="text-3xl font-semibold text-stone-950 sm:text-4xl">
            Booking code lookup shell
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-700">
            The actual lookup endpoint will fetch the booking by code from a
            server-side route backed by Supabase and Postgres.
          </p>
          <Link href="/" className="text-sm font-medium text-stone-950 underline">
            Back to home
          </Link>
        </header>

        <section className="rounded-[1.5rem] border border-black/10 bg-white/80 p-6 shadow-sm">
          <label className="block text-sm font-medium text-stone-600" htmlFor="booking-code">
            Booking code
          </label>
          <div className="mt-3 rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-500">
            Enter the code from your confirmation screen, for example 1234-XK9.
          </div>
        </section>
      </div>
    </main>
  );
}
