-- SafarGo starter schema for Supabase/PostgreSQL.
-- Review and test all policies before production deployment.

create extension if not exists pgcrypto;

create type public.app_role as enum ('traveler', 'agency', 'admin');
create type public.tour_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
create type public.booking_status as enum ('requested', 'confirmed', 'awaiting_payment', 'paid', 'cancelled', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'traveler',
  preferred_locale text not null default 'ru',
  created_at timestamptz not null default now()
);

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  legal_name text,
  registration_number text,
  description text,
  phone text not null,
  email text,
  website text,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete restrict,
  slug text not null unique,
  title text not null,
  country text not null,
  city text,
  departure_city text not null default 'Душанбе',
  category text not null default 'Экскурсионный',
  description text not null,
  duration_days integer not null check (duration_days between 1 and 365),
  hotel_name text,
  hotel_stars integer check (hotel_stars between 1 and 5),
  meal_plan text,
  price_tjs numeric(12,2) not null check (price_tjs >= 0),
  price_per text not null default 'person' check (price_per in ('person','package')),
  currency text not null default 'TJS' check (currency in ('TJS','USD','EUR')),
  departure_date date,
  return_date date,
  seats_available integer check (seats_available is null or seats_available >= 0),
  included_services text[] not null default '{}',
  excluded_services text[] not null default '{}',
  cancellation_terms text,
  image_urls text[] not null default '{}',
  status public.tour_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (return_date is null or departure_date is null or return_date >= departure_date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete restrict,
  traveler_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  travelers_count integer not null default 1 check (travelers_count between 1 and 30),
  requested_departure date,
  total_price_tjs numeric(12,2) not null check (total_price_tjs >= 0),
  status public.booking_status not null default 'requested',
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text,
  topic text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index tours_status_departure_idx on public.tours(status, departure_date);
create index tours_destination_idx on public.tours(country, city);
create index tours_price_idx on public.tours(price_tjs);
create index tours_agency_idx on public.tours(agency_id);
create index bookings_customer_phone_idx on public.bookings(customer_phone);
create index bookings_status_idx on public.bookings(status);

-- Helper function: role checks are server/database-side, not based on client-supplied metadata.
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.tours enable row level security;
alter table public.bookings enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.leads enable row level security;

create policy "profiles read own or admin" on public.profiles for select
using (id = auth.uid() or public.current_app_role() = 'admin');
create policy "profile update own" on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
-- Role changes must be performed by a trusted server/admin workflow, not a public client update.

create policy "published tours are public" on public.tours for select
using (status = 'published' or public.current_app_role() = 'admin' or
  exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid()));
create policy "agency creates own tours" on public.tours for insert
with check (exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid()));
create policy "agency updates own unpublished tours" on public.tours for update
using (exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid()) or public.current_app_role() = 'admin')
with check (exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid()) or public.current_app_role() = 'admin');

create policy "agency sees own agency and admin sees all" on public.agencies for select
using (owner_id = auth.uid() or public.current_app_role() = 'admin');
create policy "profile creates agency" on public.agencies for insert
with check (owner_id = auth.uid() and public.current_app_role() = 'agency');
create policy "agency owner updates own agency" on public.agencies for update
using (owner_id = auth.uid() or public.current_app_role() = 'admin')
with check (owner_id = auth.uid() or public.current_app_role() = 'admin');

-- Public users may submit a booking request, but should not read other people's requests.
create policy "traveler reads own bookings" on public.bookings for select
using (traveler_id = auth.uid() or public.current_app_role() = 'admin' or
  exists(select 1 from public.tours t join public.agencies a on a.id = t.agency_id
    where t.id = tour_id and a.owner_id = auth.uid()));
create policy "authenticated traveler creates own booking" on public.bookings for insert
with check (traveler_id = auth.uid() or (traveler_id is null and auth.uid() is null));
create policy "admin updates bookings" on public.bookings for update
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

-- Заявки пишутся только сервером (service role обходит RLS); читать и обрабатывать может только админ.
create policy "admin reads leads" on public.leads for select
using (public.current_app_role() = 'admin');
create policy "admin updates leads" on public.leads for update
using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

create policy "admin manages settings" on public.platform_settings for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
create policy "admin reads audit log" on public.audit_log for select
using (public.current_app_role() = 'admin');
create policy "admin writes audit log" on public.audit_log for insert
with check (public.current_app_role() = 'admin');

-- Production TODO:
-- 1) Implement trusted admin bootstrap procedure and prevent self-service role escalation.
-- 2) Add server-side booking creation with validated pricing and availability.
-- 3) Add agency policies for updating only permitted tour fields/status.
-- 4) Test all RLS policies with anonymous, traveler, agency and admin test accounts.
-- 5) Do not use service role key in browser code.
