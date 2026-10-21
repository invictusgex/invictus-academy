-- Independent monthly Discord membership. No academic enrollment is created.
create table public.live_room_accounts (
  profile_id uuid not null references public.profiles(id),
  livemode boolean not null,
  discord_user_id text,
  discord_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'none',
  paid_through timestamptz,
  cancel_at_period_end boolean not null default false,
  checkout_session_id text,
  role_synced boolean not null default false,
  needs_sync boolean not null default false,
  operation_token uuid,
  operation_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, livemode),
  unique (discord_user_id, livemode),
  unique (stripe_customer_id, livemode),
  unique (stripe_subscription_id, livemode),
  check (discord_user_id is null or discord_user_id ~ '^[0-9]{17,20}$'),
  check (subscription_status in ('none','incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused'))
);

create table public.live_room_settings (
  id boolean primary key default true check (id),
  description text not null check (length(description) between 1 and 2000),
  updated_at timestamptz not null default now()
);
insert into public.live_room_settings (description) values (
  'Un espacio para interpretar el mercado en tiempo real junto al mentor. Conecta contexto, liquidez y flujo de órdenes dentro de una metodología compartida, con profundidad y criterio.'
);
alter table public.live_room_accounts enable row level security;
alter table public.live_room_settings enable row level security;
revoke all on public.live_room_accounts from anon, authenticated;
revoke all on public.live_room_settings from anon, authenticated;
grant select on public.live_room_accounts to authenticated;
grant select on public.live_room_settings to anon, authenticated;
grant all on public.live_room_accounts, public.live_room_settings to service_role;
create policy live_room_accounts_read_own on public.live_room_accounts
for select to authenticated using (profile_id = (select auth.uid()));
create policy live_room_settings_read on public.live_room_settings
for select to anon, authenticated using (true);

-- Serialize external operations across app instances; all APIs use bounded timeouts.
create function public.claim_live_room_operation(p_profile_id uuid, p_livemode boolean, p_token uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.live_room_accounts (profile_id, livemode)
  values (p_profile_id, p_livemode) on conflict do nothing;
  update public.live_room_accounts
  set operation_token = p_token, operation_until = now() + interval '300 seconds'
  where profile_id = p_profile_id and livemode = p_livemode
    and (operation_until is null or operation_until < now());
  return found;
end;
$$;
revoke all on function public.claim_live_room_operation(uuid, boolean, uuid) from public, anon, authenticated;
grant execute on function public.claim_live_room_operation(uuid, boolean, uuid) to service_role;
