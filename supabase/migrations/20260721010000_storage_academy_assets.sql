-- Invictus Trading Academy - academy assets storage infrastructure
-- Creates one private bucket and scoped Storage policies for future uploads.

insert into storage.buckets (id, name, public)
select 'academy-assets', 'academy-assets', false
where not exists (
  select 1
  from storage.buckets
  where id = 'academy-assets'
);

create policy academy_assets_enrolled_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.enrollments
      join public.products
        on products.id = enrollments.product_id
      where enrollments.profile_id = auth.uid()
        and products.slug = 'trading-basado-en-datos'
        and enrollments.status = 'active'
        and enrollments.revoked_at is null
        and enrollments.starts_at <= now()
        and (
          enrollments.expires_at is null
          or enrollments.expires_at > now()
        )
    )
  );

create policy academy_assets_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy academy_assets_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy academy_assets_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy academy_assets_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and (
      name like 'modules/thumbnails/%'
      or name like 'scenarios/thumbnails/%'
      or name like 'resources/pdf/%'
      or name like 'resources/docs/%'
      or name like 'resources/images/%'
    )
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
