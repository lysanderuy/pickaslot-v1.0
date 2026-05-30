-- Fix column alias in unnest() calls
-- Issue: unnest(array) without explicit column naming causes "column does not exist" error
-- The latest migration used `unnest(p_slot_starts) s` but referenced `s.slot_start_at`
-- Correct syntax: `unnest(p_slot_starts) as s(slot_start_at)`

DROP FUNCTION IF EXISTS public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]);

CREATE FUNCTION public.create_booking_request(
  p_court_id uuid,
  p_booking_date date,
  p_full_name text,
  p_contact_number text,
  p_payment_method public.payment_method,
  p_slot_starts timestamptz[]
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_court public.courts%rowtype;
  v_booking public.bookings%rowtype;
  v_booking_code text;
  v_slot_count INTEGER;
  v_total_cost INTEGER;
  v_is_overnight BOOLEAN;
  v_slot_local_time TIME;
  v_slot_local_end TIME;
BEGIN
  SELECT * INTO v_court FROM public.courts WHERE id = p_court_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Court not found'; END IF;
  IF NOT v_court.is_accepting_bookings THEN RAISE EXCEPTION 'Court is closed for bookings'; END IF;
  IF p_slot_starts IS NULL OR cardinality(p_slot_starts) = 0 THEN RAISE EXCEPTION 'At least one slot must be selected'; END IF;

  -- Check that no slot has already ended (slot_start + 1 hour <= now)
  -- Fixed: use explicit column alias in unnest()
  IF EXISTS (SELECT 1 FROM unnest(p_slot_starts) AS s(slot_start_at) WHERE s.slot_start_at + interval '1 hour' <= now()) THEN
    RAISE EXCEPTION 'Selected slot has already ended';
  END IF;

  v_is_overnight := v_court.open_time > v_court.close_time;

  -- Validate slot is within court hours with timezone conversion
  FOR v_slot_local_time, v_slot_local_end IN
    SELECT
      (s.slot_start_at AT TIME ZONE 'UTC' AT TIME ZONE v_court.timezone)::time,
      ((s.slot_start_at + interval '1 hour') AT TIME ZONE 'UTC' AT TIME ZONE v_court.timezone)::time
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
  v_total_cost := v_slot_count * v_court.price_per_hour_cents;

  LOOP
    v_booking_code := public.generate_booking_code(p_contact_number);
    BEGIN
      INSERT INTO public.bookings (court_id, booking_code, booking_date, full_name, contact_number, payment_method, status, slot_count, price_per_hour_cents_snapshot, total_cost_cents)
      VALUES (p_court_id, v_booking_code, p_booking_date, p_full_name, p_contact_number, p_payment_method, 'pending', v_slot_count, v_court.price_per_hour_cents, v_total_cost)
      RETURNING * INTO v_booking;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF EXISTS (SELECT 1 FROM public.bookings WHERE booking_code = v_booking_code) THEN NULL; ELSE RAISE; END IF;
    END;
  END LOOP;

  INSERT INTO public.booking_slots (booking_id, court_id, booking_date, slot_start_at, slot_end_at, status)
  SELECT v_booking.id, p_court_id, p_booking_date, s.slot_start_at, s.slot_start_at + interval '1 hour', 'pending' FROM unnest(p_slot_starts) AS s(slot_start_at);

  RETURN QUERY SELECT * FROM public.bookings WHERE id = v_booking.id;
END;
$$;
