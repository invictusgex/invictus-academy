-- Invictus Trading Academy - private image attachments for module reflections

create table if not exists public.academy_module_reflection_attachments (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references public.academy_module_reflections (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  module_key text not null,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamp with time zone not null default now(),
  constraint academy_module_reflection_attachments_size_check
    check (size_bytes > 0 and size_bytes <= 8388608),
  constraint academy_module_reflection_attachments_mime_type_check
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint academy_module_reflection_attachments_storage_path_key
    unique (storage_path),
  constraint academy_module_reflection_attachments_storage_path_check
    check (
      storage_path like 'reflections/%'
      and storage_path not like '%..%'
      and storage_path not like '%//%'
      and storage_path not like '/%'
      and storage_path not like '%\%'
    ),
  constraint academy_module_reflection_attachments_module_scope_fkey
    foreign key (product_id, module_key)
    references public.academy_modules (product_id, module_key)
    on delete cascade
);

create index if not exists academy_module_reflection_attachments_reflection_idx
  on public.academy_module_reflection_attachments (reflection_id, created_at);

create index if not exists academy_module_reflection_attachments_profile_product_idx
  on public.academy_module_reflection_attachments (profile_id, product_id);

create or replace function public.enforce_module_reflection_attachment_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.academy_module_reflection_attachments attachment
    where attachment.reflection_id = new.reflection_id
  ) >= 5 then
    raise exception using
      errcode = 'P0001',
      message = 'MODULE_REFLECTION_ATTACHMENT_LIMIT_REACHED';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_module_reflection_attachment_limit
  on public.academy_module_reflection_attachments;

create trigger enforce_module_reflection_attachment_limit
before insert on public.academy_module_reflection_attachments
for each row
execute function public.enforce_module_reflection_attachment_limit();

alter table public.academy_module_reflection_attachments enable row level security;

revoke all privileges on table public.academy_module_reflection_attachments
  from anon, authenticated;

grant select, insert, delete on table public.academy_module_reflection_attachments
  to authenticated;

grant select, insert, update, delete on table public.academy_module_reflection_attachments
  to service_role;

create policy academy_module_reflection_attachments_authenticated_read_own
  on public.academy_module_reflection_attachments
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_module_reflection_attachments.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_module_reflection_attachments.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_module_reflection_attachments_authenticated_insert_own
  on public.academy_module_reflection_attachments
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and storage_path like ('reflections/' || auth.uid()::text || '/%')
    and exists (
      select 1
      from public.academy_module_reflections reflection
      where reflection.id = academy_module_reflection_attachments.reflection_id
        and reflection.profile_id = auth.uid()
        and reflection.profile_id = academy_module_reflection_attachments.profile_id
        and reflection.product_id = academy_module_reflection_attachments.product_id
        and reflection.module_key = academy_module_reflection_attachments.module_key
        and reflection.enrollment_id = academy_module_reflection_attachments.enrollment_id
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_module_reflection_attachments.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_module_reflection_attachments.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_module_reflection_attachments_authenticated_delete_own
  on public.academy_module_reflection_attachments
  for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_module_reflection_attachments.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_module_reflection_attachments.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_module_reflection_attachments_admin_read_all
  on public.academy_module_reflection_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_assets_reflection_owner_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and name like ('reflections/' || auth.uid()::text || '/%')
    and exists (
      select 1
      from public.enrollments enrollment
      join public.products product
        on product.id = enrollment.product_id
      where enrollment.profile_id = auth.uid()
        and product.slug = 'trading-basado-en-datos'
        and product.status = 'active'
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_assets_reflection_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'academy-assets'
    and name like ('reflections/' || auth.uid()::text || '/%')
    and exists (
      select 1
      from public.enrollments enrollment
      join public.products product
        on product.id = enrollment.product_id
      where enrollment.profile_id = auth.uid()
        and product.slug = 'trading-basado-en-datos'
        and product.status = 'active'
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_assets_reflection_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and name like ('reflections/' || auth.uid()::text || '/%')
    and exists (
      select 1
      from public.enrollments enrollment
      join public.products product
        on product.id = enrollment.product_id
      where enrollment.profile_id = auth.uid()
        and product.slug = 'trading-basado-en-datos'
        and product.status = 'active'
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_assets_reflection_admin_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'academy-assets'
    and name like 'reflections/%'
    and exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );
