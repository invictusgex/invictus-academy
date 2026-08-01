-- Invictus Trading Academy - private mentorship notes
-- Adds admin-only preparation and closing notes for mentorship bookings.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'academy_mentorship_bookings_id_profile_product_enrollment_key'
      and conrelid = 'public.academy_mentorship_bookings'::regclass
  ) then
    alter table public.academy_mentorship_bookings
      add constraint academy_mentorship_bookings_id_profile_product_enrollment_key
      unique (id, profile_id, product_id, enrollment_id);
  end if;
end;
$$;

create table if not exists public.academy_mentorship_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.academy_mentorship_bookings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  enrollment_id uuid not null,
  preparation_notes text,
  concepts_to_reinforce text,
  session_conclusions text,
  next_steps text,
  resources_to_send text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_mentorship_notes_booking_key unique (booking_id),
  constraint academy_mentorship_notes_booking_scope_fkey
    foreign key (booking_id, profile_id, product_id, enrollment_id)
    references public.academy_mentorship_bookings(id, profile_id, product_id, enrollment_id)
    on delete cascade
);

create index if not exists academy_mentorship_notes_profile_product_idx
  on public.academy_mentorship_notes (profile_id, product_id);

create index if not exists academy_mentorship_notes_enrollment_idx
  on public.academy_mentorship_notes (enrollment_id);

drop trigger if exists set_academy_mentorship_notes_updated_at
  on public.academy_mentorship_notes;
create trigger set_academy_mentorship_notes_updated_at
before update on public.academy_mentorship_notes
for each row
execute function public.set_updated_at();

alter table public.academy_mentorship_notes enable row level security;

create policy academy_mentorship_notes_admin_read_all
  on public.academy_mentorship_notes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_notes_admin_insert
  on public.academy_mentorship_notes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.academy_mentorship_bookings booking
      where booking.id = academy_mentorship_notes.booking_id
        and booking.profile_id = academy_mentorship_notes.profile_id
        and booking.product_id = academy_mentorship_notes.product_id
        and booking.enrollment_id = academy_mentorship_notes.enrollment_id
    )
  );

create policy academy_mentorship_notes_admin_update
  on public.academy_mentorship_notes
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
    and exists (
      select 1
      from public.academy_mentorship_bookings booking
      where booking.id = academy_mentorship_notes.booking_id
        and booking.profile_id = academy_mentorship_notes.profile_id
        and booking.product_id = academy_mentorship_notes.product_id
        and booking.enrollment_id = academy_mentorship_notes.enrollment_id
    )
  );
