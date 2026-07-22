-- Invictus Trading Academy - admin scenario write policies
-- Allows administrators to manage market scenarios. Students remain read-only.

do $$
begin
  if to_regclass('public.market_scenarios') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'market_scenarios'
        and policyname = 'market_scenarios_admin_insert'
    ) then
    create policy market_scenarios_admin_insert
      on public.market_scenarios
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
  if to_regclass('public.market_scenarios') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'market_scenarios'
        and policyname = 'market_scenarios_admin_update'
    ) then
    create policy market_scenarios_admin_update
      on public.market_scenarios
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
  if to_regclass('public.market_scenarios') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'market_scenarios'
        and policyname = 'market_scenarios_admin_delete'
    ) then
    create policy market_scenarios_admin_delete
      on public.market_scenarios
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
