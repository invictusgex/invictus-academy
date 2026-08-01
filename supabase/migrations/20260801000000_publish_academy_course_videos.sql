-- Invictus Trading Academy - publish official course videos.
-- This migration updates editable CMS content only. It does not change schema.

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
target_modules as (
  select academy_modules.id, academy_modules.module_key
  from public.academy_modules
  join academy_product on academy_product.id = academy_modules.product_id
)
update public.academy_modules
set
  availability = 'available',
  updated_at = now()
from target_modules
where public.academy_modules.id = target_modules.id
  and target_modules.module_key in ('1', '2', '3', '4', '5', '6', '7');

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
target_modules as (
  select academy_modules.id, academy_modules.module_key
  from public.academy_modules
  join academy_product on academy_product.id = academy_modules.product_id
),
official_videos as (
  select *
  from (
    values
      (
        '1',
        'modulo-1-video',
        1,
        'Fundamentos del Mercado Basado en Datos',
        'qu3VkXQMbfQ'
      ),
      (
        '2',
        'modulo-2-video',
        1,
        'Mecánicas Reales del Mercado',
        '_JKt1_DL43w'
      ),
      (
        '3',
        'modulo-3-video',
        1,
        'Opciones, Gamma y Posicionamiento Institucional',
        'aLidpQUOg9o'
      ),
      (
        '4',
        'modulo-4-video-1',
        1,
        'Lectura de GEX',
        'wHE-TzqnfAc'
      ),
      (
        '4',
        'modulo-4-video-2',
        2,
        'Conociendo GEXBot',
        'Huh1LVMvLAE'
      ),
      (
        '5',
        'modulo-5-video',
        1,
        'Order Flow, Perfil de Volumen',
        'pCauB9ADr4I'
      ),
      (
        '6',
        'modulo-6-video',
        1,
        'Construcción de Escenarios de Alta Probabilidad',
        '3ORNmK5MOYA'
      ),
      (
        '7',
        'modulo-7-video',
        1,
        'Profesionalización y Gestión del Riesgo',
        'o3IX2IZj_Ig'
      )
  ) as video_seed(
    module_key,
    video_key,
    video_order,
    title,
    provider_video_id
  )
),
published_video_content as (
  select
    target_modules.id as module_id,
    official_videos.video_key,
    official_videos.video_order,
    official_videos.title,
    'Contenido exclusivo para alumnos de Invictus GEX Academy.' || chr(10) ||
      chr(10) ||
      'Queda prohibida su distribución, reproducción o comercialización sin autorización expresa.' ||
      chr(10) ||
      chr(10) ||
      '© Invictus GEX. Todos los derechos reservados.' as description,
    official_videos.provider_video_id
  from official_videos
  join target_modules on target_modules.module_key = official_videos.module_key
)
insert into public.academy_module_videos (
  module_id,
  video_key,
  video_order,
  title,
  description,
  placeholder,
  provider,
  provider_video_id,
  status,
  published_at
)
select
  published_video_content.module_id,
  published_video_content.video_key,
  published_video_content.video_order,
  published_video_content.title,
  published_video_content.description,
  '',
  'youtube',
  published_video_content.provider_video_id,
  'published',
  now()
from published_video_content
on conflict (module_id, video_key) do update
set
  video_order = excluded.video_order,
  title = excluded.title,
  description = excluded.description,
  placeholder = excluded.placeholder,
  provider = excluded.provider,
  provider_video_id = excluded.provider_video_id,
  status = excluded.status,
  published_at = coalesce(
    public.academy_module_videos.published_at,
    excluded.published_at
  ),
  updated_at = now();
