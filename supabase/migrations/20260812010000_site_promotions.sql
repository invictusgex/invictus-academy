-- Invictus GEX - editable commercial promotion
-- Stores the visible coupon template used by the public ribbon and checkout pre-step.

create table if not exists public.site_promotions (
  id text primary key,
  code text not null,
  discount_label text not null,
  headline text not null,
  message text not null,
  checkout_title text not null,
  checkout_description text not null,
  checkout_instruction text not null,
  is_active boolean not null default true,
  starts_at timestamptz null,
  ends_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_promotions_code_not_blank
    check (length(btrim(code)) > 0),
  constraint site_promotions_discount_label_not_blank
    check (length(btrim(discount_label)) > 0),
  constraint site_promotions_message_not_blank
    check (length(btrim(message)) > 0),
  constraint site_promotions_date_range
    check (starts_at is null or ends_at is null or starts_at < ends_at)
);

insert into public.site_promotions (
  id,
  code,
  discount_label,
  headline,
  message,
  checkout_title,
  checkout_description,
  checkout_instruction,
  is_active
)
values (
  'academy-primary-offer',
  'GEX10',
  '350 USD de descuento',
  'Cupón de descuento de 350 USD para acceder a la academia',
  'Cupón de descuento de 350 USD para acceder a la academia',
  'Descuento disponible',
  'Antes de continuar al pago seguro, recuerda aplicar el cupón vigente dentro de Stripe Checkout.',
  'En la pantalla de Stripe, busca el campo de código promocional y escribe GEX10 para acceder a la academia con el descuento aplicado.',
  true
)
on conflict (id) do nothing;

drop trigger if exists set_site_promotions_updated_at on public.site_promotions;
create trigger set_site_promotions_updated_at
before update on public.site_promotions
for each row
execute function public.set_updated_at();

alter table public.site_promotions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_promotions'
      and policyname = 'site_promotions_public_read_active'
  ) then
    create policy site_promotions_public_read_active
      on public.site_promotions
      for select
      to anon, authenticated
      using (
        is_active
        and (starts_at is null or starts_at <= now())
        and (ends_at is null or ends_at >= now())
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
      and tablename = 'site_promotions'
      and policyname = 'site_promotions_admin_read'
  ) then
    create policy site_promotions_admin_read
      on public.site_promotions
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
      and tablename = 'site_promotions'
      and policyname = 'site_promotions_admin_insert'
  ) then
    create policy site_promotions_admin_insert
      on public.site_promotions
      for insert
      to authenticated
      with check (
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
      and tablename = 'site_promotions'
      and policyname = 'site_promotions_admin_update'
  ) then
    create policy site_promotions_admin_update
      on public.site_promotions
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      );
  end if;
end;
$$;

grant select on public.site_promotions to anon, authenticated;
grant insert, update on public.site_promotions to authenticated;
