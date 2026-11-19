create table public.mentorship_discord_deliveries (
  booking_id uuid primary key references public.academy_mentorship_bookings(id),
  booked_at timestamptz not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped')),
  sent_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  lease_token uuid,
  lease_until timestamptz,
  check (ends_at > starts_at)
);
alter table public.mentorship_discord_deliveries enable row level security;
revoke all on public.mentorship_discord_deliveries from public, anon, authenticated;
grant select, insert, update on public.mentorship_discord_deliveries to service_role;
create index mentorship_discord_deliveries_pending_idx on public.mentorship_discord_deliveries(booked_at) where status = 'pending';
