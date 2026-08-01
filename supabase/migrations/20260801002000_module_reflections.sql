-- Invictus Trading Academy - free module reflections
-- Stores one editable reflection per participant, product, module and enrollment.

create table if not exists public.academy_module_reflections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  module_key text not null,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  content text not null default '',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_module_reflections_content_length_check
    check (char_length(content) <= 12000),
  constraint academy_module_reflections_profile_product_module_enrollment_key
    unique (profile_id, product_id, module_key, enrollment_id),
  constraint academy_module_reflections_module_scope_fkey
    foreign key (product_id, module_key)
    references public.academy_modules (product_id, module_key)
    on delete cascade
);

create index if not exists academy_module_reflections_profile_product_idx
  on public.academy_module_reflections (profile_id, product_id);

create index if not exists academy_module_reflections_enrollment_idx
  on public.academy_module_reflections (enrollment_id);

create index if not exists academy_module_reflections_product_module_idx
  on public.academy_module_reflections (product_id, module_key);

drop trigger if exists set_academy_module_reflections_updated_at
  on public.academy_module_reflections;

create trigger set_academy_module_reflections_updated_at
before update on public.academy_module_reflections
for each row
execute function public.set_updated_at();

alter table public.academy_module_reflections enable row level security;

revoke all privileges on table public.academy_module_reflections
  from anon, authenticated;

grant select, insert, update on table public.academy_module_reflections
  to authenticated;

grant select, insert, update, delete on table public.academy_module_reflections
  to service_role;

create policy academy_module_reflections_authenticated_read_own
  on public.academy_module_reflections
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy academy_module_reflections_authenticated_insert_own
  on public.academy_module_reflections
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.products product
        on product.id = academy_module.product_id
      where academy_module.product_id = academy_module_reflections.product_id
        and academy_module.module_key = academy_module_reflections.module_key
        and academy_module.status = 'published'
        and academy_module.availability = 'available'
        and product.status = 'active'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_module_reflections.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.profile_id = academy_module_reflections.profile_id
        and enrollment.product_id = academy_module_reflections.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_module_reflections_authenticated_update_own
  on public.academy_module_reflections
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.products product
        on product.id = academy_module.product_id
      where academy_module.product_id = academy_module_reflections.product_id
        and academy_module.module_key = academy_module_reflections.module_key
        and academy_module.status = 'published'
        and academy_module.availability = 'available'
        and product.status = 'active'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_module_reflections.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.profile_id = academy_module_reflections.profile_id
        and enrollment.product_id = academy_module_reflections.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_module_reflections_admin_read_all
  on public.academy_module_reflections
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );
