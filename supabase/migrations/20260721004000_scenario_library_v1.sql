-- Invictus Trading Academy - Scenario Library v1
-- Independent market scenario library. No academy module, video, resource or progress changes.

create table if not exists public.market_scenarios (
  id uuid primary key default gen_random_uuid(),
  scenario_key text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  scenario_type text not null,
  market text not null,
  instrument text not null default '',
  event_date date,
  thumbnail_url text,
  video_provider text,
  video_id text,
  video_url text,
  document_url text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint market_scenarios_key_check check (scenario_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint market_scenarios_type_check check (
    scenario_type in (
      'market_analysis',
      'trade_review',
      'execution_example',
      'gamma_structure',
      'order_flow',
      'heatmap',
      'volume_profile',
      'macro_event',
      'other'
    )
  ),
  constraint market_scenarios_market_check check (
    market in ('futures', 'options', 'equities', 'macro', 'other')
  ),
  constraint market_scenarios_video_provider_check check (
    video_provider is null or video_provider in ('youtube', 'vimeo', 'bunny', 'external')
  ),
  constraint market_scenarios_video_reference_check check (
    video_id is null or video_url is null
  ),
  constraint market_scenarios_metadata_check check (
    jsonb_typeof(metadata) = 'object'
  ),
  constraint market_scenarios_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint market_scenarios_published_at_check check (
    published_at is null or status = 'published'
  )
);

create index if not exists market_scenarios_status_idx
  on public.market_scenarios (status);

create index if not exists market_scenarios_published_at_idx
  on public.market_scenarios (published_at);

create index if not exists market_scenarios_event_date_idx
  on public.market_scenarios (event_date);

create index if not exists market_scenarios_type_idx
  on public.market_scenarios (scenario_type);

create index if not exists market_scenarios_market_idx
  on public.market_scenarios (market);

create index if not exists market_scenarios_instrument_idx
  on public.market_scenarios (instrument);

drop trigger if exists set_market_scenarios_updated_at on public.market_scenarios;
create trigger set_market_scenarios_updated_at
before update on public.market_scenarios
for each row
execute function public.set_updated_at();

alter table public.market_scenarios enable row level security;

create policy market_scenarios_admin_read_all
  on public.market_scenarios
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy market_scenarios_enrolled_read_published
  on public.market_scenarios
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.enrollments
      join public.products
        on products.id = enrollments.product_id
      where enrollments.profile_id = auth.uid()
        and products.slug = 'trading-basado-en-datos'
        and enrollments.status = 'active'
        and enrollments.revoked_at is null
        and enrollments.starts_at <= now()
        and (
          enrollments.expires_at is null
          or enrollments.expires_at > now()
        )
    )
  );
