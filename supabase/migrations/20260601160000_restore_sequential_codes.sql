-- Restore sequential booking codes (00042 format).
-- The 140000_fix_slot_collision_error migration incorrectly reverted to phone-suffix codes.
-- This migration drops the arg-based generate_booking_code(text) and restores sequential format.

-- 1. Drop the arg-based function that was incorrectly used in 140000 migration
DROP FUNCTION IF EXISTS public.generate_booking_code(text);

-- 2. Re-create create_booking_request to call the no-arg sequential generator
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

  -- Validate payment method is accepted by court
  IF p_payment_method = 'gcash' AND NOT v_court.accepts_gcash THEN
    RAISE EXCEPTION 'This court does not accept GCash payments';
  END IF;
  IF p_payment_method = 'cash' AND NOT v_court.accepts_cash THEN
    RAISE EXCEPTION 'This court does not accept cash payments';
  END IF;

  SELECT count(*) INTO v_slot_count FROM unnest(p_slot_starts);
  v_total := v_slot_count * v_court.price_per_hour_cents;

  -- Generate sequential booking code (e.g., "00042")
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

GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[])
  TO anon, authenticated;

-- Drop unused lookup functions (TS uses direct Drizzle queries)
DROP FUNCTION IF EXISTS public.lookup_booking_by_code(text);
DROP FUNCTION IF EXISTS public.lookup_booking_by_phone(text);
