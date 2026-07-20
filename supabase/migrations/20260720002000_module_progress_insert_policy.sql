-- Invictus Trading Academy - module_progress insert policy
-- Required for client-side upsert of a user's own module progress.

do $$
begin
  if to_regclass('public.module_progress') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'module_progress'
        and policyname = 'module_progress_authenticated_insert_own'
    ) then
    create policy module_progress_authenticated_insert_own
      on public.module_progress
      for insert
      to authenticated
      with check (profile_id = auth.uid());
  end if;
end;
$$;
