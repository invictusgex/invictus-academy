-- Invictus Trading Academy - trading days tracking
-- Adds enrollment-bound trading day records for the student workflow.

create table if not exists public.academy_trading_days (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  enrollment_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  trading_date date not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_trading_days_enrollment_scope_fkey
    foreign key (enrollment_id, profile_id, product_id)
    references public.enrollments(id, profile_id, product_id)
    on delete cascade,
  constraint academy_trading_days_profile_product_date_key
    unique (profile_id, product_id, trading_date),
  constraint academy_trading_days_not_future_check check (
    trading_date <= current_date
  )
);

create index if not exists academy_trading_days_profile_product_idx
  on public.academy_trading_days (profile_id, product_id);

create index if not exists academy_trading_days_enrollment_idx
  on public.academy_trading_days (enrollment_id);

create index if not exists academy_trading_days_product_date_idx
  on public.academy_trading_days (product_id, trading_date);

drop trigger if exists set_academy_trading_days_updated_at
  on public.academy_trading_days;
create trigger set_academy_trading_days_updated_at
before update on public.academy_trading_days
for each row
execute function public.set_updated_at();

alter table public.academy_trading_days enable row level security;

create policy academy_trading_days_authenticated_read_own
  on public.academy_trading_days
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy academy_trading_days_authenticated_insert_own
  on public.academy_trading_days
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and trading_date <= current_date
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_trading_days.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_trading_days.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_trading_days_authenticated_update_own
  on public.academy_trading_days
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and trading_date <= current_date
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_trading_days.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_trading_days.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_trading_days_authenticated_delete_own
  on public.academy_trading_days
  for delete
  to authenticated
  using (profile_id = auth.uid());

create policy academy_trading_days_admin_read_all
  on public.academy_trading_days
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );
