-- Invictus Trading Academy - participant-visible mentorship outcomes
-- Keeps public participant closure separate from private mentor notes.

create table if not exists public.academy_mentorship_outcomes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.academy_mentorship_bookings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  enrollment_id uuid not null,
  summary text,
  next_steps text,
  resources text,
  shared_by uuid references public.profiles(id) on delete set null,
  shared_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_mentorship_outcomes_booking_key unique (booking_id),
  constraint academy_mentorship_outcomes_booking_scope_fkey
    foreign key (booking_id, profile_id, product_id, enrollment_id)
    references public.academy_mentorship_bookings(id, profile_id, product_id, enrollment_id)
    on delete cascade
);

create index if not exists academy_mentorship_outcomes_profile_product_idx
  on public.academy_mentorship_outcomes (profile_id, product_id);

create index if not exists academy_mentorship_outcomes_shared_idx
  on public.academy_mentorship_outcomes (profile_id, shared_at)
  where shared_at is not null;

drop trigger if exists set_academy_mentorship_outcomes_updated_at
  on public.academy_mentorship_outcomes;
create trigger set_academy_mentorship_outcomes_updated_at
before update on public.academy_mentorship_outcomes
for each row
execute function public.set_updated_at();

alter table public.academy_mentorship_outcomes enable row level security;

create policy academy_mentorship_outcomes_authenticated_read_own_shared
  on public.academy_mentorship_outcomes
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    and shared_at is not null
  );

create policy academy_mentorship_outcomes_admin_read_all
  on public.academy_mentorship_outcomes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_outcomes_admin_insert
  on public.academy_mentorship_outcomes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
    and (
      shared_by is null
      or shared_by = auth.uid()
    )
    and exists (
      select 1
      from public.academy_mentorship_bookings booking
      where booking.id = academy_mentorship_outcomes.booking_id
        and booking.profile_id = academy_mentorship_outcomes.profile_id
        and booking.product_id = academy_mentorship_outcomes.product_id
        and booking.enrollment_id = academy_mentorship_outcomes.enrollment_id
    )
  );

create policy academy_mentorship_outcomes_admin_update
  on public.academy_mentorship_outcomes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
    and (
      shared_by is null
      or shared_by = auth.uid()
    )
    and exists (
      select 1
      from public.academy_mentorship_bookings booking
      where booking.id = academy_mentorship_outcomes.booking_id
        and booking.profile_id = academy_mentorship_outcomes.profile_id
        and booking.product_id = academy_mentorship_outcomes.product_id
        and booking.enrollment_id = academy_mentorship_outcomes.enrollment_id
    )
  );
