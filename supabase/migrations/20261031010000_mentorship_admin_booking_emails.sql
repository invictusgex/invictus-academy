-- Server-only delivery state; preserves booking rules and does not expose student data.
create table public.mentorship_email_deliveries (
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
alter table public.mentorship_email_deliveries enable row level security;
revoke all on public.mentorship_email_deliveries from public, anon, authenticated;
grant select, insert, update on public.mentorship_email_deliveries to service_role;
create index mentorship_email_deliveries_pending_idx on public.mentorship_email_deliveries(booked_at) where status = 'pending';
