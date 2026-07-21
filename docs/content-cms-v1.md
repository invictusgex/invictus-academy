# Content CMS v1

Esta fase introduce el motor de contenido académico de Invictus Trading Academy
en Supabase. No agrega pantallas de edición, no cambia autenticación, no cambia
`RequireEnrollment`, no cambia `ProgressProvider` y no cambia
`module_progress`.

## Arquitectura

El contenido se consulta con la misma separación usada por el resto del proyecto:

```text
UI / Server Components
  |
src/lib/academy.ts
  |
AcademyContentService
  |
AcademyContentRepository
  |
Supabase Client
```

Los componentes React no consultan Supabase directamente. El punto público de
lectura sigue siendo `src/lib/academy.ts`, que ahora delega en
`AcademyContentService`.

## Flujo

1. Una página o layout pide el programa con `getAcademyProgram()`.
2. `AcademyContentService` consulta `AcademyContentRepository`.
3. El repository lee `products`, `academy_modules`, `academy_module_videos` y
   `academy_resources`.
4. El servicio transforma filas SQL al contrato existente `Course` / `Module`.
5. Si Supabase no está configurado, las tablas no existen, ocurre un error o no
   hay módulos, se devuelve el contenido hardcodeado actual.

## Tablas

### `academy_modules`

Representa la unidad académica. También es la unidad de progreso.

Campos principales:

- `product_id`
- `module_key`
- `module_order`
- `title`
- `description`
- `overview`
- `learning_objectives`
- `estimated_duration_minutes`
- `availability`
- `status`
- `published_at`
- `created_at`
- `updated_at`

Restricciones principales:

- `unique (product_id, module_key)`
- `unique (product_id, module_order)`
- `module_order > 0`
- `availability in ('available', 'coming-soon')`
- `status in ('draft', 'published', 'archived')`
- `learning_objectives` debe ser un arreglo JSON.

### `academy_module_videos`

Cada fila representa un video de un módulo. Los videos no guardan progreso y no
representan sesiones.

Campos principales:

- `module_id`
- `video_key`
- `video_order`
- `title`
- `description`
- `provider`
- `provider_video_id`
- `duration_seconds`
- `thumbnail_url`
- `placeholder`
- `status`
- `published_at`
- `created_at`
- `updated_at`

Restricciones principales:

- `unique (module_id, video_key)`
- `unique (module_id, video_order)`
- `video_order > 0`
- `status in ('draft', 'published', 'archived')`

### `academy_resources`

Cada recurso pertenece directamente a un módulo.

Campos principales:

- `module_id`
- `resource_key`
- `resource_order`
- `title`
- `description`
- `resource_type`
- `url`
- `storage_path`
- `metadata`
- `status`
- `published_at`
- `created_at`
- `updated_at`

Tipos soportados:

- `pdf`
- `link`
- `template`
- `downloadable`
- `other`

## Repositories

`AcademyContentRepository` encapsula todas las consultas a Supabase:

- `getProductBySlug(slug)`
- `listProgramContent(productSlug)`
- `getModuleContent(productSlug, moduleKey)`

El repository no decide fallback visual. Si Supabase no está disponible o una
consulta falla, lanza error para que el servicio resuelva.

## Services

`AcademyContentService` expone:

- `getProgram(productSlug)`
- `getModules(productSlug)`
- `getModule(moduleKey, productSlug)`
- `getModuleVideos(moduleKey, productSlug)`
- `getModuleResources(moduleKey, productSlug)`

El servicio conserva las claves editoriales:

- `academy_modules.module_key` se convierte en `Module.id`.
- `academy_module_videos.video_key` se convierte en `ModuleVideo.id`.
- `academy_resources.resource_key` se convierte en `ModuleResource.id`.

Esto evita romper el progreso existente.

## Fallback

El fallback usa el contenido actual de:

```text
src/content/programs/trading-basado-en-datos
```

Se activa cuando:

- Supabase no está configurado.
- Las tablas CMS no existen.
- La consulta falla.
- Supabase responde sin módulos.

