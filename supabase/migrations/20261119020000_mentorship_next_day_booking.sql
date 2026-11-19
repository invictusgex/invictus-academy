-- A calendar-day boundary in the mentor's timezone, not a rolling 24-hour delay.
create function public.mentorship_booking_date_allowed(p_starts_at timestamptz, p_now timestamptz)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce((p_starts_at at time zone 'America/Chicago')::date > (p_now at time zone 'America/Chicago')::date, false);
$$;
revoke all on function public.mentorship_booking_date_allowed(timestamptz,timestamptz) from public, anon, authenticated;

create function public.enforce_mentorship_next_day_booking()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_starts_at timestamptz;
begin
  if new.status <> 'confirmed' then return new; end if;
  if tg_op = 'UPDATE' then
    if old.status = 'confirmed' and old.slot_id = new.slot_id then return new; end if;
  end if;
  select starts_at into v_starts_at from public.academy_mentorship_slots where id = new.slot_id;
  if not found then return new; end if;
  if not public.mentorship_booking_date_allowed(v_starts_at, statement_timestamp()) then
    raise exception using errcode = 'P0001', message = 'MENTORSHIP_NEXT_DAY_REQUIRED';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_mentorship_next_day_booking() from public, anon, authenticated;
create trigger mentorship_next_day_booking
before insert or update of status, slot_id on public.academy_mentorship_bookings
for each row execute function public.enforce_mentorship_next_day_booking();
