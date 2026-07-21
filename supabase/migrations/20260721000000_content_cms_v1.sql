-- Invictus Trading Academy - Content CMS v1
-- Adds module, video and resource content tables. Progress remains in module_progress.

create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  module_key text not null,
  module_order integer not null,
  title text not null,
  description text not null default '',
  overview text not null default '',
  learning_objectives jsonb not null default '[]'::jsonb,
  estimated_duration_minutes integer,
  availability text not null default 'coming-soon',
  status text not null default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_modules_product_module_key_key unique (product_id, module_key),
  constraint academy_modules_product_module_order_key unique (product_id, module_order),
  constraint academy_modules_order_check check (module_order > 0),
  constraint academy_modules_duration_check check (
    estimated_duration_minutes is null or estimated_duration_minutes >= 0
  ),
  constraint academy_modules_learning_objectives_check check (
    jsonb_typeof(learning_objectives) = 'array'
  ),
  constraint academy_modules_availability_check check (
    availability in ('available', 'coming-soon')
  ),
  constraint academy_modules_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint academy_modules_published_at_check check (
    published_at is null or status = 'published'
  )
);

create table if not exists public.academy_module_videos (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  video_key text not null,
  video_order integer not null,
  title text not null,
  description text not null default '',
  provider text,
  provider_video_id text,
  duration_seconds integer,
  thumbnail_url text,
  placeholder text not null default '',
  status text not null default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_module_videos_module_video_key_key unique (module_id, video_key),
  constraint academy_module_videos_module_video_order_key unique (module_id, video_order),
  constraint academy_module_videos_order_check check (video_order > 0),
  constraint academy_module_videos_duration_check check (
    duration_seconds is null or duration_seconds >= 0
  ),
  constraint academy_module_videos_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint academy_module_videos_published_at_check check (
    published_at is null or status = 'published'
  )
);

create table if not exists public.academy_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  resource_key text not null,
  resource_order integer not null,
  title text not null,
  description text not null default '',
  resource_type text not null,
  url text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint academy_resources_module_resource_key_key unique (module_id, resource_key),
  constraint academy_resources_module_resource_order_key unique (module_id, resource_order),
  constraint academy_resources_order_check check (resource_order > 0),
  constraint academy_resources_type_check check (
    resource_type in ('pdf', 'link', 'template', 'downloadable', 'other')
  ),
  constraint academy_resources_metadata_check check (
    jsonb_typeof(metadata) = 'object'
  ),
  constraint academy_resources_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint academy_resources_published_at_check check (
    published_at is null or status = 'published'
  )
);

create index if not exists academy_modules_product_order_idx
  on public.academy_modules (product_id, module_order);

create index if not exists academy_modules_product_status_idx
  on public.academy_modules (product_id, status);

create index if not exists academy_module_videos_module_order_idx
  on public.academy_module_videos (module_id, video_order);

create index if not exists academy_module_videos_module_status_idx
  on public.academy_module_videos (module_id, status);

create index if not exists academy_resources_module_order_idx
  on public.academy_resources (module_id, resource_order);

create index if not exists academy_resources_module_type_idx
  on public.academy_resources (module_id, resource_type);

create index if not exists academy_resources_module_status_idx
  on public.academy_resources (module_id, status);

drop trigger if exists set_academy_modules_updated_at on public.academy_modules;
create trigger set_academy_modules_updated_at
before update on public.academy_modules
for each row
execute function public.set_updated_at();

drop trigger if exists set_academy_module_videos_updated_at
  on public.academy_module_videos;
create trigger set_academy_module_videos_updated_at
before update on public.academy_module_videos
for each row
execute function public.set_updated_at();

drop trigger if exists set_academy_resources_updated_at on public.academy_resources;
create trigger set_academy_resources_updated_at
before update on public.academy_resources
for each row
execute function public.set_updated_at();

alter table public.academy_modules enable row level security;
alter table public.academy_module_videos enable row level security;
alter table public.academy_resources enable row level security;

create policy academy_modules_read_published
  on public.academy_modules
  for select
  to anon, authenticated
  using (status = 'published');

create policy academy_module_videos_read_published
  on public.academy_module_videos
  for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.academy_modules academy_module
      where academy_module.id = academy_module_videos.module_id
        and academy_module.status = 'published'
    )
  );

