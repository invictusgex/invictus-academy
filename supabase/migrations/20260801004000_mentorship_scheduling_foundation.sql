-- Invictus Trading Academy - mentorship scheduling foundation
-- Adds mentor availability slots, student bookings, and transactional RPCs.

create table if not exists public.academy_mentorship_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  timezone text not null,
  status text not null default 'available',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_mentorship_slots_status_check
    check (status in ('available', 'booked', 'blocked', 'cancelled')),
  constraint academy_mentorship_slots_time_check
    check (ends_at > starts_at),
  constraint academy_mentorship_slots_unique_time_key
    unique (starts_at, ends_at)
);

create table if not exists public.academy_mentorship_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.academy_mentorship_slots(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  enrollment_id uuid not null,
  status text not null default 'confirmed',
  participant_timezone text not null,
  participant_note text,
  booked_at timestamp with time zone not null default now(),
  cancelled_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_mentorship_bookings_status_check
    check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),
  constraint academy_mentorship_bookings_participant_timezone_check
    check (length(trim(participant_timezone)) > 0),
  constraint academy_mentorship_bookings_enrollment_scope_fkey
    foreign key (enrollment_id, profile_id, product_id)
    references public.enrollments(id, profile_id, product_id)
    on delete cascade,
  constraint academy_mentorship_bookings_cancelled_at_check
    check (
      (status = 'cancelled' and cancelled_at is not null)
      or (status <> 'cancelled')
    ),
  constraint academy_mentorship_bookings_completed_at_check
    check (
      (status = 'completed' and completed_at is not null)
      or (status <> 'completed')
    )
);

create unique index if not exists academy_mentorship_bookings_active_slot_key
  on public.academy_mentorship_bookings (slot_id)
  where status = 'confirmed';

create index if not exists academy_mentorship_slots_status_starts_idx
  on public.academy_mentorship_slots (status, starts_at);

create index if not exists academy_mentorship_bookings_profile_status_idx
  on public.academy_mentorship_bookings (profile_id, status);

create index if not exists academy_mentorship_bookings_enrollment_idx
  on public.academy_mentorship_bookings (enrollment_id);

drop trigger if exists set_academy_mentorship_slots_updated_at
  on public.academy_mentorship_slots;
create trigger set_academy_mentorship_slots_updated_at
before update on public.academy_mentorship_slots
for each row
execute function public.set_updated_at();

drop trigger if exists set_academy_mentorship_bookings_updated_at
  on public.academy_mentorship_bookings;
create trigger set_academy_mentorship_bookings_updated_at
before update on public.academy_mentorship_bookings
for each row
execute function public.set_updated_at();

alter table public.academy_mentorship_slots enable row level security;
alter table public.academy_mentorship_bookings enable row level security;

create policy academy_mentorship_slots_authenticated_read_available_future
  on public.academy_mentorship_slots
  for select
  to authenticated
  using (
    status = 'available'
    and starts_at > now()
  );

create policy academy_mentorship_slots_admin_read_all
  on public.academy_mentorship_slots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_slots_admin_insert
  on public.academy_mentorship_slots
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and starts_at > now()
    and exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_slots_admin_update
  on public.academy_mentorship_slots
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
  );

create policy academy_mentorship_slots_admin_delete
  on public.academy_mentorship_slots
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_bookings_authenticated_read_own
  on public.academy_mentorship_bookings
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy academy_mentorship_bookings_admin_read_all
  on public.academy_mentorship_bookings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_bookings_admin_insert
  on public.academy_mentorship_bookings
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_bookings_admin_update
  on public.academy_mentorship_bookings
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
  );

create policy academy_mentorship_bookings_admin_delete
  on public.academy_mentorship_bookings
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create or replace function public.book_mentorship_slot(
  p_slot_id uuid,
  p_participant_timezone text,
  p_note text default null
)
returns public.academy_mentorship_bookings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_now timestamp with time zone := now();
  v_slot public.academy_mentorship_slots%rowtype;
  v_enrollment public.enrollments%rowtype;
  v_existing_booking public.academy_mentorship_bookings%rowtype;
  v_booking public.academy_mentorship_bookings%rowtype;
  v_required_forms integer := 0;
  v_submitted_required_forms integer := 0;
  v_required_trading_days integer := 5;
  v_registered_trading_days integer := 0;
  v_published_modules integer := 0;
  v_completed_modules integer := 0;
