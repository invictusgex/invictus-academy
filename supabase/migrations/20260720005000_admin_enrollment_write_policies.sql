-- Invictus Trading Academy - admin enrollment write policies v1
-- Allows administrators to grant, revoke and reactivate enrollments.

do $$
begin
  if to_regclass('public.enrollments') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'enrollments'
        and policyname = 'enrollments_admin_insert'
    ) then
    create policy enrollments_admin_insert
      on public.enrollments
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
  if to_regclass('public.enrollments') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'enrollments'
        and policyname = 'enrollments_admin_update'
    ) then
    create policy enrollments_admin_update
      on public.enrollments
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