create policy academy_resources_read_published
  on public.academy_resources
  for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.academy_modules academy_module
      where academy_module.id = academy_resources.module_id
        and academy_module.status = 'published'
    )
  );

create policy academy_modules_admin_read_all
  on public.academy_modules
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy academy_module_videos_admin_read_all
  on public.academy_module_videos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy academy_resources_admin_read_all
  on public.academy_resources
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
seed_modules as (
  select *
  from (
    values
      ('1', 1, 'Módulo 1', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('2', 2, 'Módulo 2', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('3', 3, 'Módulo 3', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('4', 4, 'Módulo 4', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('5', 5, 'Módulo 5', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('6', 6, 'Módulo 6', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published'),
      ('7', 7, 'Módulo 7', 'Contenido pendiente de definición', 'En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.', '["Objetivo de aprendizaje 1", "Objetivo de aprendizaje 2", "Objetivo de aprendizaje 3", "Objetivo de aprendizaje 4"]'::jsonb, null::integer, 'coming-soon', 'published')
  ) as module_seed(module_key, module_order, title, description, overview, learning_objectives, estimated_duration_minutes, availability, status)
)
insert into public.academy_modules (
  product_id,
  module_key,
  module_order,
  title,
  description,
  overview,
  learning_objectives,
  estimated_duration_minutes,
  availability,
  status,
  published_at
)
select
  academy_product.id,
  seed_modules.module_key,
  seed_modules.module_order,
  seed_modules.title,
  seed_modules.description,
  seed_modules.overview,
  seed_modules.learning_objectives,
  seed_modules.estimated_duration_minutes,
  seed_modules.availability,
  seed_modules.status,
  now()
from academy_product
cross join seed_modules
on conflict (product_id, module_key) do update
set
  module_order = excluded.module_order,
  title = excluded.title,
  description = excluded.description,
  overview = excluded.overview,
  learning_objectives = excluded.learning_objectives,
  estimated_duration_minutes = excluded.estimated_duration_minutes,
  availability = excluded.availability,
  status = excluded.status,
  published_at = coalesce(public.academy_modules.published_at, excluded.published_at);

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
seed_videos as (
  select *
  from (
    values
      ('1', 'modulo-1-video', 1, 'Video principal del Módulo 1', 'Área reservada para el video del módulo.'),
      ('2', 'modulo-2-video', 1, 'Video principal del Módulo 2', 'Área reservada para el video del módulo.'),
      ('3', 'modulo-3-video', 1, 'Video principal del Módulo 3', 'Área reservada para el video del módulo.'),
      ('4', 'modulo-4-video-1', 1, 'Lectura de GEX y fundamentos', 'Área reservada para el video del módulo.'),
      ('4', 'modulo-4-video-2', 2, 'GEXBot: Classic, State y Orderflow', 'Área reservada para el video del módulo.'),
      ('5', 'modulo-5-video', 1, 'Video principal del Módulo 5', 'Área reservada para el video del módulo.'),
      ('6', 'modulo-6-video', 1, 'Video principal del Módulo 6', 'Área reservada para el video del módulo.'),
      ('7', 'modulo-7-video', 1, 'Video principal del Módulo 7', 'Área reservada para el video del módulo.')
  ) as video_seed(module_key, video_key, video_order, title, placeholder)
),
target_modules as (
  select academy_modules.id, academy_modules.module_key
  from public.academy_modules
  join academy_product on academy_product.id = academy_modules.product_id
)
insert into public.academy_module_videos (
  module_id,
  video_key,
  video_order,
  title,
  placeholder,
  status,
  published_at
)
select
  target_modules.id,
  seed_videos.video_key,
  seed_videos.video_order,
  seed_videos.title,
  seed_videos.placeholder,
  'published',
  now()
from seed_videos
join target_modules on target_modules.module_key = seed_videos.module_key
on conflict (module_id, video_key) do update
set
  video_order = excluded.video_order,
  title = excluded.title,
  placeholder = excluded.placeholder,
  status = excluded.status,
  published_at = coalesce(
    public.academy_module_videos.published_at,
    excluded.published_at
  );
