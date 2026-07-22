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
- subir archivos;
- duplicar modulos;
- editor de texto enriquecido;
- autosave.

## Administracion De Videos

La fase 5C agrega gestion administrativa de registros de
`academy_module_videos`. Los videos pertenecen directamente a un modulo y no son
unidades de progreso.

Operaciones implementadas:

- crear video;
- editar video;
- cambiar posicion;
- cambiar estado;
- eliminar video con validaciones;
- normalizar posiciones despues de crear, mover o eliminar.

No se agrega progreso por video.

### Campos editables de video

Solo se permite actualizar:

- `title`
- `provider`
- `provider_video_id`
- `duration_seconds`
- `thumbnail_url`
- `video_order`
- `status`

No se permite editar desde el formulario:

- `id`
- `module_id`
- `video_key`
- `created_at`
- `updated_at`
- `published_at` directamente

### Proveedores

`provider` no tiene constraint cerrada en la tabla. La administracion acepta:

- `youtube`
- `vimeo`
- `bunny`
- `external`

No se almacena codigo embed arbitrario. Para `external`, el identificador debe
ser una URL `http` o `https`.

### Generacion de `video_key`

El servicio genera `video_key` al crear videos. Usa una version normalizada del
titulo y controla colisiones dentro del modulo con sufijos numericos.

El administrador no edita `video_key` directamente.

### Orden

`video_order` debe ser entero mayor que cero y es unico por modulo.

El servicio coordina el reordenamiento. Para evitar violar
`unique (module_id, video_order)`, las posiciones se actualizan en dos fases:

1. posiciones temporales;
2. posiciones finales consecutivas.

Al crear sin posicion explicita, se usa la siguiente posicion disponible.

### Publicacion de videos

`published_at` no se edita manualmente.

La constraint real de `academy_module_videos` exige:

```text
published_at is null or status = 'published'
```

Por eso:

- si el video cambia a `published` y no tiene fecha, se asigna la fecha actual;
- si sigue `published`, conserva `published_at`;
- si cambia a `draft` o `archived`, `published_at` se guarda como `null`.

### Eliminacion

La eliminacion solo aplica a `academy_module_videos`.

Reglas:

- no se puede eliminar el unico video de un modulo publicado;
- si el modulo tiene mas de un video, se permite eliminar;
- eliminar un video no elimina el modulo;
- eliminar un video no elimina progreso;
- despues de eliminar, las posiciones se normalizan para quedar consecutivas.

### RLS de videos

La migracion `20260721002000_admin_content_video_write_policies.sql` agrega:

- `INSERT` solo para usuarios en `public.admin_users`;
- `UPDATE` solo para usuarios en `public.admin_users`;
- `DELETE` solo para usuarios en `public.admin_users`.

No amplia permisos de alumnos.
No modifica policies anteriores.

### Pendiente

Queda fuera:

- progreso por video;
- reproduccion avanzada;
- analytics;
- carga directa de archivos de video;
- integracion con servicios de streaming;
- gestion de recursos;
- drag and drop;
- duplicar videos.

## Administracion De Recursos

La fase 5D agrega gestion administrativa de registros de `academy_resources`.
Cada recurso pertenece directamente a un modulo. No existen carpetas, categorias,
etiquetas ni permisos individuales.

Operaciones implementadas:

- crear recurso;
- editar recurso;
- cambiar posicion;
- cambiar estado;
- eliminar recurso;
- normalizar posiciones despues de crear, mover o eliminar.

La gestion de recursos no modifica `academy_modules`, `academy_module_videos`,
`module_progress`, enrollments ni autenticacion.

### Campos editables de recurso

Solo se permite actualizar:

- `title`
- `description`
- `resource_type`
- `url`
- `storage_path`
- `resource_order`
- `status`

No se permite editar desde el formulario:

- `id`
- `module_id`
- `resource_key`
- `metadata`
- `created_at`
- `updated_at`
- `published_at` directamente

`metadata` se guarda como objeto JSON vacio en esta version. `updated_at` se
mantiene mediante trigger. `published_at` se administra desde el servicio.

### Tipos de recurso

`resource_type` esta limitado por la constraint real
`academy_resources_type_check`:

- `pdf`
- `link`
- `template`
- `downloadable`
- `other`

No se almacena HTML arbitrario ni se renderiza marcado HTML directo.

### Validaciones de recursos

El formulario y el servicio validan:

- `title` obligatorio, maximo 160 caracteres.
- `description` opcional, maximo 500 caracteres.
- `resource_type` limitado a los tipos soportados por la constraint.
- `resource_order` entero mayor que cero.
- `status` limitado a `draft`, `published` y `archived`.
- `url` opcional, pero si existe debe ser `http` o `https`.
- `storage_path` opcional, maximo 500 caracteres.
- debe existir al menos `url` o `storage_path`.
- no se aceptan caracteres de marcado HTML en campos editables.

El servicio normaliza espacios innecesarios antes de guardar.

### Generacion de `resource_key`

El servicio genera `resource_key` al crear recursos. Usa una version normalizada
del titulo y controla colisiones dentro del modulo con sufijos numericos.

El administrador no edita `resource_key` directamente.

### Orden de recursos

`resource_order` debe ser entero mayor que cero y es unico por modulo.

El servicio coordina el reordenamiento. Para evitar violar
`unique (module_id, resource_order)`, las posiciones se actualizan en dos fases:

1. posiciones temporales;
2. posiciones finales consecutivas.

Al crear sin posicion explicita, se usa la siguiente posicion disponible.

### Publicacion de recursos

`published_at` no se edita manualmente.

La constraint real de `academy_resources` exige:

```text
published_at is null or status = 'published'
```

Por eso:

- si el recurso cambia a `published` y no tiene fecha, se asigna la fecha actual;
- si sigue `published`, conserva `published_at`;
- si cambia a `draft` o `archived`, `published_at` se guarda como `null`.

### Eliminacion de recursos

La eliminacion solo aplica a `academy_resources`.

Reglas:

- eliminar un recurso no elimina el modulo;
- eliminar un recurso no elimina videos;
- eliminar un recurso no elimina progreso;
- despues de eliminar, las posiciones se normalizan para quedar consecutivas.

### RLS de recursos

La migracion `20260721003000_admin_content_resource_write_policies.sql` agrega:

- `INSERT` solo para usuarios en `public.admin_users`;
- `UPDATE` solo para usuarios en `public.admin_users`;
- `DELETE` solo para usuarios en `public.admin_users`.

No amplia permisos de alumnos.
No modifica policies anteriores.

### Pendiente

Queda fuera:

- carpetas;
- categorias;
- etiquetas;
- analytics;
- comentarios;
- permisos individuales;
- carga directa de archivos;
- drag and drop;
- duplicar recursos.

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
