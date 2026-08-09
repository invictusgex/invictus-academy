-- Invictus GEX - admin QA override for mentorship practice requirement.
-- Keeps the global 5 trading-day rule intact while allowing audited admin waivers.

create table if not exists public.academy_mentorship_requirement_overrides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  enrollment_id uuid not null,
  practice_requirement_waived_at timestamp with time zone not null default now(),
  practice_requirement_waived_by uuid not null references public.profiles(id),
  revoked_at timestamp with time zone,
  revoked_by uuid references public.profiles(id),
  reason text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_mentorship_requirement_overrides_enrollment_fkey
    foreign key (enrollment_id, profile_id, product_id)
    references public.enrollments(id, profile_id, product_id)
    on delete cascade,
  constraint academy_mentorship_requirement_overrides_revoke_check
    check (
      (revoked_at is null and revoked_by is null)
      or (revoked_at is not null and revoked_by is not null)
    )
);

create unique index if not exists academy_mentorship_requirement_overrides_scope_key
  on public.academy_mentorship_requirement_overrides (
    profile_id,
    product_id,
    enrollment_id
  );

create index if not exists academy_mentorship_requirement_overrides_active_idx
  on public.academy_mentorship_requirement_overrides (
    profile_id,
    product_id,
    enrollment_id
  )
  where revoked_at is null;

drop trigger if exists set_academy_mentorship_requirement_overrides_updated_at
  on public.academy_mentorship_requirement_overrides;
create trigger set_academy_mentorship_requirement_overrides_updated_at
before update on public.academy_mentorship_requirement_overrides
for each row
execute function public.set_updated_at();

alter table public.academy_mentorship_requirement_overrides
  enable row level security;

create policy academy_mentorship_requirement_overrides_admin_read_all
  on public.academy_mentorship_requirement_overrides
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_requirement_overrides_admin_insert
  on public.academy_mentorship_requirement_overrides
  for insert
  to authenticated
  with check (
    practice_requirement_waived_by = auth.uid()
    and exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_mentorship_requirement_overrides_admin_update
  on public.academy_mentorship_requirement_overrides
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

grant select, insert, update on table public.academy_mentorship_requirement_overrides
  to authenticated;

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
  v_practice_requirement_waived boolean := false;
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

  select exists (
    select 1
    from public.academy_mentorship_requirement_overrides requirement_override
    where requirement_override.profile_id = v_profile_id
      and requirement_override.product_id = v_enrollment.product_id
      and requirement_override.enrollment_id = v_enrollment.id
      and requirement_override.revoked_at is null
  )
  into v_practice_requirement_waived;

  if not (
    v_published_modules > 0
    and v_completed_modules = v_published_modules
    and v_submitted_required_forms >= v_required_forms
    and (
      v_registered_trading_days >= v_required_trading_days
      or v_practice_requirement_waived
    )
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
