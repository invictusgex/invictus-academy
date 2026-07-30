-- Invictus Trading Academy - module progress persistence hardening
-- Keeps progress module-based and validates writes against published modules
-- and active enrollments.

drop policy if exists module_progress_authenticated_insert_own
  on public.module_progress;

drop policy if exists module_progress_authenticated_update_own
  on public.module_progress;

create policy module_progress_authenticated_insert_own
  on public.module_progress
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.products product
        on product.id = academy_module.product_id
      where academy_module.product_id = module_progress.product_id
        and academy_module.module_key = module_progress.module_key
        and academy_module.status = 'published'
        and academy_module.availability = 'available'
        and product.status = 'active'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.profile_id = auth.uid()
        and enrollment.product_id = module_progress.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy module_progress_authenticated_update_own
  on public.module_progress
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_modules academy_module
      join public.products product
        on product.id = academy_module.product_id
      where academy_module.product_id = module_progress.product_id
        and academy_module.module_key = module_progress.module_key
        and academy_module.status = 'published'
        and academy_module.availability = 'available'
        and product.status = 'active'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.profile_id = auth.uid()
        and enrollment.product_id = module_progress.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'module_progress'
      and policyname = 'module_progress_admin_read_all'
  ) then
    create policy module_progress_admin_read_all
      on public.module_progress
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users admin_user
          where admin_user.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

create or replace function public.mark_module_completed(
  p_product_slug text,
  p_module_key text
)
returns public.module_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_module public.academy_modules%rowtype;
  v_now timestamptz := now();
  v_profile_id uuid := auth.uid();
  v_progress public.module_progress%rowtype;
begin
  if v_profile_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHENTICATED';
  end if;

  if nullif(trim(p_product_slug), '') is null then
    raise exception using errcode = 'P0001', message = 'PRODUCT_SLUG_REQUIRED';
  end if;

  if nullif(trim(p_module_key), '') is null then
    raise exception using errcode = 'P0001', message = 'MODULE_KEY_REQUIRED';
  end if;

  select academy_module.*
  into v_module
  from public.academy_modules academy_module
  join public.products product
    on product.id = academy_module.product_id
  where product.slug = p_product_slug
    and product.status = 'active'
    and academy_module.module_key = p_module_key
    and academy_module.status = 'published'
    and academy_module.availability = 'available'
  limit 1;

  if not found then
    raise exception using errcode = 'P0001', message = 'MODULE_NOT_AVAILABLE';
  end if;

  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.profile_id = v_profile_id
      and enrollment.product_id = v_module.product_id
      and enrollment.status = 'active'
      and enrollment.revoked_at is null
      and enrollment.starts_at <= v_now
      and (
        enrollment.expires_at is null
        or enrollment.expires_at > v_now
      )
  ) then
    raise exception using errcode = 'P0001', message = 'ACTIVE_ENROLLMENT_REQUIRED';
  end if;

  insert into public.module_progress (
    profile_id,
    product_id,
    module_key,
    status,
    progress_percent,
    started_at,
    completed_at,
    last_seen_at
  )
  values (
    v_profile_id,
    v_module.product_id,
    v_module.module_key,
    'completed',
    100,
    v_now,
    v_now,
    v_now
  )
  on conflict (profile_id, product_id, module_key)
  do update set
    status = 'completed',
    progress_percent = 100,
    started_at = coalesce(public.module_progress.started_at, excluded.started_at),
    completed_at = coalesce(public.module_progress.completed_at, excluded.completed_at),
    last_seen_at = greatest(
      coalesce(public.module_progress.last_seen_at, excluded.last_seen_at),
      excluded.last_seen_at
    )
  returning *
  into v_progress;

  return v_progress;
end;
$$;

revoke all on function public.mark_module_completed(text, text) from public;
revoke all on function public.mark_module_completed(text, text) from anon;
revoke all on function public.mark_module_completed(text, text) from authenticated;
grant execute on function public.mark_module_completed(text, text) to authenticated;
