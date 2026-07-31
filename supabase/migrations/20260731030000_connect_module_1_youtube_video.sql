-- Invictus Trading Academy - connect first real module video.
-- This migration updates editable CMS content only. It does not change schema.

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
target_module as (
  select academy_modules.id
  from public.academy_modules
  join academy_product on academy_product.id = academy_modules.product_id
  where academy_modules.module_key = '1'
)
update public.academy_modules
set
  availability = 'available',
  updated_at = now()
from target_module
where public.academy_modules.id = target_module.id;

with academy_product as (
  select id
  from public.products
  where slug = 'trading-basado-en-datos'
),
target_module as (
  select academy_modules.id
  from public.academy_modules
  join academy_product on academy_product.id = academy_modules.product_id
  where academy_modules.module_key = '1'
)
update public.academy_module_videos
set
  placeholder = '',
  provider = 'youtube',
  provider_video_id = 'Y8_dohq1Y-Q',
  status = 'published',
  published_at = coalesce(public.academy_module_videos.published_at, now()),
  updated_at = now()
from target_module
where public.academy_module_videos.module_id = target_module.id
  and public.academy_module_videos.video_key = 'modulo-1-video';
