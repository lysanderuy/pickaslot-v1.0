-- Rename total_cost_cents -> total_amount and remove bank_transfer payment method.

-- 1. Rename column in bookings table
ALTER TABLE public.bookings RENAME COLUMN total_cost_cents TO total_amount;

-- 2. Drop all objects that depend on the payment_method type so we can recreate it
DROP VIEW IF EXISTS public.confirmed_bookings_public;
DROP FUNCTION IF EXISTS public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]);
DROP FUNCTION IF EXISTS public.get_day_availability(uuid, date);
DROP FUNCTION IF EXISTS public.lookup_booking_by_code(text);
DROP FUNCTION IF EXISTS public.create_booking(uuid, date, text, text, text, text[]);
DROP FUNCTION IF EXISTS public.create_booking(uuid, date, text, text, public.payment_method, timestamptz[]);

-- 3. Remove bank_transfer: recreate the enum with only gcash and cash
DELETE FROM public.bookings WHERE payment_method::text = 'bank_transfer';

CREATE TYPE public.payment_method_v2 AS ENUM ('gcash', 'cash');

ALTER TABLE public.bookings
  ALTER COLUMN payment_method TYPE public.payment_method_v2
  USING payment_method::text::public.payment_method_v2;

DROP TYPE public.payment_method;
ALTER TYPE public.payment_method_v2 RENAME TO payment_method;

-- 4. Recreate get_day_availability with total_amount and full_name
CREATE FUNCTION public.get_day_availability(p_court_id uuid, p_booking_date date)
RETURNS TABLE (
  slot_start_at    timestamptz,
  slot_end_at      timestamptz,
  slot_state       text,
  booking_id       uuid,
  booking_code     text,
  full_name        text,
  payment_method   public.payment_method,
  total_amount     integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH court AS (
    SELECT * FROM public.courts WHERE id = p_court_id
  ),
  slot_bounds AS (
    SELECT
      c.id                                                               AS court_id,
      c.price_per_hour_cents,
      (c.open_time > c.close_time)                                       AS is_overnight,
      ((p_booking_date::TIMESTAMP + c.open_time)::TIMESTAMP
        AT TIME ZONE c.timezone)                                         AS period_start,
      CASE
        WHEN c.open_time > c.close_time THEN
          (((p_booking_date + INTERVAL '1 day')::TIMESTAMP + c.close_time)::TIMESTAMP
            AT TIME ZONE c.timezone) - INTERVAL '1 hour'
        ELSE
          ((p_booking_date::TIMESTAMP + c.close_time)::TIMESTAMP
            AT TIME ZONE c.timezone) - INTERVAL '1 hour'
      END                                                                AS period_end
    FROM court c
  ),
  generated_slots AS (
    SELECT
      GENERATE_SERIES(sb.period_start, sb.period_end, INTERVAL '1 hour') AS slot_start_at,
      sb.court_id
    FROM slot_bounds sb
  )
  SELECT
    gs.slot_start_at,
    gs.slot_start_at + INTERVAL '1 hour'                                 AS slot_end_at,
    CASE
      WHEN gs.slot_start_at + INTERVAL '1 hour' <= NOW() THEN 'past'
      WHEN bs.id IS NULL                                 THEN 'available'
      ELSE COALESCE(bs.status::TEXT, 'available')
    END                                                                  AS slot_state,
    b.id                                                                 AS booking_id,
    b.booking_code,
    b.full_name,
    b.payment_method,
    b.total_amount
  FROM generated_slots gs
  CROSS JOIN slot_bounds sb
  LEFT JOIN public.booking_slots bs
    ON  bs.court_id      = sb.court_id
    AND bs.slot_start_at = gs.slot_start_at
    AND bs.status IN ('pending', 'confirmed')
  LEFT JOIN public.bookings b
    ON b.id = bs.booking_id
  ORDER BY gs.slot_start_at;
$$;

-- 5. Recreate create_booking_request with total_amount (continuous-slot validation moved to TypeScript)
CREATE FUNCTION public.create_booking_request(
  p_court_id       uuid,
  p_booking_date   date,
  p_full_name      text,
  p_contact_number text,
  p_payment_method public.payment_method,
  p_slot_starts    timestamptz[]
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_court          public.courts%rowtype;
  v_booking        public.bookings%rowtype;
  v_booking_code   text;
  v_slot_count     INTEGER;
  v_total          INTEGER;
  v_is_overnight   BOOLEAN;
  v_slot_local_time TIME;
  v_slot_local_end  TIME;
BEGIN
  SELECT * INTO v_court FROM public.courts WHERE id = p_court_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Court not found'; END IF;
  IF NOT v_court.is_accepting_bookings THEN RAISE EXCEPTION 'Court is closed for bookings'; END IF;
  IF p_slot_starts IS NULL OR cardinality(p_slot_starts) = 0 THEN
    RAISE EXCEPTION 'At least one slot must be selected';
  END IF;

  -- Note: Validation for slots already ended, continuous selection, and court hours
  -- is now performed in TypeScript (src/services/bookings/booking-validator.ts)
  -- before calling this function. These checks remain as defense-in-depth.

  -- Reject slots that have already ended
  IF EXISTS (
    SELECT 1 FROM unnest(p_slot_starts) AS s(slot_start_at)
    WHERE s.slot_start_at + INTERVAL '1 hour' <= now()
  ) THEN
    RAISE EXCEPTION 'Selected slot has already ended';
  END IF;

  -- Enforce continuous (no-gap) selection
  IF (SELECT count(*) FROM unnest(p_slot_starts)) > 1 THEN
    IF EXISTS (
      SELECT 1
      FROM (
        SELECT slot_start_at,
               lead(slot_start_at) OVER (ORDER BY slot_start_at) AS next_slot_start
        FROM unnest(p_slot_starts) AS s(slot_start_at)
      ) ordered
      WHERE next_slot_start IS NOT NULL
        AND next_slot_start - slot_start_at > INTERVAL '1 hour'
    ) THEN
      RAISE EXCEPTION 'Slots must be continuous (consecutive hours without gaps)';
    END IF;
  END IF;

  v_is_overnight := v_court.open_time > v_court.close_time;

  FOR v_slot_local_time, v_slot_local_end IN
    SELECT
      (s.slot_start_at AT TIME ZONE v_court.timezone)::time,
      ((s.slot_start_at + INTERVAL '1 hour') AT TIME ZONE v_court.timezone)::time
    FROM unnest(p_slot_starts) AS s(slot_start_at)
  LOOP
    IF NOT v_is_overnight THEN
      IF v_slot_local_time < v_court.open_time OR v_slot_local_end > v_court.close_time THEN
        RAISE EXCEPTION 'Selected slot is outside court hours';
      END IF;
    ELSE
      IF v_slot_local_time < v_court.open_time AND v_slot_local_end > v_court.close_time THEN
        RAISE EXCEPTION 'Selected slot is outside court hours';
      END IF;
    END IF;
  END LOOP;

  SELECT count(*) INTO v_slot_count FROM unnest(p_slot_starts);
  v_total := v_slot_count * v_court.price_per_hour_cents;

  LOOP
    v_booking_code := public.generate_booking_code(p_contact_number);
    BEGIN
      INSERT INTO public.bookings (
        court_id, booking_code, booking_date, full_name, contact_number,
        payment_method, status, slot_count, price_per_hour_cents_snapshot, total_amount
      )
      VALUES (
        p_court_id, v_booking_code, p_booking_date, p_full_name, p_contact_number,
        p_payment_method, 'pending', v_slot_count, v_court.price_per_hour_cents, v_total
      )
      RETURNING * INTO v_booking;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF EXISTS (SELECT 1 FROM public.bookings WHERE booking_code = v_booking_code)
        THEN NULL; ELSE RAISE; END IF;
    END;
  END LOOP;

  INSERT INTO public.booking_slots (booking_id, court_id, booking_date, slot_start_at, slot_end_at, status)
  SELECT v_booking.id, p_court_id, p_booking_date,
         s.slot_start_at, s.slot_start_at + INTERVAL '1 hour', 'pending'
  FROM unnest(p_slot_starts) AS s(slot_start_at);

  RETURN QUERY SELECT * FROM public.bookings WHERE id = v_booking.id;
END;
$$;

-- 7. Recreate confirmed_bookings_public view with total_amount
CREATE OR REPLACE VIEW public.confirmed_bookings_public AS
SELECT
  b.id,
  b.court_id,
  c.slug  AS court_slug,
  c.name  AS court_name,
  b.booking_date,
  b.full_name,
  b.slot_count,
  b.total_amount,
  min(bs.slot_start_at) AS starts_at,
  max(bs.slot_end_at)   AS ends_at
FROM public.bookings b
JOIN public.courts c        ON c.id = b.court_id
JOIN public.booking_slots bs ON bs.booking_id = b.id
WHERE b.status = 'confirmed'
GROUP BY b.id, c.slug, c.name;

-- 8. Restore grants
GRANT EXECUTE ON FUNCTION public.get_day_availability(uuid, date)                                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]) TO anon, authenticated;
