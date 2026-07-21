-- Invictus Trading Academy - admin read policies v1
-- Read-only access for administrators. Do not execute from the client app.

do $$
begin
  if to_regclass('public.products') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'products'
        and policyname = 'products_admin_read'
    ) then
    create policy products_admin_read
      on public.products
      for select
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

do $$
begin
  if to_regclass('public.profiles') is not null
    and not exists (
      select 1
      from pg_class table_class
      join pg_namespace table_namespace
        on table_namespace.oid = table_class.relnamespace
      where table_namespace.nspname = 'public'
        and table_class.relname = 'profiles'
        and table_class.relrowsecurity
    ) then
    alter table public.profiles enable row level security;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.profiles') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'profiles'
        and policyname = 'profiles_admin_read'
    ) then
    create policy profiles_admin_read
      on public.profiles
      for select
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

do $$
begin
  if to_regclass('public.enrollments') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'enrollments'
        and policyname = 'enrollments_admin_read'
    ) then
    create policy enrollments_admin_read
      on public.enrollments
      for select
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

do $$
begin
  if to_regclass('public.module_progress') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'module_progress'
        and policyname = 'module_progress_admin_read'
    ) then
    create policy module_progress_admin_read
      on public.module_progress
      for select
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
