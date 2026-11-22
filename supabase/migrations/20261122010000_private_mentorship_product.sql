-- Preserve purchases, refunds, accounts and historical learning data.
alter table public.enrollments add column mentorship_completed_at timestamptz;
update public.products set title = 'Mentoría privada Invictus GEX', description = 'Sesiones privadas en vivo hasta completar el contenido acordado. Pago único de 349 USD.' where slug = 'trading-basado-en-datos';
update public.site_promotions set is_active = false;
update public.academy_modules set status = 'draft', published_at = null where product_id in (select id from public.products where slug = 'trading-basado-en-datos');
create unique index academy_mentorship_one_confirmed_per_enrollment on public.academy_mentorship_bookings(enrollment_id) where status = 'confirmed';

create or replace function public.book_mentorship_slot(p_slot_id uuid, p_participant_timezone text, p_note text default null)
returns public.academy_mentorship_bookings language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_slot public.academy_mentorship_slots%rowtype;
  v_enrollment public.enrollments%rowtype;
  v_booking public.academy_mentorship_bookings%rowtype;
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_participant_timezone) then raise exception 'PARTICIPANT_TIMEZONE_REQUIRED'; end if;
  select * into v_enrollment from public.enrollments e where e.profile_id=v_user and e.status='active' and e.revoked_at is null and e.starts_at<=v_now and (e.expires_at is null or e.expires_at>v_now)
    and exists(select 1 from public.products p where p.id=e.product_id and p.slug='trading-basado-en-datos' and p.status='active') order by e.starts_at desc limit 1 for update;
  if not found then raise exception 'ACTIVE_ENROLLMENT_REQUIRED'; end if;
  if v_enrollment.mentorship_completed_at is not null then raise exception 'MENTORSHIP_ALREADY_COMPLETED'; end if;
  select * into v_booking from public.academy_mentorship_bookings where enrollment_id=v_enrollment.id and status='confirmed' limit 1;
  if found then return v_booking; end if;
  select * into v_slot from public.academy_mentorship_slots where id=p_slot_id for update;
  if not found or v_slot.status<>'available' or v_slot.starts_at<=v_now then raise exception 'SLOT_NOT_AVAILABLE'; end if;
  if not public.mentorship_booking_date_allowed(v_slot.starts_at,v_now) then raise exception 'MENTORSHIP_NEXT_DAY_REQUIRED'; end if;
  if exists(select 1 from public.academy_mentorship_blocked_windows b where b.status='active' and v_slot.starts_at<b.ends_at and v_slot.ends_at>b.starts_at) then raise exception 'SLOT_NOT_AVAILABLE'; end if;
  if exists(select 1 from public.academy_mentorship_bookings b where b.slot_id=v_slot.id and b.status='confirmed') then raise exception 'SLOT_ALREADY_BOOKED'; end if;
  insert into public.academy_mentorship_bookings(slot_id,profile_id,product_id,enrollment_id,status,participant_timezone,participant_note,booked_at)
    values(v_slot.id,v_user,v_enrollment.product_id,v_enrollment.id,'confirmed',p_participant_timezone,nullif(left(trim(p_note),4000),''),v_now) returning * into v_booking;
  update public.academy_mentorship_slots set status='booked' where id=v_slot.id;
  return v_booking;
end;
$$;
revoke all on function public.book_mentorship_slot(uuid,text,text) from public,anon;
grant execute on function public.book_mentorship_slot(uuid,text,text) to authenticated;

create or replace function public.cancel_mentorship_booking(p_booking_id uuid)
returns public.academy_mentorship_bookings language plpgsql security definer set search_path = '' as $$
declare v_booking public.academy_mentorship_bookings%rowtype;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  select * into v_booking from public.academy_mentorship_bookings where id=p_booking_id and profile_id=auth.uid() for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_booking.status='cancelled' then return v_booking; end if;
  if v_booking.status<>'confirmed' then raise exception 'BOOKING_COMPLETED'; end if;
  update public.academy_mentorship_bookings set status='cancelled',cancelled_at=statement_timestamp() where id=v_booking.id returning * into v_booking;
  update public.academy_mentorship_slots set status='available' where id=v_booking.slot_id and status='booked' and starts_at>statement_timestamp();
  return v_booking;
end;
$$;
revoke all on function public.cancel_mentorship_booking(uuid) from public,anon;
grant execute on function public.cancel_mentorship_booking(uuid) to authenticated;

create function public.set_private_mentorship_completed(p_enrollment_id uuid,p_completed boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED'; end if;
  perform 1 from public.enrollments e where e.id=p_enrollment_id and exists(select 1 from public.products p where p.id=e.product_id and p.slug='trading-basado-en-datos') for update;
  if not found then raise exception 'ENROLLMENT_NOT_FOUND'; end if;
  if p_completed and exists(select 1 from public.academy_mentorship_bookings where enrollment_id=p_enrollment_id and status='confirmed') then raise exception 'CONFIRMED_BOOKING_EXISTS'; end if;
  update public.enrollments set mentorship_completed_at=case when p_completed then statement_timestamp() else null end where id=p_enrollment_id;
  return true;
end;
$$;
revoke all on function public.set_private_mentorship_completed(uuid,boolean) from public,anon;
grant execute on function public.set_private_mentorship_completed(uuid,boolean) to authenticated;
