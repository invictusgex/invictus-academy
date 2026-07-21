-- Invictus Trading Academy - admin content module update policy
-- Allows administrators to update existing academy module general information.

do $$
begin
  if to_regclass('public.academy_modules') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'academy_modules'
        and policyname = 'academy_modules_admin_update'
    ) then
    create policy academy_modules_admin_update
      on public.academy_modules
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
