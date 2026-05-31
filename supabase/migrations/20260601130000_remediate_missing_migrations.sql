-- Remediation: documents schema changes that were applied directly to the DB
-- without corresponding migration files. All statements are idempotent.

-- 1. Rename bookings.first_name -> full_name
--    Applied directly between 20260530151119 and 20260530160000.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'bookings'
      AND column_name  = 'first_name'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN first_name TO full_name;
  END IF;
END
$$;

-- 2. Add gcash_number, gcash_name, messenger_url to courts.
--    These columns exist in the Drizzle schema and are queried by the app
--    but were never added via a migration file.
ALTER TABLE public.courts ADD COLUMN IF NOT EXISTS gcash_number   text;
ALTER TABLE public.courts ADD COLUMN IF NOT EXISTS gcash_name     text;
ALTER TABLE public.courts ADD COLUMN IF NOT EXISTS messenger_url  text;

-- 3. Drop the courts_open_close_check constraint.
--    The initial schema added CHECK (open_time < close_time) which blocks overnight
--    courts (open_time > close_time). The constraint was dropped directly when
--    overnight-court support was introduced.
ALTER TABLE public.courts DROP CONSTRAINT IF EXISTS courts_open_close_check;

-- 4. Drop courts.payment_instructions.
--    Present in the initial schema but never referenced by any application code
--    or the Drizzle schema. Dropping to keep the DB and schema in sync.
ALTER TABLE public.courts DROP COLUMN IF EXISTS payment_instructions;

-- 5. Drop __drizzle_migrations tracking table.
--    An AI bot manually created this table and inserted a fake hash to prevent
--    drizzle-kit from re-running 0000_initial.sql on a DB already set up by
--    Supabase migrations. Supabase CLI is the only migration runner going forward.
DROP TABLE IF EXISTS public."__drizzle_migrations";
