-- Allow booking slots that have started but not yet ended
-- Example: at 10:23, the 10:00-11:00 slot is still bookable
-- Also fixes overnight court hours (e.g., 06:00-03:00 next day)

-- Patch create_booking_request function
create or replace function public.create_booking_request(
  p_court_id uuid,
  p_booking_date date,
  p_first_name text,
  p_contact_number text,
  p_payment_method public.payment_method,
  p_slot_starts timestamptz[]
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_court public.courts%rowtype;
  v_booking public.bookings%rowtype;
  v_booking_code text;
  v_slot_count integer;
  v_total_cost integer;
  v_is_overnight boolean;
begin
  select * into v_court
  from public.courts
  where id = p_court_id;

  if not found then
    raise exception 'Court not found';
  end if;

  if not v_court.is_accepting_bookings then
    raise exception 'Court is closed for bookings';
  end if;

  if p_slot_starts is null or cardinality(p_slot_starts) = 0 then
    raise exception 'At least one slot must be selected';
  end if;

  -- Check that no slot has already ended (slot_start + 1 hour <= now)
  -- This allows booking a slot that has started but not ended
  if exists (
    select 1
    from unnest(p_slot_starts) as s(slot_start_at)
    where s.slot_start_at + interval '1 hour' <= now()
  ) then
    raise exception 'Selected slot has already ended';
  end if;

  v_is_overnight := v_court.open_time > v_court.close_time;

  -- Validate slot is within court hours
  if exists (
    select 1
    from unnest(p_slot_starts) as s(slot_start_at)
    where (
      -- For same-day courts: slot must be >= open AND slot_end <= close
      (not v_is_overnight and (
        s.slot_start_at::time < v_court.open_time
        or (s.slot_start_at + interval '1 hour')::time > v_court.close_time
      ))
      or
      -- For overnight courts: slot must be >= open OR slot_end <= close
      (v_is_overnight and (
        (s.slot_start_at::time < v_court.open_time
         and (s.slot_start_at + interval '1 hour')::time > v_court.close_time)
      ))
    )
  ) then
    raise exception 'Selected slot is outside court hours';
  end if;

  select count(*) into v_slot_count
  from unnest(p_slot_starts) as s(slot_start_at);

  v_total_cost := v_slot_count * v_court.price_per_hour_cents;

  loop
    v_booking_code := public.generate_booking_code(p_contact_number);

    begin
      insert into public.bookings (
        court_id,
        booking_code,
        booking_date,
        first_name,
        contact_number,
        payment_method,
        status,
        slot_count,
        price_per_hour_cents_snapshot,
        total_cost_cents
      )
      values (
        p_court_id,
        v_booking_code,
        p_booking_date,
        p_first_name,
        p_contact_number,
        p_payment_method,
        'pending',
        v_slot_count,
        v_court.price_per_hour_cents,
        v_total_cost
      )
      returning * into v_booking;

      exit;
    exception
      when unique_violation then
        if exists (
          select 1
          from public.bookings
          where booking_code = v_booking_code
        ) then
          null;
        else
          raise;
        end if;
    end;
  end loop;

  insert into public.booking_slots (
    booking_id,
    court_id,
    booking_date,
    slot_start_at,
    slot_end_at,
    status
  )
  select
    v_booking.id,
    p_court_id,
    p_booking_date,
    s.slot_start_at,
    s.slot_start_at + interval '1 hour',
    'pending'
  from unnest(p_slot_starts) as s(slot_start_at);

  return query
    select *
    from public.bookings
    where id = v_booking.id;
end;
$$;

-- Patch get_day_availability function with overnight hours support
create or replace function public.get_day_availability(p_court_id uuid, p_booking_date date)
returns table (
  slot_start_at timestamptz,
  slot_end_at timestamptz,
  slot_state text,
  booking_id uuid,
  booking_code text,
  first_name text,
  payment_method public.payment_method,
  total_cost_cents integer
)
language sql
security definer
set search_path = public
as $$
  with court as (
    select * from public.courts where id = p_court_id
  ),
  slot_bounds as (
    select
      c.id as court_id,
      c.price_per_hour_cents,
      (c.open_time > c.close_time) as is_overnight,
      -- Start: open time on booking date, converted to UTC
      ((p_booking_date::timestamp + c.open_time)::timestamp at time zone c.timezone) as period_start,
      -- End: close time - 1 hour
      -- For overnight courts, close is on the NEXT day
      case
        when c.open_time > c.close_time then
          -- Overnight: add 1 day to close time
          (((p_booking_date + interval '1 day')::timestamp + c.close_time)::timestamp at time zone c.timezone) - interval '1 hour'
        else
          -- Same day
          ((p_booking_date::timestamp + c.close_time)::timestamp at time zone c.timezone) - interval '1 hour'
      end as period_end
    from court c
  ),
  generated_slots as (
    select
      generate_series(
        sb.period_start,
        sb.period_end,
        interval '1 hour'
      ) as slot_start_at,
      sb.court_id
    from slot_bounds sb
  )
  select
    gs.slot_start_at,
    gs.slot_start_at + interval '1 hour' as slot_end_at,
    case
      when gs.slot_start_at + interval '1 hour' <= now() then 'past'
      when bs.id is null then 'available'
      else coalesce(bs.status::text, 'available')
    end as slot_state,
    b.id as booking_id,
    b.booking_code,
    b.first_name,
    b.payment_method,
    b.total_cost_cents
  from generated_slots gs
  cross join slot_bounds sb
  left join public.booking_slots bs
    on bs.court_id = sb.court_id
   and bs.slot_start_at = gs.slot_start_at
   and bs.status in ('pending', 'confirmed')
  left join public.bookings b
    on b.id = bs.booking_id
  order by gs.slot_start_at;
$$;