begin
  if v_profile_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if p_slot_id is null then
    raise exception using errcode = 'P0001', message = 'SLOT_REQUIRED';
  end if;

  if nullif(trim(p_participant_timezone), '') is null then
    raise exception using errcode = 'P0001', message = 'PARTICIPANT_TIMEZONE_REQUIRED';
  end if;

  select *
  into v_slot
  from public.academy_mentorship_slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'SLOT_NOT_FOUND';
  end if;

  select booking.*
  into v_existing_booking
  from public.academy_mentorship_bookings booking
  where booking.slot_id = p_slot_id
    and booking.profile_id = v_profile_id
    and booking.status = 'confirmed'
  limit 1;

  if found then
    return v_existing_booking;
  end if;

  if v_slot.status <> 'available' or v_slot.starts_at <= v_now then
    raise exception using errcode = 'P0001', message = 'SLOT_NOT_AVAILABLE';
  end if;

  if exists (
    select 1
    from public.academy_mentorship_bookings booking
    where booking.slot_id = p_slot_id
      and booking.status = 'confirmed'
  ) then
    raise exception using errcode = 'P0001', message = 'SLOT_ALREADY_BOOKED';
  end if;

  select enrollment.*
  into v_enrollment
  from public.enrollments enrollment
  join public.products product
    on product.id = enrollment.product_id
  where enrollment.profile_id = v_profile_id
    and enrollment.status = 'active'
    and enrollment.revoked_at is null
    and enrollment.starts_at <= v_now
    and (
      enrollment.expires_at is null
      or enrollment.expires_at > v_now
    )
    and product.status = 'active'
  order by enrollment.starts_at desc
  limit 1;

  if not found then
    raise exception using errcode = 'P0001', message = 'ACTIVE_ENROLLMENT_REQUIRED';
  end if;

  select count(*)
  into v_published_modules
  from public.academy_modules academy_module
  where academy_module.product_id = v_enrollment.product_id
    and academy_module.status = 'published'
    and academy_module.availability = 'available';

  select count(*)
  into v_completed_modules
  from public.academy_modules academy_module
  where academy_module.product_id = v_enrollment.product_id
    and academy_module.status = 'published'
    and academy_module.availability = 'available'
    and exists (
      select 1
      from public.module_progress progress
      where progress.profile_id = v_profile_id
        and progress.product_id = v_enrollment.product_id
        and progress.module_key = academy_module.module_key
        and (
          progress.status = 'completed'
          or progress.progress_percent = 100
          or progress.completed_at is not null
        )
    );

  select count(*)
  into v_required_forms
  from public.academy_form_definitions form_definition
  where form_definition.product_id = v_enrollment.product_id
    and form_definition.status = 'published'
    and form_definition.is_required = true;

  select count(distinct submission.form_definition_id)
  into v_submitted_required_forms
  from public.academy_form_submissions submission
  join public.academy_form_definitions form_definition
    on form_definition.id = submission.form_definition_id
  where submission.profile_id = v_profile_id
    and submission.product_id = v_enrollment.product_id
    and submission.enrollment_id = v_enrollment.id
    and form_definition.status = 'published'
    and form_definition.is_required = true;

  select count(distinct trading_day.trading_date)
  into v_registered_trading_days
  from public.academy_trading_days trading_day
  where trading_day.profile_id = v_profile_id
    and trading_day.product_id = v_enrollment.product_id
    and trading_day.enrollment_id = v_enrollment.id;

  if not (
    v_published_modules > 0
    and v_completed_modules = v_published_modules
    and v_submitted_required_forms >= v_required_forms
    and v_registered_trading_days >= v_required_trading_days
  ) then
    raise exception using errcode = 'P0001', message = 'MENTORSHIP_REQUIREMENTS_NOT_MET';
  end if;

  insert into public.academy_mentorship_bookings (
    slot_id,
    profile_id,
    product_id,
    enrollment_id,
    status,
    participant_timezone,
    participant_note,
    booked_at
  )
  values (
    v_slot.id,
    v_profile_id,
    v_enrollment.product_id,
    v_enrollment.id,
    'confirmed',
    trim(p_participant_timezone),
    nullif(trim(p_note), ''),
    v_now
  )
  returning *
  into v_booking;

  update public.academy_mentorship_slots
  set status = 'booked'
  where id = v_slot.id;

  return v_booking;
end;
$$;

create or replace function public.cancel_mentorship_booking(
  p_booking_id uuid
)
returns public.academy_mentorship_bookings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_now timestamp with time zone := now();
  v_booking public.academy_mentorship_bookings%rowtype;
  v_slot public.academy_mentorship_slots%rowtype;
begin
  if v_profile_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if p_booking_id is null then
    raise exception using errcode = 'P0001', message = 'BOOKING_REQUIRED';
  end if;

  select booking.*
  into v_booking
  from public.academy_mentorship_bookings booking
  where booking.id = p_booking_id
    and booking.profile_id = v_profile_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.status = 'completed' then
    raise exception using errcode = 'P0001', message = 'BOOKING_COMPLETED';
  end if;

  if v_booking.status = 'cancelled' then
    return v_booking;
  end if;

  select *
  into v_slot
  from public.academy_mentorship_slots
  where id = v_booking.slot_id
  for update;

  update public.academy_mentorship_bookings
  set
    status = 'cancelled',
    cancelled_at = v_now
  where id = v_booking.id
  returning *
  into v_booking;

  if found and v_slot.starts_at > v_now then
    update public.academy_mentorship_slots
    set status = 'available'
    where id = v_slot.id;
  end if;

  return v_booking;
end;
$$;

revoke all on function public.book_mentorship_slot(uuid, text, text) from public;
revoke all on function public.book_mentorship_slot(uuid, text, text) from anon;
revoke all on function public.book_mentorship_slot(uuid, text, text) from authenticated;
grant execute on function public.book_mentorship_slot(uuid, text, text) to authenticated;

revoke all on function public.cancel_mentorship_booking(uuid) from public;
revoke all on function public.cancel_mentorship_booking(uuid) from anon;
revoke all on function public.cancel_mentorship_booking(uuid) from authenticated;
grant execute on function public.cancel_mentorship_booking(uuid) to authenticated;
