-- Fix concurrent slot collision producing raw 500 error.
-- Rewrites create_booking_request to match the post-rename body from
-- 20260601000000 (total_cost_cents → total_amount, v_total_cost → v_total),
-- with the booking_slots INSERT wrapped in a BEGIN/EXCEPTION WHEN unique_violation
-- block that raises a P0001 with a user-readable message.

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

  -- ADDED: wrap booking_slots insert to convert concurrent slot collision into friendly P0001
  BEGIN
    INSERT INTO public.booking_slots (booking_id, court_id, booking_date, slot_start_at, slot_end_at, status)
    SELECT v_booking.id, p_court_id, p_booking_date,
           s.slot_start_at, s.slot_start_at + INTERVAL '1 hour', 'pending'
    FROM unnest(p_slot_starts) AS s(slot_start_at);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'One or more selected slots are no longer available';
  END;

  RETURN QUERY SELECT * FROM public.bookings WHERE id = v_booking.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]) TO anon;
GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]) TO authenticated;
