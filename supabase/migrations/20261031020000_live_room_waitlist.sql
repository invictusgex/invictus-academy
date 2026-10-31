create table public.live_room_waitlist (
  email text primary key check (length(email) <= 254 and email = lower(trim(email))),
  created_at timestamptz not null default now(),
  consent_version text not null
);
alter table public.live_room_waitlist enable row level security;
revoke all on public.live_room_waitlist from public, anon, authenticated;
grant select, insert on public.live_room_waitlist to service_role;
