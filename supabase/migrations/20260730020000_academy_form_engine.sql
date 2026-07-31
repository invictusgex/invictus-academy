-- Invictus Trading Academy - reusable academic form engine
-- Adds product-scoped form definitions and enrollment-bound submissions.

create table if not exists public.academy_form_definitions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  status text not null default 'draft',
  is_required boolean not null default false,
  form_schema jsonb not null default '{"fields":[]}'::jsonb,
  display_order integer not null default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_form_definitions_product_slug_key unique (product_id, slug),
  constraint academy_form_definitions_id_product_id_key unique (id, product_id),
  constraint academy_form_definitions_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint academy_form_definitions_slug_check check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint academy_form_definitions_schema_check check (
    jsonb_typeof(form_schema) = 'object'
  ),
  constraint academy_form_definitions_display_order_check check (
    display_order >= 0
  ),
  constraint academy_form_definitions_published_at_check check (
    published_at is null or status = 'published'
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_id_profile_id_product_id_key'
      and conrelid = 'public.enrollments'::regclass
  ) then
    alter table public.enrollments
      add constraint enrollments_id_profile_id_product_id_key
      unique (id, profile_id, product_id);
  end if;
end;
$$;

create table if not exists public.academy_form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_definition_id uuid not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  enrollment_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_form_submissions_form_product_fkey
    foreign key (form_definition_id, product_id)
    references public.academy_form_definitions(id, product_id)
    on delete cascade,
  constraint academy_form_submissions_enrollment_scope_fkey
    foreign key (enrollment_id, profile_id, product_id)
    references public.enrollments(id, profile_id, product_id)
    on delete cascade,
  constraint academy_form_submissions_unique_response_key
    unique (form_definition_id, profile_id, enrollment_id),
  constraint academy_form_submissions_answers_check check (
    jsonb_typeof(answers) = 'object'
  )
);

create index if not exists academy_form_definitions_product_required_idx
  on public.academy_form_definitions (product_id, is_required, status);

create index if not exists academy_form_definitions_product_order_idx
  on public.academy_form_definitions (product_id, display_order);

create index if not exists academy_form_submissions_profile_product_idx
  on public.academy_form_submissions (profile_id, product_id);

create index if not exists academy_form_submissions_enrollment_idx
  on public.academy_form_submissions (enrollment_id);

drop trigger if exists set_academy_form_definitions_updated_at
  on public.academy_form_definitions;
create trigger set_academy_form_definitions_updated_at
before update on public.academy_form_definitions
for each row
execute function public.set_updated_at();

drop trigger if exists set_academy_form_submissions_updated_at
  on public.academy_form_submissions;
create trigger set_academy_form_submissions_updated_at
before update on public.academy_form_submissions
for each row
execute function public.set_updated_at();

alter table public.academy_form_definitions enable row level security;
alter table public.academy_form_submissions enable row level security;

create policy academy_form_definitions_authenticated_read_published
  on public.academy_form_definitions
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_form_definitions.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_form_definitions_admin_read_all
  on public.academy_form_definitions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_form_definitions_admin_insert
  on public.academy_form_definitions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_form_definitions_admin_update
  on public.academy_form_definitions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy academy_form_submissions_authenticated_read_own
  on public.academy_form_submissions
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy academy_form_submissions_authenticated_insert_own
  on public.academy_form_submissions
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_form_definitions form_definition
      where form_definition.id = academy_form_submissions.form_definition_id
        and form_definition.product_id = academy_form_submissions.product_id
        and form_definition.status = 'published'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_form_submissions.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_form_submissions.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_form_submissions_authenticated_update_own
  on public.academy_form_submissions
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.academy_form_definitions form_definition
      where form_definition.id = academy_form_submissions.form_definition_id
        and form_definition.product_id = academy_form_submissions.product_id
        and form_definition.status = 'published'
    )
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.id = academy_form_submissions.enrollment_id
        and enrollment.profile_id = auth.uid()
        and enrollment.product_id = academy_form_submissions.product_id
        and enrollment.status = 'active'
        and enrollment.revoked_at is null
        and enrollment.starts_at <= now()
        and (
          enrollment.expires_at is null
          or enrollment.expires_at > now()
        )
    )
  );

create policy academy_form_submissions_admin_read_all
  on public.academy_form_submissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );
