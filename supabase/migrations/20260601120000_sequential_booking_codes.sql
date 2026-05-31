-- Switch booking codes to a global sequential format (e.g. "00042").
-- Adds phone-based lookup returning the earliest upcoming booking.

-- 1. Create sequence
CREATE SEQUENCE IF NOT EXISTS public.booking_code_seq START 1;

-- 2. Replace generate_booking_code — no longer needs phone arg
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lpad(nextval('public.booking_code_seq')::text, 5, '0');
END;
$$;

-- 3. Recreate create_booking_request using the new code generator
DROP FUNCTION IF EXISTS public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]);

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
  v_court           public.courts%rowtype;
  v_booking         public.bookings%rowtype;
  v_booking_code    text;
  v_slot_count      INTEGER;
  v_total           INTEGER;
  v_is_overnight    BOOLEAN;
  v_slot_local_time TIME;
  v_slot_local_end  TIME;
BEGIN
  SELECT * INTO v_court FROM public.courts WHERE id = p_court_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Court not found'; END IF;
  IF NOT v_court.is_accepting_bookings THEN RAISE EXCEPTION 'Court is closed for bookings'; END IF;
  IF p_slot_starts IS NULL OR cardinality(p_slot_starts) = 0 THEN
    RAISE EXCEPTION 'At least one slot must be selected';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_slot_starts) AS s(slot_start_at)
    WHERE s.slot_start_at + INTERVAL '1 hour' <= now()
  ) THEN
    RAISE EXCEPTION 'Selected slot has already ended';
  END IF;

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

  v_booking_code := public.generate_booking_code();

  INSERT INTO public.bookings (
    court_id, booking_code, booking_date, full_name, contact_number,
    payment_method, status, slot_count, price_per_hour_cents_snapshot, total_amount
  )
  VALUES (
    p_court_id, v_booking_code, p_booking_date, p_full_name, p_contact_number,
    p_payment_method, 'pending', v_slot_count, v_court.price_per_hour_cents, v_total
  )
  RETURNING * INTO v_booking;

  INSERT INTO public.booking_slots (booking_id, court_id, booking_date, slot_start_at, slot_end_at, status)
  SELECT v_booking.id, p_court_id, p_booking_date,
         s.slot_start_at, s.slot_start_at + INTERVAL '1 hour', 'pending'
  FROM unnest(p_slot_starts) AS s(slot_start_at);

  RETURN QUERY SELECT * FROM public.bookings WHERE id = v_booking.id;
END;
$$;

-- 4. Add phone-based lookup — returns soonest upcoming booking for a contact number
CREATE OR REPLACE FUNCTION public.lookup_booking_by_phone(p_contact_number text)
RETURNS TABLE (
  booking_id             uuid,
  booking_code           text,
  court_id               uuid,
  court_name             text,
  booking_date           date,
  full_name              text,
  contact_number         text,
  payment_method         public.payment_method,
  status                 public.booking_status,
  slot_count             integer,
  price_per_hour_cents   integer,
  total_amount           integer,
  reviewed_at            timestamptz,
  rejected_reason        text,
  created_at             timestamptz,
  updated_at             timestamptz,
  slots                  jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id                                    AS booking_id,
    b.booking_code,
    b.court_id,
    c.name                                  AS court_name,
    b.booking_date,
    b.full_name,
    b.contact_number,
    b.payment_method,
    b.status,
    b.slot_count,
    b.price_per_hour_cents_snapshot         AS price_per_hour_cents,
    b.total_amount,
    b.reviewed_at,
    b.rejected_reason,
    b.created_at,
    b.updated_at,
    COALESCE(
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'slot_start_at', bs.slot_start_at,
          'slot_end_at',   bs.slot_end_at,
          'status',        bs.status
        )
        ORDER BY bs.slot_start_at
      ) FILTER (WHERE bs.id IS NOT NULL),
      '[]'::jsonb
    )                                       AS slots
  FROM public.bookings b
  JOIN  public.courts c        ON c.id = b.court_id
  LEFT JOIN public.booking_slots bs ON bs.booking_id = b.id
  WHERE b.contact_number = p_contact_number
    AND b.booking_date  >= CURRENT_DATE
  GROUP BY b.id, c.id, c.name
  ORDER BY b.booking_date ASC
  LIMIT 1;
$$;

-- 5. Grants
GRANT EXECUTE ON FUNCTION public.generate_booking_code()                                                                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[])      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_booking_by_phone(text)                                                              TO anon, authenticated;
