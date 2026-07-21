-- Invictus Trading Academy - admin content video write policies
-- Allows administrators to manage existing module video records.

do $$
begin
  if to_regclass('public.academy_module_videos') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'academy_module_videos'
        and policyname = 'academy_module_videos_admin_insert'
    ) then
    create policy academy_module_videos_admin_insert
      on public.academy_module_videos
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.academy_module_videos') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'academy_module_videos'
        and policyname = 'academy_module_videos_admin_update'
    ) then
    create policy academy_module_videos_admin_update
      on public.academy_module_videos
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.academy_module_videos') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'academy_module_videos'
        and policyname = 'academy_module_videos_admin_delete'
    ) then
    create policy academy_module_videos_admin_delete
      on public.academy_module_videos
      for delete
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;
