-- Invictus Trading Academy - commercial domain foundation
-- Defines domain-owned purchases, purchase audit events and Stripe webhook idempotency.
-- This migration does not activate enrollments and does not process Stripe events.

create sequence if not exists public.purchase_number_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no maxvalue
  cache 1;

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_number text not null
    default ('ITA-' || lpad(nextval('public.purchase_number_seq')::text, 6, '0')),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  enrollment_id uuid null references public.enrollments(id) on delete set null,
  status text not null default 'pending',
  payment_provider text not null default 'stripe',
  provider_checkout_session_id text null,
  provider_payment_intent_id text null,
  amount_total_minor bigint null,
  amount_refunded_minor bigint not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchases_purchase_number_key
    unique (purchase_number),
  constraint purchases_status_check
    check (
      status in (
        'pending',
        'paid',
        'failed',
        'canceled',
        'refunded',
        'partially_refunded',
        'disputed'
      )
    ),
  constraint purchases_payment_provider_check
    check (payment_provider in ('stripe')),
  constraint purchases_amount_total_minor_check
    check (amount_total_minor is null or amount_total_minor >= 0),
  constraint purchases_amount_refunded_minor_check
    check (
      amount_refunded_minor >= 0
      and (
        amount_total_minor is null
        or amount_refunded_minor <= amount_total_minor
      )
    ),
  constraint purchases_currency_check
    check (currency ~ '^[A-Z]{3}$')
);

create unique index if not exists purchases_provider_checkout_session_id_key
  on public.purchases (payment_provider, provider_checkout_session_id)
  where provider_checkout_session_id is not null;

create unique index if not exists purchases_provider_payment_intent_id_key
  on public.purchases (payment_provider, provider_payment_intent_id)
  where provider_payment_intent_id is not null;

create index if not exists purchases_profile_product_status_created_at_idx
  on public.purchases (profile_id, product_id, status, created_at desc);

create unique index if not exists purchases_one_pending_per_profile_product_key
  on public.purchases (profile_id, product_id)
  where status = 'pending';

create index if not exists purchases_product_id_status_idx
  on public.purchases (product_id, status);

create index if not exists purchases_created_at_idx
  on public.purchases (created_at desc);

create index if not exists purchases_enrollment_id_idx
  on public.purchases (enrollment_id)
  where enrollment_id is not null;

create table if not exists public.purchase_events (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  event_type text not null,
  source text not null,
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  summary text null,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  constraint purchase_events_event_type_check
    check (
      event_type in (
        'purchase_created',
        'payment_pending',
        'payment_confirmed',
        'payment_failed',
        'purchase_canceled',
        'refund_requested',
        'refund_completed',
        'partial_refund_completed',
        'dispute_opened',
        'dispute_won',
        'dispute_lost',
        'enrollment_granted',
        'enrollment_revoked',
        'manual_adjustment'
      )
    ),
  constraint purchase_events_source_check
    check (source in ('system', 'stripe_webhook', 'admin', 'student'))
);

create index if not exists purchase_events_purchase_id_created_at_idx
  on public.purchase_events (purchase_id, created_at desc);

create index if not exists purchase_events_event_type_created_at_idx
  on public.purchase_events (event_type, created_at desc);

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null,
  event_type text not null,
  api_version text null,
  livemode boolean not null default false,
  processing_status text not null default 'received',
  attempt_count integer not null default 0,
  last_error_code text null,
  purchase_id uuid null references public.purchases(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz null,
  error_message text null,
  payload_summary jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_webhook_events_event_id_key
    unique (stripe_event_id),
  constraint stripe_webhook_events_processing_status_check
    check (
      processing_status in (
        'received',
        'processing',
        'processed',
        'failed',
        'ignored'
      )
    ),
  constraint stripe_webhook_events_attempt_count_check
    check (attempt_count >= 0)
);

create index if not exists stripe_webhook_events_processing_status_received_at_idx
  on public.stripe_webhook_events (processing_status, received_at);

create index if not exists stripe_webhook_events_event_type_received_at_idx
  on public.stripe_webhook_events (event_type, received_at);

create index if not exists stripe_webhook_events_purchase_id_idx
  on public.stripe_webhook_events (purchase_id)
  where purchase_id is not null;

drop trigger if exists set_purchases_updated_at on public.purchases;
create trigger set_purchases_updated_at
before update on public.purchases
for each row
execute function public.set_updated_at();

drop trigger if exists set_stripe_webhook_events_updated_at
  on public.stripe_webhook_events;
create trigger set_stripe_webhook_events_updated_at
before update on public.stripe_webhook_events
for each row
execute function public.set_updated_at();

alter table public.purchases enable row level security;
alter table public.purchase_events enable row level security;
alter table public.stripe_webhook_events enable row level security;

do $$
begin
  if to_regclass('public.profiles') is not null
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'profiles'
        and policyname = 'profiles_authenticated_read_own'
    ) then
    create policy profiles_authenticated_read_own
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'purchases'
      and policyname = 'purchases_authenticated_read_own'
  ) then
    create policy purchases_authenticated_read_own
      on public.purchases
      for select
      to authenticated
      using (profile_id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'purchases'
      and policyname = 'purchases_admin_read'
  ) then
    create policy purchases_admin_read
      on public.purchases
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'purchase_events'
      and policyname = 'purchase_events_authenticated_read_own'
  ) then
    create policy purchase_events_authenticated_read_own
      on public.purchase_events
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.purchases
          where purchases.id = purchase_events.purchase_id
            and purchases.profile_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'purchase_events'
      and policyname = 'purchase_events_admin_read'
  ) then
    create policy purchase_events_admin_read
      on public.purchase_events
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'stripe_webhook_events'
      and policyname = 'stripe_webhook_events_admin_read'
  ) then
    create policy stripe_webhook_events_admin_read
      on public.stripe_webhook_events
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;
