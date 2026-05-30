create extension if not exists "pgcrypto";

do $$
begin
  create type public.booking_status as enum ('pending', 'confirmed', 'rejected');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_method as enum ('gcash', 'cash');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  timezone text not null default 'Asia/Singapore',
  open_time time not null,
  close_time time not null,
  price_per_hour_cents integer not null check (price_per_hour_cents >= 0),
  currency_code text not null default 'PHP',
  is_accepting_bookings boolean not null default true,
  house_rules text not null default '',
  payment_instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courts_open_close_check check (open_time < close_time)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  booking_code text not null unique,
  booking_date date not null,
  first_name text not null,
  contact_number text not null,
  payment_method public.payment_method not null,
  status public.booking_status not null default 'pending',
  slot_count integer not null check (slot_count > 0),
  price_per_hour_cents_snapshot integer not null check (price_per_hour_cents_snapshot >= 0),
  total_cost_cents integer not null check (total_cost_cents >= 0),
  reviewer_id uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_slots (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  court_id uuid not null references public.courts (id) on delete cascade,
  booking_date date not null,
  slot_start_at timestamptz not null,
  slot_end_at timestamptz not null,
  status public.booking_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_slots_one_hour_check check (slot_end_at = slot_start_at + interval '1 hour')
);

create unique index if not exists booking_slots_unique_active_slot
  on public.booking_slots (court_id, slot_start_at)
  where status in ('pending', 'confirmed');

create index if not exists booking_slots_booking_id_idx
  on public.booking_slots (booking_id);

create index if not exists booking_slots_booking_date_idx
  on public.booking_slots (court_id, booking_date);

drop trigger if exists courts_set_updated_at on public.courts;
create trigger courts_set_updated_at
before update on public.courts
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists booking_slots_set_updated_at on public.booking_slots;
create trigger booking_slots_set_updated_at
before update on public.booking_slots
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.generate_booking_code(p_contact_number text)
returns text
language plpgsql
as $$
declare
  digits text;
  last_four text;
  suffix text;
begin
  digits := regexp_replace(coalesce(p_contact_number, ''), '\D', '', 'g');
  last_four := right(lpad(digits, 4, '0'), 4);
  suffix := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 3));
  return last_four || '-' || suffix;
end;
$$;

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

  if exists (
    select 1
    from unnest(p_slot_starts) as s(slot_start_at)
    where s.slot_start_at < now()
  ) then
    raise exception 'Past slots cannot be booked';
  end if;

  if exists (
    select 1
    from unnest(p_slot_starts) as s(slot_start_at)
    where s.slot_start_at::time < v_court.open_time
      or (s.slot_start_at + interval '1 hour')::time > v_court.close_time
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

create or replace function public.lookup_booking_by_code(p_booking_code text)
returns table (
  booking_id uuid,
  booking_code text,
  court_id uuid,
  court_name text,
  booking_date date,
  first_name text,
  contact_number text,
  payment_method public.payment_method,
  status public.booking_status,
  slot_count integer,
  price_per_hour_cents integer,
  total_cost_cents integer,
  reviewed_at timestamptz,
  rejected_reason text,
  created_at timestamptz,
  updated_at timestamptz,
  slots jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    b.id as booking_id,
    b.booking_code,
    b.court_id,
    c.name as court_name,
    b.booking_date,
    b.first_name,
    b.contact_number,
    b.payment_method,
    b.status,
    b.slot_count,
    b.price_per_hour_cents_snapshot as price_per_hour_cents,
    b.total_cost_cents,
    b.reviewed_at,
    b.rejected_reason,
    b.created_at,
    b.updated_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'slot_start_at', bs.slot_start_at,
          'slot_end_at', bs.slot_end_at,
          'status', bs.status
        )
        order by bs.slot_start_at
      ) filter (where bs.id is not null),
      '[]'::jsonb
    ) as slots
  from public.bookings b
  join public.courts c on c.id = b.court_id
  left join public.booking_slots bs on bs.booking_id = b.id
  where b.booking_code = p_booking_code
  group by b.id, c.id, c.name;
$$;

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
    select *
    from public.courts
    where id = p_court_id
  ),
  generated_slots as (
    select
      generate_series(
        (p_booking_date::timestamp + court.open_time) at time zone court.timezone,
        ((p_booking_date::timestamp + court.close_time) at time zone court.timezone) - interval '1 hour',
        interval '1 hour'
      ) as slot_start_at
    from court
  )
  select
    gs.slot_start_at,
    gs.slot_start_at + interval '1 hour' as slot_end_at,
    case
      when gs.slot_start_at < now() then 'past'
      when bs.id is null then 'available'
      else bs.status::text
    end as slot_state,
    b.id as booking_id,
    b.booking_code,
    b.first_name,
    b.payment_method,
    b.total_cost_cents
  from generated_slots gs
  left join public.booking_slots bs
    on bs.court_id = p_court_id
   and bs.slot_start_at = gs.slot_start_at
   and bs.status in ('pending', 'confirmed')
  left join public.bookings b
    on b.id = bs.booking_id
  order by gs.slot_start_at;
$$;

create or replace view public.confirmed_bookings_public as
select
  b.id,
  b.court_id,
  c.slug as court_slug,
  c.name as court_name,
  b.booking_date,
  b.first_name,
  b.slot_count,
  b.total_cost_cents,
  min(bs.slot_start_at) as starts_at,
  max(bs.slot_end_at) as ends_at
from public.bookings b
join public.courts c on c.id = b.court_id
join public.booking_slots bs on bs.booking_id = b.id
where b.status = 'confirmed'
group by b.id, c.slug, c.name;

alter table public.courts enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_slots enable row level security;

drop policy if exists "public can read courts" on public.courts;
create policy "public can read courts"
on public.courts
for select
using (true);

drop policy if exists "admins can manage courts" on public.courts;
create policy "admins can manage courts"
on public.courts
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
on public.profiles
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "admins can read bookings" on public.bookings;
create policy "admins can read bookings"
on public.bookings
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "admins can manage bookings" on public.bookings;
create policy "admins can manage bookings"
on public.bookings
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "admins can read booking slots" on public.booking_slots;
create policy "admins can read booking slots"
on public.booking_slots
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

drop policy if exists "admins can manage booking slots" on public.booking_slots;
create policy "admins can manage booking slots"
on public.booking_slots
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

revoke all on table public.bookings from anon, authenticated;
revoke all on table public.booking_slots from anon, authenticated;
grant select on table public.courts to anon, authenticated;
grant select on table public.confirmed_bookings_public to anon, authenticated;
grant execute on function public.create_booking_request(uuid, date, text, text, public.payment_method, timestamptz[]) to anon, authenticated;
grant execute on function public.lookup_booking_by_code(text) to anon, authenticated;
grant execute on function public.get_day_availability(uuid, date) to anon, authenticated;
grant execute on function public.generate_booking_code(text) to anon, authenticated;

insert into public.courts (
  slug,
  name,
  location,
  timezone,
  open_time,
  close_time,
  price_per_hour_cents,
  currency_code,
  is_accepting_bookings,
  house_rules,
  payment_instructions
)
values (
  'main',
  'Subdivision Pickleball Court',
  'Subdivision Court',
  'Asia/Singapore',
  '08:00',
  '21:00',
  15000,
  'PHP',
  true,
  'Please keep the court clean and respect the schedule.',
  'Pay via GCash or cash after admin confirmation.'
)
on conflict (slug) do nothing;
