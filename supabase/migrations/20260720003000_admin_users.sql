-- Invictus Trading Academy - admin users v1
-- Defines the minimal administrative authorization table and read-only client policy.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id)
);

alter table public.admin_users enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
      and policyname = 'admin_users_authenticated_read_own'
  ) then
    create policy admin_users_authenticated_read_own
      on public.admin_users
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end;
$$;
