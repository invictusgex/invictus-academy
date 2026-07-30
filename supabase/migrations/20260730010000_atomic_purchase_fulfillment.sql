-- Invictus Trading Academy - atomic purchase fulfillment
-- Atomically grants academic access after a confirmed paid purchase.

create unique index if not exists purchase_events_one_enrollment_granted_per_purchase_key
  on public.purchase_events (purchase_id)
  where event_type = 'enrollment_granted';

create or replace function public.fulfill_paid_purchase(p_purchase_id uuid)
returns table (
  purchase_id uuid,
  enrollment_id uuid,
  outcome text,
  enrollment_created boolean,
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
  v_updated_count integer := 0;
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
    raise exception using
      errcode = 'P0001',
      message = 'PURCHASE_NOT_PAID';
  end if;

  if v_purchase.profile_id is null or v_purchase.product_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'FULFILLMENT_TRANSACTION_FAILED';
  end if;

  if v_purchase.enrollment_id is not null then
    select *
    into v_enrollment
    from public.enrollments
    where id = v_purchase.enrollment_id
    for update;

    if not found
      or v_enrollment.profile_id <> v_purchase.profile_id
      or v_enrollment.product_id <> v_purchase.product_id then
      raise exception using
        errcode = 'P0001',
        message = 'ENROLLMENT_LINK_CONFLICT';
    end if;

    return query
    select
      v_purchase.id,
      v_enrollment.id,
      'already_fulfilled'::text,
      false,
      false;
    return;
  end if;

  select *
  into v_enrollment
  from public.enrollments
  where profile_id = v_purchase.profile_id
    and product_id = v_purchase.product_id
  for update;

  if not found then
    begin
      insert into public.enrollments (
        profile_id,
        product_id,
        status,
        starts_at,
        expires_at,
        revoked_at,
        access_source
      )
      values (
        v_purchase.profile_id,
        v_purchase.product_id,
        'active',
        v_now,
        null,
        null,
        'purchase'
      )
      returning *
      into v_enrollment;

      enrollment_created := true;
    exception
      when unique_violation then
        select *
        into v_enrollment
        from public.enrollments
        where profile_id = v_purchase.profile_id
          and product_id = v_purchase.product_id
        for update;

        if not found then
          raise exception using
            errcode = 'P0001',
            message = 'ENROLLMENT_CREATION_FAILED';
        end if;

        enrollment_created := false;
      when others then
        raise exception using
          errcode = 'P0001',
          message = 'ENROLLMENT_CREATION_FAILED';
    end;
  else
    enrollment_created := false;
  end if;

  if v_enrollment.status = 'revoked' or v_enrollment.revoked_at is not null then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_REVOKED_CONFLICT';
  end if;

  if v_enrollment.status = 'expired' then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_EXPIRED_CONFLICT';
  end if;

  if v_enrollment.status <> 'active' then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_NOT_YET_ACTIVE_CONFLICT';
  end if;

  if v_enrollment.starts_at > v_now then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_NOT_YET_ACTIVE_CONFLICT';
  end if;

  if v_enrollment.expires_at is not null and v_enrollment.expires_at <= v_now then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_EXPIRED_CONFLICT';
  end if;

  update public.purchases as target_purchase
  set enrollment_id = v_enrollment.id
  where target_purchase.id = v_purchase.id
    and (
      target_purchase.enrollment_id is null
      or target_purchase.enrollment_id = v_enrollment.id
    );

  get diagnostics v_updated_count = row_count;

  if v_updated_count <> 1 then
    raise exception using
      errcode = 'P0001',
      message = 'ENROLLMENT_LINK_FAILED';
  end if;

  begin
    if not exists (
      select 1
      from public.purchase_events
      where purchase_events.purchase_id = v_purchase.id
        and purchase_events.event_type = 'enrollment_granted'
    ) then
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
        'enrollment_granted',
        'system',
        null,
        'Academic access granted after confirmed payment.',
        jsonb_build_object(
          'enrollment_id',
          v_enrollment.id::text,
          'enrollment_created',
          enrollment_created
        )
      );

      event_created := true;
    else
      event_created := false;
    end if;
  exception
    when unique_violation then
      event_created := false;
    when others then
      raise exception using
        errcode = 'P0001',
        message = 'FULFILLMENT_TRANSACTION_FAILED';
  end;

  return query
  select
    v_purchase.id,
    v_enrollment.id,
    case
      when enrollment_created then 'granted'::text
      else 'active_enrollment_reused'::text
    end,
    enrollment_created,
    event_created;
end;
$$;

revoke all on function public.fulfill_paid_purchase(uuid) from public;
revoke all on function public.fulfill_paid_purchase(uuid) from anon;
revoke all on function public.fulfill_paid_purchase(uuid) from authenticated;
grant execute on function public.fulfill_paid_purchase(uuid) to service_role;
