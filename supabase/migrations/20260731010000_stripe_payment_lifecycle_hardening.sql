-- Invictus Trading Academy - Stripe payment lifecycle hardening
-- Adds safe access revocation/restoration for refunds and disputes.

alter table public.enrollments
  add column if not exists revocation_source text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_revocation_source_check'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_revocation_source_check
      check (
        revocation_source is null
        or revocation_source in (
          'manual',
          'stripe_refund',
          'stripe_dispute'
        )
      );
  end if;
end;
$$;

update public.enrollments
set revocation_source = 'manual'
where status = 'revoked'
  and revoked_at is not null
  and revocation_source is null;

create index if not exists enrollments_revocation_source_idx
  on public.enrollments (revocation_source)
  where revocation_source is not null;

create or replace function public.revoke_purchase_enrollment(
  p_purchase_id uuid,
  p_revocation_source text,
  p_summary text default null
)
returns table (
  purchase_id uuid,
  enrollment_id uuid,
  enrollment_revoked boolean,
  event_created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_purchase public.purchases%rowtype;
  v_enrollment public.enrollments%rowtype;
  v_now timestamptz := now();
begin
  if p_revocation_source not in ('stripe_refund', 'stripe_dispute') then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_REVOCATION_SOURCE_INVALID';
  end if;

  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'PURCHASE_NOT_FOUND';
  end if;

  if v_purchase.enrollment_id is null then
    return query
    select v_purchase.id, null::uuid, false, false;
    return;
  end if;

  select *
  into v_enrollment
  from public.enrollments
  where id = v_purchase.enrollment_id
  for update;

  if not found
    or v_enrollment.profile_id <> v_purchase.profile_id
    or v_enrollment.product_id <> v_purchase.product_id
    or v_enrollment.access_source <> 'purchase' then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_LINK_CONFLICT';
  end if;

  if v_enrollment.status = 'revoked' and v_enrollment.revoked_at is not null then
    enrollment_revoked := false;
  else
    update public.enrollments
    set
      status = 'revoked',
      revoked_at = v_now,
      revocation_source = p_revocation_source
    where id = v_enrollment.id;

    enrollment_revoked := true;
  end if;

  begin
    if enrollment_revoked then
      insert into public.purchase_events (
        purchase_id,
        event_type,
        source,
        actor_profile_id,
        summary,
        metadata
      )
      values (
        v_purchase.id,
        'enrollment_revoked',
        'system',
        null,
        coalesce(p_summary, 'Academic access revoked by commercial lifecycle.'),
        jsonb_build_object(
          'enrollment_id',
          v_enrollment.id::text,
          'revocation_source',
          p_revocation_source
        )
      );

      event_created := true;
    else
      event_created := false;
    end if;
  exception
    when others then
      raise exception using
        errcode = 'P0001',
        message = 'ENROLLMENT_REVOCATION_EVENT_FAILED';
  end;

  return query
  select v_purchase.id, v_enrollment.id, enrollment_revoked, event_created;
end;
$$;

create or replace function public.restore_purchase_enrollment(
  p_purchase_id uuid,
  p_summary text default null
)
returns table (
  purchase_id uuid,
  enrollment_id uuid,
  enrollment_restored boolean,
  event_created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_purchase public.purchases%rowtype;
  v_enrollment public.enrollments%rowtype;
begin
  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'PURCHASE_NOT_FOUND';
  end if;

  if v_purchase.status <> 'paid' then
    return query
    select v_purchase.id, v_purchase.enrollment_id, false, false;
    return;
  end if;

  if v_purchase.amount_total_minor is not null
    and v_purchase.amount_refunded_minor >= v_purchase.amount_total_minor then
    return query
    select v_purchase.id, v_purchase.enrollment_id, false, false;
    return;
  end if;

  if v_purchase.enrollment_id is null then
    return query
    select v_purchase.id, null::uuid, false, false;
    return;
  end if;

  select *
  into v_enrollment
  from public.enrollments
  where id = v_purchase.enrollment_id
  for update;

  if not found
    or v_enrollment.profile_id <> v_purchase.profile_id
    or v_enrollment.product_id <> v_purchase.product_id
    or v_enrollment.access_source <> 'purchase' then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_LINK_CONFLICT';
  end if;

  if v_enrollment.status = 'revoked'
    and v_enrollment.revoked_at is not null
    and v_enrollment.revocation_source = 'stripe_dispute' then
    update public.enrollments
    set
      status = 'active',
      revoked_at = null,
      revocation_source = null
    where id = v_enrollment.id;

    enrollment_restored := true;
  else
    enrollment_restored := false;
  end if;

  begin
    if enrollment_restored then
      insert into public.purchase_events (
        purchase_id,
        event_type,
        source,
        actor_profile_id,
        summary,
        metadata
      )
      values (
        v_purchase.id,
        'manual_adjustment',
        'system',
        null,
        coalesce(p_summary, 'Academic access restored after dispute was won.'),
        jsonb_build_object(
          'enrollment_id',
          v_enrollment.id::text,
          'restoration_source',
          'stripe_dispute_won'
        )
      );

      event_created := true;
    else
      event_created := false;
    end if;
  exception
    when others then
      raise exception using
        errcode = 'P0001',
        message = 'ENROLLMENT_RESTORATION_EVENT_FAILED';
  end;

  return query
  select v_purchase.id, v_enrollment.id, enrollment_restored, event_created;
end;
$$;

revoke all on function public.revoke_purchase_enrollment(uuid, text, text) from public;
revoke all on function public.revoke_purchase_enrollment(uuid, text, text) from anon;
revoke all on function public.revoke_purchase_enrollment(uuid, text, text) from authenticated;
grant execute on function public.revoke_purchase_enrollment(uuid, text, text) to service_role;

revoke all on function public.restore_purchase_enrollment(uuid, text) from public;
revoke all on function public.restore_purchase_enrollment(uuid, text) from anon;
revoke all on function public.restore_purchase_enrollment(uuid, text) from authenticated;
grant execute on function public.restore_purchase_enrollment(uuid, text) to service_role;
