-- Invictus Trading Academy - restrict academy content read policies
-- Published academy content must be readable only by enrolled students or admins.

drop policy if exists academy_modules_read_published
  on public.academy_modules;

create policy academy_modules_enrolled_read_published
  on public.academy_modules
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.enrollments
      where enrollments.profile_id = auth.uid()
        and enrollments.product_id = academy_modules.product_id
        and enrollments.status = 'active'
        and enrollments.revoked_at is null
        and enrollments.starts_at <= now()
        and (
          enrollments.expires_at is null
          or enrollments.expires_at > now()
        )
    )
  );

drop policy if exists academy_module_videos_read_published
  on public.academy_module_videos;

create policy academy_module_videos_enrolled_read_published
  on public.academy_module_videos
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.enrollments
        on enrollments.product_id = academy_module.product_id
      where academy_module.id = academy_module_videos.module_id
        and academy_module.status = 'published'
        and enrollments.profile_id = auth.uid()
        and enrollments.status = 'active'
        and enrollments.revoked_at is null
        and enrollments.starts_at <= now()
        and (
          enrollments.expires_at is null
          or enrollments.expires_at > now()
        )
    )
  );

drop policy if exists academy_resources_read_published
  on public.academy_resources;

create policy academy_resources_enrolled_read_published
  on public.academy_resources
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.enrollments
        on enrollments.product_id = academy_module.product_id
      where academy_module.id = academy_resources.module_id
        and academy_module.status = 'published'
        and enrollments.profile_id = auth.uid()
        and enrollments.status = 'active'
        and enrollments.revoked_at is null
        and enrollments.starts_at <= now()
        and (
          enrollments.expires_at is null
          or enrollments.expires_at > now()
        )
    )
  );
