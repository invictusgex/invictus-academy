-- Private email delivery queue. No customer, profile or subscription identifiers.
create table public.live_room_alert_deliveries (
  id text primary key check (id ~ '^[a-f0-9]{64}$'),
  kind text not null check (kind in ('renewal_upcoming', 'invoice_ready', 'paid', 'payment_failed', 'subscription_ended', 'subscription_changed', 'sync_failed', 'access_mismatch', 'verification_failed')),
  occurred_at timestamptz not null,
  livemode boolean not null,
  sent_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  lease_token uuid,
  lease_until timestamptz,
  last_attempt_at timestamptz,
  last_failed boolean not null default false
);
alter table public.live_room_alert_deliveries enable row level security;
revoke all on public.live_room_alert_deliveries from public, anon, authenticated;
grant select, insert, update on public.live_room_alert_deliveries to service_role;
create index live_room_alert_deliveries_pending_idx on public.live_room_alert_deliveries(livemode, occurred_at) where sent_at is null;
