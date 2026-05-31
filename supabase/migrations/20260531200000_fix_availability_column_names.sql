-- Fix column name mismatch in get_day_availability
-- Issue: Function returns first_name but bookings table uses full_name

CREATE OR REPLACE FUNCTION public.get_day_availability(p_court_id uuid, p_booking_date date)
RETURNS TABLE (
  slot_start_at timestamptz,
  slot_end_at timestamptz,
  slot_state text,
  booking_id uuid,
  booking_code text,
  full_name text,
  payment_method public.payment_method,
  total_cost_cents integer
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
      c.id AS court_id,
      c.price_per_hour_cents,
      (c.open_time > c.close_time) AS is_overnight,
      -- Start: open time on booking date, converted to UTC
      ((p_booking_date::TIMESTAMP + c.open_time)::TIMESTAMP AT TIME ZONE c.timezone) AS period_start,
      -- End: close time - 1 hour
      -- For overnight courts, close is on the NEXT day
      CASE
        WHEN c.open_time > c.close_time THEN
          -- Overnight: add 1 day to close time
          (((p_booking_date + INTERVAL '1 day')::TIMESTAMP + c.close_time)::TIMESTAMP AT TIME ZONE c.timezone) - INTERVAL '1 hour'
        ELSE
          -- Same day
          ((p_booking_date::TIMESTAMP + c.close_time)::TIMESTAMP AT TIME ZONE c.timezone) - INTERVAL '1 hour'
      END AS period_end
    FROM court c
  ),
  generated_slots AS (
    SELECT
      GENERATE_SERIES(
        sb.period_start,
        sb.period_end,
        INTERVAL '1 hour'
      ) AS slot_start_at,
      sb.court_id
    FROM slot_bounds sb
  )
  SELECT
    gs.slot_start_at,
    gs.slot_start_at + INTERVAL '1 hour' AS slot_end_at,
    CASE
      WHEN gs.slot_start_at + INTERVAL '1 hour' <= NOW() THEN 'past'
      WHEN bs.id IS NULL THEN 'available'
      ELSE COALESCE(bs.status::TEXT, 'available')
    END AS slot_state,
    b.id AS booking_id,
    b.booking_code,
    b.full_name,
    b.payment_method,
    b.total_cost_cents
  FROM generated_slots gs
  CROSS JOIN slot_bounds sb
  LEFT JOIN public.booking_slots bs
    ON bs.court_id = sb.court_id
   AND bs.slot_start_at = gs.slot_start_at
   AND bs.status IN ('pending', 'confirmed')
  LEFT JOIN public.bookings b
    ON b.id = bs.booking_id
  ORDER BY gs.slot_start_at;
$$;
