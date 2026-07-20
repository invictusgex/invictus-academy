-- Invictus Trading Academy - RLS policies v1
-- This migration enables the minimum authenticated access needed by the app.

do $$
begin
  if to_regclass('public.products') is not null
    and not exists (
      select 1
      from pg_class table_class
      join pg_namespace table_namespace
        on table_namespace.oid = table_class.relnamespace
      where table_namespace.nspname = 'public'
        and table_class.relname = 'products'
        and table_class.relrowsecurity
    ) then
    alter table public.products enable row level security;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.enrollments') is not null
    and not exists (
      select 1
      from pg_class table_class
      join pg_namespace table_namespace
        on table_namespace.oid = table_class.relnamespace
      where table_namespace.nspname = 'public'
        and table_class.relname = 'enrollments'
        and table_class.relrowsecurity
    ) then
    alter table public.enrollments enable row level security;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.module_progress') is not null
    and not exists (
      select 1
      from pg_class table_class
      join pg_namespace table_namespace
        on table_namespace.oid = table_class.relnamespace
      where table_namespace.nspname = 'public'
        and table_class.relname = 'module_progress'
        and table_class.relrowsecurity
    ) then
    alter table public.module_progress enable row level security;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.products') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'products'
        and policyname = 'products_authenticated_read_active'
    ) then
    create policy products_authenticated_read_active
      on public.products
      for select
      to authenticated
      using (status = 'active');
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
        and policyname = 'enrollments_authenticated_read_own'
    ) then
    create policy enrollments_authenticated_read_own
      on public.enrollments
      for select
      to authenticated
      using (profile_id = auth.uid());
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
        and policyname = 'module_progress_authenticated_read_own'
    ) then
    create policy module_progress_authenticated_read_own
      on public.module_progress
      for select
      to authenticated
      using (profile_id = auth.uid());
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
        and policyname = 'module_progress_authenticated_update_own'
    ) then
    create policy module_progress_authenticated_update_own
      on public.module_progress
      for update
      to authenticated
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end;
$$;
