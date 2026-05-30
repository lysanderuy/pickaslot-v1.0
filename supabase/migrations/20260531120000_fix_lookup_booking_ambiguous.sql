-- Fix ambiguous booking_code reference in lookup_booking_by_code.
-- OUT parameters share names with bookings columns; qualify the table column.
-- Must drop first: CREATE OR REPLACE cannot change OUT parameter types (e.g. date vs text).

drop function if exists public.lookup_booking_by_code(text);

create function public.lookup_booking_by_code(p_booking_code text)
returns table (
  booking_code text,
  full_name text,
  status text,
  payment_method public.payment_method,
  price_per_hour_cents integer,
  total_cost_cents integer,
  booking_date date,
  slots json
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  select *
  into v_booking
  from public.bookings b
  where b.booking_code = p_booking_code;

  if not found then
    return;
  end if;

  booking_code := v_booking.booking_code;
  full_name := v_booking.full_name;
  status := v_booking.status::text;
  payment_method := v_booking.payment_method;
  price_per_hour_cents := v_booking.price_per_hour_cents_snapshot;
  total_cost_cents := v_booking.total_cost_cents;
  booking_date := v_booking.booking_date;

  select coalesce(
    json_agg(
      json_build_object(
        'slot_start_at', bs.slot_start_at,
        'slot_end_at', bs.slot_end_at
      )
      order by bs.slot_start_at
    ),
    '[]'::json
  )
  into slots
  from public.booking_slots bs
  where bs.booking_id = v_booking.id;

  return next;
end;
$$;

grant execute on function public.lookup_booking_by_code(text) to anon, authenticated;
