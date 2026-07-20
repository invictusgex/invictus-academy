-- Invictus Trading Academy - database model v1
-- This migration prepares products, enrollments and module-level progress.
-- RLS remains intentionally deferred.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

update public.profiles
set role = 'student'
where role is null or role not in ('student', 'admin');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('student', 'admin'));
  end if;
end;
$$;

update public.products
set status = 'draft'
where status is null or status not in ('draft', 'active', 'archived');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_status_check
      check (status in ('draft', 'active', 'archived'));
  end if;
end;
$$;

create index if not exists products_status_idx
  on public.products (status);

alter table public.enrollments
  add column if not exists access_source text not null default 'manual',
  add column if not exists expires_at timestamp with time zone,
  add column if not exists revoked_at timestamp with time zone;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'enrollments'
      and column_name = 'ends_at'
  ) then
    execute '
      update public.enrollments
      set expires_at = ends_at
      where expires_at is null
    ';
  end if;
end;
$$;

update public.enrollments
set starts_at = created_at
where starts_at is null;

alter table public.enrollments
  alter column starts_at set default now();

alter table public.enrollments
  alter column starts_at set not null;

update public.enrollments
set status = case
  when status in ('active', 'revoked', 'expired') then status
  when status in ('inactive', 'cancelled') then 'revoked'
  else 'active'
end;

update public.enrollments
set access_source = case
  when access_source in ('manual', 'purchase', 'promotion') then access_source
  else 'manual'
end;

update public.enrollments
set revoked_at = coalesce(revoked_at, updated_at, now())
where status = 'revoked'
  and revoked_at is null;

update public.enrollments
set status = 'revoked'
where revoked_at is not null
  and status <> 'revoked';

update public.enrollments
set expires_at = starts_at + interval '1 second'
where expires_at is not null
  and expires_at <= starts_at;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'enrollments'
      and column_name = 'ends_at'
  ) then
    alter table public.enrollments
      drop column ends_at;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_status_check'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_status_check
      check (status in ('active', 'revoked', 'expired'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_access_source_check'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_access_source_check
      check (access_source in ('manual', 'purchase', 'promotion'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_expires_after_starts_check'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_expires_after_starts_check
      check (expires_at is null or expires_at > starts_at);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_revoked_at_status_check'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_revoked_at_status_check
      check (revoked_at is null or status = 'revoked');
  end if;
end;
$$;

create index if not exists enrollments_profile_id_status_idx
  on public.enrollments (profile_id, status);

create index if not exists enrollments_product_status_idx
  on public.enrollments (product_id, status);

create index if not exists enrollments_expires_at_idx
  on public.enrollments (expires_at);

do $$
begin
  if to_regclass('public.progress') is not null
    and to_regclass('public.module_progress') is null then
    alter table public.progress rename to module_progress;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'module_progress'
      and column_name = 'module_slug'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'module_progress'
      and column_name = 'module_key'
  ) then
    alter table public.module_progress
      rename column module_slug to module_key;
  end if;
end;
$$;

alter table public.module_progress
  add column if not exists progress_percent integer not null default 0,
  add column if not exists started_at timestamp with time zone,
  add column if not exists last_seen_at timestamp with time zone;

update public.module_progress
set status = case
  when status in ('not_started', 'in_progress', 'completed') then status
  when status = 'in-progress' then 'in_progress'
  else 'not_started'
end;

update public.module_progress
set progress_percent = case
  when status = 'completed' then 100
  when status = 'in_progress' and progress_percent = 0 then 50
  else progress_percent
end;

update public.module_progress
set status = 'completed',
  progress_percent = 100
where completed_at is not null;

update public.module_progress
set progress_percent = greatest(0, least(100, progress_percent));

update public.module_progress
set started_at = coalesce(started_at, created_at)
where status in ('in_progress', 'completed')
  and started_at is null;

update public.module_progress
set last_seen_at = coalesce(last_seen_at, updated_at, created_at)
where last_seen_at is null;

with module_rollup as (
  select
    profile_id,
    product_id,
    module_key,
    min(created_at) as created_at,
    max(updated_at) as updated_at,
    min(started_at) filter (where started_at is not null) as started_at,
    max(last_seen_at) filter (where last_seen_at is not null) as last_seen_at,
    max(completed_at) filter (where completed_at is not null) as completed_at,
    case
      when bool_or(status = 'completed') then 'completed'
      when bool_or(status = 'in_progress') then 'in_progress'
      else 'not_started'
    end as status,
    max(progress_percent) as progress_percent
  from public.module_progress
  group by profile_id, product_id, module_key
),
ranked_rows as (
  select
    id,
    row_number() over (
      partition by profile_id, product_id, module_key
      order by updated_at desc, created_at desc, id
    ) as row_number
  from public.module_progress
)
update public.module_progress target
set
  created_at = rollup.created_at,
  updated_at = rollup.updated_at,
  started_at = rollup.started_at,
  last_seen_at = rollup.last_seen_at,
  completed_at = rollup.completed_at,
  status = rollup.status,
  progress_percent = rollup.progress_percent
from module_rollup rollup,
  ranked_rows ranked
where target.id = ranked.id
  and ranked.row_number = 1
  and target.profile_id = rollup.profile_id
  and target.product_id = rollup.product_id
  and target.module_key = rollup.module_key;

with ranked_rows as (
  select
    id,
    row_number() over (
      partition by profile_id, product_id, module_key
      order by updated_at desc, created_at desc, id
    ) as row_number
  from public.module_progress
)
delete from public.module_progress target
using ranked_rows ranked
where target.id = ranked.id
  and ranked.row_number > 1;

alter table public.module_progress
  drop constraint if exists progress_profile_id_product_id_module_slug_lesson_slug_key;

alter table public.module_progress
  drop constraint if exists module_progress_profile_id_product_id_module_slug_lesson_slug_key;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'module_progress'
      and column_name = 'lesson_slug'
  ) then
    alter table public.module_progress
      drop column lesson_slug;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'module_progress_profile_product_module_key_key'
      and conrelid = 'public.module_progress'::regclass
  ) then
    alter table public.module_progress
      add constraint module_progress_profile_product_module_key_key
      unique (profile_id, product_id, module_key);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'module_progress_status_check'
      and conrelid = 'public.module_progress'::regclass
  ) then
    alter table public.module_progress
      add constraint module_progress_status_check
      check (status in ('not_started', 'in_progress', 'completed'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'module_progress_percent_check'
      and conrelid = 'public.module_progress'::regclass
  ) then
    alter table public.module_progress
      add constraint module_progress_percent_check
      check (progress_percent >= 0 and progress_percent <= 100);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'module_progress_completed_status_check'
      and conrelid = 'public.module_progress'::regclass
  ) then
    alter table public.module_progress
      add constraint module_progress_completed_status_check
      check (completed_at is null or status = 'completed');
  end if;
end;
$$;

create index if not exists module_progress_product_module_key_idx
  on public.module_progress (product_id, module_key);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_enrollments_updated_at on public.enrollments;
create trigger set_enrollments_updated_at
before update on public.enrollments
for each row
execute function public.set_updated_at();

drop trigger if exists set_module_progress_updated_at on public.module_progress;
create trigger set_module_progress_updated_at
before update on public.module_progress
for each row
execute function public.set_updated_at();
