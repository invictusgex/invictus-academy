-- Invictus Trading Academy - reflection RLS alignment and module thumbnails
-- Keeps reflections tied to published modules, without requiring availability.

alter table public.academy_modules
  add column if not exists thumbnail_url text;

do $$
begin
  alter table public.academy_modules
    add constraint academy_modules_thumbnail_url_check
    check (
      thumbnail_url is null
      or thumbnail_url ~ '^https?://'
      or (
        thumbnail_url like 'modules/thumbnails/%'
        and thumbnail_url not like '%..%'
        and thumbnail_url not like '%//%'
        and thumbnail_url not like '/%'
        and thumbnail_url not like '%\%'
      )
    );
exception
  when duplicate_object then null;
end $$;

drop policy if exists academy_module_reflections_authenticated_insert_own
  on public.academy_module_reflections;

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

drop policy if exists academy_module_reflections_authenticated_update_own
  on public.academy_module_reflections;

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