Mientras el CMS no tenga datos aplicados, el usuario mantiene la misma
experiencia visible.

## RLS

La migración habilita RLS en:

- `academy_modules`
- `academy_module_videos`
- `academy_resources`

Reglas:

- Lectura pública/autenticada: solo contenido `published`.
- Administradores: lectura de todo el contenido mediante `admin_users`.

La lectura inicial no agregaba policies de escritura. La edicion administrativa
de informacion general de modulos agrega una policy especifica de `UPDATE`
documentada abajo.

## Escritura Administrativa De Modulos

La fase 5B agrega edición administrativa de informacion general de
`academy_modules`. No agrega creación, eliminación, duplicación, reordenamiento
ni edición de videos o recursos.

La escritura queda encapsulada en:

```text
AdminContentService
  |
AdminContentRepository.updateModuleGeneralInfo()
  |
Supabase Client
```

Los componentes y rutas no importan Supabase directamente.

### Campos editables

Solo se permite actualizar:

- `title`
- `description`
- `overview`
- `learning_objectives`
- `estimated_duration_minutes`
- `availability`
- `status`

### Campos protegidos

No se permite editar desde el formulario:

- `id`
- `product_id`
- `module_key`
- `module_order`
- `created_at`
- `updated_at`
- `published_at` directamente

`updated_at` se mantiene mediante trigger. `published_at` se administra desde el
servicio.

### Validaciones

El formulario y el servicio validan:

- `title` obligatorio, maximo 160 caracteres.
- `description` opcional, maximo 500 caracteres.
- `overview` opcional, maximo 2000 caracteres.
- `learning_objectives` como arreglo de textos no vacios.
- maximo 20 objetivos.
- cada objetivo con maximo 180 caracteres.
- `estimated_duration_minutes` entero no negativo o `null`.
- `availability` limitado a `available` y `coming-soon`.
- `status` limitado a `draft`, `published` y `archived`.

El servicio normaliza espacios innecesarios antes de guardar.

### Regla de publicacion

`published_at` no se edita manualmente.

La constraint real de `academy_modules` exige:

```text
published_at is null or status = 'published'
```

Por eso la regla efectiva es:

- Si el modulo cambia a `published` y `published_at` esta vacio, se asigna la
  fecha actual.
- Si el modulo sigue en `published`, se conserva `published_at`.
- Si el modulo cambia a `draft` o `archived`, `published_at` se guarda como
  `null` para respetar la constraint aplicada.

### RLS de UPDATE

La migración `20260721001000_admin_content_module_update_policy.sql` agrega una
policy de `UPDATE` solo para usuarios autenticados presentes en
`public.admin_users`.

No agrega `INSERT`.
No agrega `DELETE`.
No amplía permisos de alumnos.

### Funciones aun no implementadas

Quedan fuera de esta fase:

- crear modulos;
- eliminar modulos;
- archivar mediante accion separada;
- reordenar modulos;
- editar videos;
- editar recursos;
- subir archivos;
- duplicar modulos;
- editor de texto enriquecido;
- autosave.

## Compatibilidad Con Progreso

`module_progress` no cambia.

El progreso sigue siendo por:

```text
profile_id + product_id + module_key
```

Los videos no tienen progreso remoto. El Módulo 4 puede tener dos videos, pero
continúa siendo un único módulo académico y un único módulo de progreso.

La cache local puede seguir guardando estado por video para preservar la
experiencia actual, pero Supabase conserva solo el progreso agregado por módulo.

## Migración Desde Contenido Hardcodeado

La migración `20260721000000_content_cms_v1.sql` crea las tablas y siembra el
contenido actual del programa `trading-basado-en-datos`.

Los IDs visibles se conservan como claves:

- módulos: `1` a `7`
- videos: `modulo-1-video`, `modulo-4-video-1`, etc.

El Módulo 4 se siembra como una fila en `academy_modules` y dos filas ordenadas
en `academy_module_videos`.
