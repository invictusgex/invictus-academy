# Modelo de datos v1 - Invictus Trading Academy

Este documento audita el modelo de datos actual y propone una version v1 estable
para Supabase. No implementa SQL, no crea migraciones y no modifica la base de
datos.

## Alcance de la auditoria

Archivos revisados:

- `supabase/migrations/20260719213351_initial_schema.sql`
- `supabase/config.toml`
- `supabase/README.md`
- `src/lib/types/enrollment.types.ts`
- `src/lib/repositories/enrollment.repository.ts`
- `src/lib/services/enrollment.service.ts`
- referencias a `profiles`, `products`, `enrollments`, `progress`,
  `useAcademyProgress` y `localStorage`.

## Esquema actual real

La base actual esta definida por una sola migracion:

```text
supabase/migrations/20260719213351_initial_schema.sql
```

La migracion crea cuatro tablas:

- `public.profiles`
- `public.products`
- `public.enrollments`
- `public.progress`

Tambien inserta un producto inicial:

```text
title: Trading Basado en Datos
slug: trading-basado-en-datos
status: active
```

### `profiles`

Proposito actual: perfil publico de un usuario autenticado.

Columnas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | ninguno |
| `email` | `text` | si | ninguno |
| `full_name` | `text` | si | ninguno |
| `role` | `text` | no | `'student'` |
| `created_at` | `timestamp with time zone` | no | `now()` |
| `updated_at` | `timestamp with time zone` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `id` referencia `auth.users(id)` con `on delete cascade`.

Restricciones:

- `role not null`.
- No hay `check constraint` para `role`.

Indices:

- Indice implicito por primary key.
- No hay indices declarados adicionales.

Timestamps:

- `created_at` existe.
- `updated_at` existe, pero no hay trigger para mantenerlo automaticamente.

Relaciones:

- `auth.users 1 ---- 1 profiles`
- `profiles 1 ---- * enrollments`
- `profiles 1 ---- * progress`

### `products`

Proposito actual: producto o curso vendible/accesible.

Columnas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `title` | `text` | no | ninguno |
| `slug` | `text` | no | ninguno |
| `description` | `text` | si | ninguno |
| `status` | `text` | no | `'draft'` |
| `created_at` | `timestamp with time zone` | no | `now()` |
| `updated_at` | `timestamp with time zone` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- Ninguna.

Restricciones:

- `slug unique`.
- `title not null`.
- `slug not null`.
- `status not null`.
- No hay `check constraint` para `status`.

Indices:

- Indice implicito por primary key.
- Indice implicito por `unique (slug)`.

Timestamps:

- `created_at` existe.
- `updated_at` existe, pero no hay trigger para mantenerlo automaticamente.

Relaciones:

- `products 1 ---- * enrollments`
- `products 1 ---- * progress`

### `enrollments`

Proposito actual: relacion de acceso entre usuario y producto.

Columnas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `profile_id` | `uuid` | no | ninguno |
| `product_id` | `uuid` | no | ninguno |
| `status` | `text` | no | `'active'` |
| `starts_at` | `timestamp with time zone` | si | ninguno |
| `ends_at` | `timestamp with time zone` | si | ninguno |
| `created_at` | `timestamp with time zone` | no | `now()` |
| `updated_at` | `timestamp with time zone` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `profile_id` referencia `public.profiles(id)` con `on delete cascade`.
- `product_id` referencia `public.products(id)` con `on delete restrict`.

Restricciones:

- `profile_id not null`.
- `product_id not null`.
- `status not null`.
- `unique (profile_id, product_id)`.
- No hay `check constraint` para `status`.
- No hay validacion entre `starts_at` y `ends_at`.

Indices:

- Indice implicito por primary key.
- Indice implicito por `unique (profile_id, product_id)`.
- No hay indice dedicado por `product_id`, `status`, `starts_at` o `ends_at`.

Timestamps:

- `created_at` existe.
- `updated_at` existe, pero no hay trigger para mantenerlo automaticamente.

Relaciones:

- `profiles 1 ---- * enrollments`
- `products 1 ---- * enrollments`

### `progress`

Proposito actual: progreso por leccion/video dentro de producto y modulo.

Columnas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `profile_id` | `uuid` | no | ninguno |
| `product_id` | `uuid` | no | ninguno |
| `module_slug` | `text` | no | ninguno |
| `lesson_slug` | `text` | no | ninguno |
| `status` | `text` | no | `'not_started'` |
| `completed_at` | `timestamp with time zone` | si | ninguno |
| `created_at` | `timestamp with time zone` | no | `now()` |
| `updated_at` | `timestamp with time zone` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `profile_id` referencia `public.profiles(id)` con `on delete cascade`.
- `product_id` referencia `public.products(id)` con `on delete cascade`.

Restricciones:

- `profile_id not null`.
- `product_id not null`.
- `module_slug not null`.
- `lesson_slug not null`.
- `status not null`.
- `unique (profile_id, product_id, module_slug, lesson_slug)`.
- No hay `check constraint` para `status`.

Indices:

- Indice implicito por primary key.
- Indice implicito por `unique (profile_id, product_id, module_slug, lesson_slug)`.
- No hay indice dedicado por `product_id`, `module_slug` o `status`.

Timestamps:

- `created_at` existe.
- `updated_at` existe, pero no hay trigger para mantenerlo automaticamente.

Relaciones:

- `profiles 1 ---- * progress`
- `products 1 ---- * progress`

## Diagrama del esquema actual

```text
auth.users
   |
   +-- profiles
         |
         +-- enrollments ---- products
         |
         +-- progress ------- products
```

## Problemas y limitaciones detectadas

### Productos

- `products` soporta varios productos porque `id` es UUID y `slug` es unico.
- Falta una restriccion para valores permitidos de `status`.
- Falta diferenciar tipo de producto si en el futuro se venden cursos,
  paquetes u ofertas, aunque para v1 no es imprescindible.

### Enrollments

- Un usuario puede tener mas de un enrollment, siempre que sean productos
  distintos.
- Se evita duplicar el mismo producto para el mismo usuario mediante
  `unique (profile_id, product_id)`.
- `status` permite representar cualquier texto, incluyendo estados no validos.
- `status = active` existe como default, pero no hay forma estructurada de
  diferenciar acceso manual, compra, promocion o admin.
- `ends_at` representa expiracion posible, pero el nombre es ambiguo frente a
  `expires_at`.
- No hay `revoked_at`, `revoked_by` ni `access_source`.
- No hay check para asegurar que `ends_at` sea posterior a `starts_at`.
- No hay indice dedicado para queries de acceso activo por usuario/producto.

### Progreso

- `progress` esta relacionado con usuario y producto.
- La tabla actual guarda progreso por `module_slug` y `lesson_slug`, no progreso
  agregado por modulo.
- El nombre `progress` es demasiado generico.
- Si cambia un `module_slug` o `lesson_slug` en el codigo, se rompen las
  asociaciones historicas.
- No hay campo `progress_percent` para progreso agregado.
- No hay `last_seen_at` ni `started_at`.
- `status` no tiene valores restringidos.

### Timestamps

- Todas las tablas tienen `created_at` y `updated_at`.
- No existen triggers para actualizar `updated_at`. Esto cumple el requisito de
  tener el campo, pero exige que la aplicacion o futuras consultas lo mantengan.

### Integridad e indices

- Hay foreign keys basicas correctas.
- Faltan `check constraints` para estados.
- Faltan indices operativos para consultas frecuentes:
  - enrollments por `profile_id`, `product_id`, `status`.
  - progreso por `profile_id`, `product_id`.
  - progreso por `module_slug`.

### RLS y administracion

- No hay RLS todavia, segun el alcance original.
- La estructura puede prepararse para RLS porque `profiles.id` coincide con
  `auth.users.id`.
- Falta modelar operaciones administrativas futuras, especialmente quien crea o
  revoca un enrollment.

### Pagos futuros

- El modelo actual no incluye pagos, ordenes ni transacciones.
- `enrollments` puede soportar accesos manuales si se agrega `access_source`.
- Para pagos futuros conviene vincular `enrollments` a compras mas adelante,
  pero no crear `payments` ni `orders` todavia.

## Modelo v1 recomendado

El modelo v1 debe mantenerse razonable y preparar acceso real sin convertir la
base en un CMS completo. Se recomiendan estas tablas base:

- `profiles`
- `products`
- `enrollments`
- `module_progress`

No se recomienda crear ahora:

- `payments`
- `orders`
- `permissions`
- `certificates`
- `subscriptions`
- `lesson_progress`

Razon: esas tablas dependen de flujos aun no definidos. Agregarlas ahora
aumentaria el costo de migracion y las reglas RLS sin aportar funcionalidad
inmediata.

## Diagrama del modelo v1 recomendado

```text
auth.users
   |
   +-- profiles
         |
         +-- enrollments ----- products
         |
         +-- module_progress - products
```

## Tabla propuesta: `profiles`

Proposito: datos basicos del usuario autenticado y rol interno minimo.

Columnas recomendadas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | ninguno |
| `email` | `text` | si | ninguno |
| `full_name` | `text` | si | ninguno |
| `role` | `text` | no | `'student'` |
| `created_at` | `timestamptz` | no | `now()` |
| `updated_at` | `timestamptz` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `id` referencia `auth.users(id)` con `on delete cascade`.

Unique constraints:

- Ninguna obligatoria para v1. `email` puede venir de `auth.users`.

Check constraints:

- `role in ('student', 'admin')`

Indices:

- Primary key implicita por `id`.
- Opcional: indice por `role` si el panel admin lo necesita.

Comportamiento de eliminacion:

- Si se elimina el usuario auth, se elimina el perfil.

## Tabla propuesta: `products`

Proposito: representar cursos/productos accesibles por enrollment.

Columnas recomendadas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `title` | `text` | no | ninguno |
| `slug` | `text` | no | ninguno |
| `description` | `text` | si | ninguno |
| `status` | `text` | no | `'draft'` |
| `created_at` | `timestamptz` | no | `now()` |
| `updated_at` | `timestamptz` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- Ninguna.

Unique constraints:

- `unique (slug)`

Check constraints:

- `status in ('draft', 'active', 'archived')`

Indices:

- Primary key implicita por `id`.
- Unique index implicito por `slug`.
- Opcional: indice por `status`.

Comportamiento de eliminacion:

- No eliminar productos con enrollments existentes. Usar `status = archived`.

Seed a conservar:

- `Trading Basado en Datos`
- `trading-basado-en-datos`
- `active`

## Tabla propuesta: `enrollments`

Proposito: determinar si un usuario tiene acceso a un producto.

Columnas recomendadas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `profile_id` | `uuid` | no | ninguno |
| `product_id` | `uuid` | no | ninguno |
| `status` | `text` | no | `'active'` |
| `access_source` | `text` | no | `'manual'` |
| `starts_at` | `timestamptz` | no | `now()` |
| `expires_at` | `timestamptz` | si | ninguno |
| `revoked_at` | `timestamptz` | si | ninguno |
| `created_at` | `timestamptz` | no | `now()` |
| `updated_at` | `timestamptz` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `profile_id` referencia `public.profiles(id)` con `on delete cascade`.
- `product_id` referencia `public.products(id)` con `on delete restrict`.

Unique constraints:

- `unique (profile_id, product_id)`

Check constraints:

- `status in ('active', 'revoked', 'expired')`
- `access_source in ('manual', 'purchase', 'promotion')`
- `expires_at is null or expires_at > starts_at`
- `revoked_at is null or status = 'revoked'`

Indices:

- Primary key implicita por `id`.
- Unique index implicito por `(profile_id, product_id)`.
- Indice recomendado: `(profile_id, product_id, status)`.
- Indice recomendado: `(product_id, status)`.
- Indice recomendado: `(expires_at)` para auditorias de expiracion.

Comportamiento de eliminacion:

- Si se elimina el perfil, eliminar enrollments del usuario.
- Si existe enrollment, restringir eliminacion del producto.

Valores permitidos de `status`:

- `active`: acceso potencialmente concedido, sujeto a fechas.
- `revoked`: acceso retirado manual o administrativamente.
- `expired`: acceso vencido. Puede calcularse por fecha o persistirse si se
  decide materializar el estado.

Valores permitidos de `access_source` para v1:

- `manual`: acceso creado manualmente por administrador.
- `purchase`: acceso proveniente de una compra futura.
- `promotion`: acceso concedido por promocion o beca.

No se recomienda `admin` como `access_source` en v1 porque describe quien
ejecuta la accion, no el origen del acceso. Si luego se necesita auditoria, se
puede agregar `created_by` o una tabla de eventos administrativos.

## Regla exacta para conceder acceso

Un enrollment concede acceso cuando se cumplen todas estas condiciones:

```text
status = 'active'
and starts_at <= now()
and (expires_at is null or expires_at > now())
and revoked_at is null
```

Notas:

- `expired` puede derivarse de `expires_at`, pero mantenerlo como estado permite
  auditorias y acciones administrativas simples.
- La aplicacion no debe conceder acceso solo por tener sesion autenticada.
- `profile_id + product_id` debe ser unico para evitar accesos duplicados al
  mismo producto.

## Tabla propuesta: `module_progress`

Proposito: guardar progreso agregado por modulo, por usuario y producto.

Columnas recomendadas:

| Columna | Tipo | Null | Default |
| --- | --- | --- | --- |
| `id` | `uuid` | no | `gen_random_uuid()` |
| `profile_id` | `uuid` | no | ninguno |
| `product_id` | `uuid` | no | ninguno |
| `module_key` | `text` | no | ninguno |
| `status` | `text` | no | `'not_started'` |
| `progress_percent` | `integer` | no | `0` |
| `started_at` | `timestamptz` | si | ninguno |
| `completed_at` | `timestamptz` | si | ninguno |
| `last_seen_at` | `timestamptz` | si | ninguno |
| `created_at` | `timestamptz` | no | `now()` |
| `updated_at` | `timestamptz` | no | `now()` |

Primary key:

- `id`

Foreign keys:

- `profile_id` referencia `public.profiles(id)` con `on delete cascade`.
- `product_id` referencia `public.products(id)` con `on delete cascade`.

Unique constraints:

- `unique (profile_id, product_id, module_key)`

Check constraints:

- `status in ('not_started', 'in_progress', 'completed')`
- `progress_percent >= 0 and progress_percent <= 100`
- `completed_at is null or status = 'completed'`

Indices:

- Primary key implicita por `id`.
- Unique index implicito por `(profile_id, product_id, module_key)`.
- Indice recomendado: `(profile_id, product_id)`.
- Indice recomendado: `(product_id, module_key)`.

Comportamiento de eliminacion:

- Si se elimina el perfil, eliminar progreso del usuario.
- Si se elimina el producto, eliminar progreso asociado. En practica, preferir
  archivar productos antes que borrarlos.

## Estrategia de progreso

### Como identificar un modulo

Para v1 conviene usar `module_key text`, no UUID.

Razon: el contenido del programa vive en TypeScript, no en tablas. No existe una
tabla `modules` con UUID estable. Un `module_key` explicito y estable en codigo
permite asociar progreso sin migrar el contenido a Supabase.

Recomendacion:

- No usar titulos como identificadores.
- No usar slugs generados automaticamente desde textos visibles.
- Usar claves estables como `module-01-contexto`, `module-02-estructura`, o el
  identificador interno ya controlado por el dominio.

### Como asociarlo a un producto

Cada registro debe incluir:

- `profile_id`
- `product_id`
- `module_key`

La unicidad `(profile_id, product_id, module_key)` evita duplicados.

### Como guardar porcentaje o estado

Guardar ambos:

- `status`: estado legible de flujo.
- `progress_percent`: valor agregado para barras y resumen.

El porcentaje debe calcularse desde el cliente o servicio de dominio segun las
lecciones actuales del modulo. Para v1, la fuente de verdad del contenido sigue
en TypeScript.

### Como registrar finalizacion

- `started_at`: primera interaccion relevante.
- `completed_at`: momento de finalizacion del modulo.
- `last_seen_at`: ultima interaccion con el modulo.

### Que ocurre si cambia el contenido del curso

Si se agregan o quitan lecciones, `module_progress` conserva el avance agregado
por modulo. Es menos preciso que lesson-level progress, pero mas resistente en
v1.

Riesgo: si cambia la composicion interna de un modulo, el porcentaje puede quedar
desactualizado. Mitigacion: recalcular `progress_percent` cuando el usuario
vuelva a entrar al modulo o cuando se implemente un proceso de migracion de
contenido.

### Por que no `lesson_progress` ahora

Actualmente el progreso local se maneja a nivel de videos/lecciones, pero crear
`lesson_progress` en Supabase exige definir identificadores estables de leccion,
reglas de migracion y estrategia ante cambios de contenido. Para v1, empezar con
`module_progress` reduce riesgo y cumple el objetivo de progreso por modulo.

## Contenido del curso: TypeScript vs Supabase

### A. Contenido en TypeScript

Ventajas:

- Menor costo inicial.
- Menos superficie de RLS.
- Cambios versionados en Git.
- Mas facil mantener contenido privado inicial sin construir panel admin.
- No requiere CMS ni tablas adicionales.

Riesgos:

- Cambios de contenido requieren deploy.
- El panel administrativo no puede editar modulos sin cambios de codigo.
- Slugs/keys deben cuidarse para no romper progreso.

### B. Contenido en Supabase

Ventajas:

- Permite panel administrativo real.
- Permite editar modulos/lecciones sin deploy.
- Facilita reportes y relaciones con progreso por leccion.

Riesgos:

- Requiere tablas `modules`, `lessons`, posiblemente `resources`.
- Requiere RLS mas delicada.
- Aumenta el alcance antes de tener checkout y administracion listos.
- Puede encarecer el mantenimiento inicial.

### Recomendacion para v1

Mantener contenido del curso en TypeScript durante v1.

La base debe guardar acceso (`enrollments`) y progreso agregado
(`module_progress`). Migrar contenido a Supabase despues, cuando existan:

- panel administrativo;
- identificadores estables de modulo/leccion;
- reglas RLS para contenido;
- necesidad real de editar contenido sin deploy.

## Estrategia futura de Row Level Security

No implementar RLS todavia en esta fase documental. La estrategia recomendada:

### `profiles`

Lectura por alumno:

- Un usuario autenticado puede leer su propio perfil:
  `profiles.id = auth.uid()`.

Escritura por alumno:

- Un usuario puede actualizar campos no sensibles de su perfil, como
  `full_name`.
- No debe poder cambiar `role`.

Operaciones administrativas futuras:

- Usuarios admin pueden leer perfiles.
- Usuarios admin pueden actualizar campos administrativos.

### `products`

Lectura por alumno:

- Productos `status = 'active'` pueden ser publicos si se usan para oferta.
- Si hay productos privados, leer solo mediante enrollment activo.

Escritura por alumno:

- Ninguna.

Operaciones administrativas futuras:

- Admin puede crear, editar y archivar productos.

### `enrollments`

Lectura por alumno:

- Un usuario puede leer sus propios enrollments:
  `enrollments.profile_id = auth.uid()`.

Escritura por alumno:

- Ninguna en v1. Un alumno no debe concederse acceso.

Operaciones administrativas futuras:

- Admin puede crear acceso manual.
- Admin puede revocar acceso.
- Servicio de pagos futuro puede crear o actualizar enrollments mediante clave
  de servicio en backend seguro.

### `module_progress`

Lectura por alumno:

- Un usuario puede leer su propio progreso:
  `module_progress.profile_id = auth.uid()`.

Escritura por alumno:

- Un usuario puede crear/actualizar su propio progreso solo si tiene enrollment
  activo para el producto.

Operaciones administrativas futuras:

- Admin puede leer progreso para soporte/reportes.
- Admin no deberia editar progreso salvo herramientas especificas de soporte.

## Decisiones tomadas

- `products` sigue como catalogo minimo de cursos/productos.
- `enrollments` es la fuente de autorizacion, no `AuthSession`.
- `module_progress` reemplaza conceptualmente a `progress` para v1 porque el
  objetivo inmediato es progreso por modulo.
- El contenido del curso permanece en TypeScript durante v1.
- No se crean tablas de pagos hasta definir proveedor y checkout.
- No se crea `lesson_progress` hasta estabilizar identificadores de leccion.

## Decisiones pospuestas

- Tabla de pagos u ordenes.
- Tabla de recursos.
- Tabla de modulos/lecciones en Supabase.
- Triggers para `updated_at`.
- Auditoria administrativa detallada (`created_by`, `revoked_by`, eventos).
- RLS real y policies SQL.
- Jobs para marcar enrollments expirados.

## Plan para la proxima migracion

No escribir SQL todavia. La proxima migracion deberia planearse asi:

### Conservar

- `profiles`
- `products`
- `enrollments`
- Seed `Trading Basado en Datos`

### Renombrar

- `progress` a `module_progress`, si no hay datos reales que preservar.
- `ends_at` a `expires_at` en `enrollments`.

Si ya existieran datos reales, usar una migracion con copia/transformacion
controlada en vez de rename directo.

### Agregar columnas

En `enrollments`:

- `access_source text not null default 'manual'`
- `expires_at timestamptz`
- `revoked_at timestamptz`

En `module_progress`:

- `module_key text not null`
- `progress_percent integer not null default 0`
- `started_at timestamptz`
- `last_seen_at timestamptz`

### Crear restricciones

- `products.status in ('draft', 'active', 'archived')`
- `profiles.role in ('student', 'admin')`
- `enrollments.status in ('active', 'revoked', 'expired')`
- `enrollments.access_source in ('manual', 'purchase', 'promotion')`
- `enrollments.expires_at is null or enrollments.expires_at > starts_at`
- `module_progress.status in ('not_started', 'in_progress', 'completed')`
- `module_progress.progress_percent between 0 and 100`

### Crear indices

- `enrollments (profile_id, product_id, status)`
- `enrollments (product_id, status)`
- `enrollments (expires_at)`
- `module_progress (profile_id, product_id)`
- `module_progress (product_id, module_key)`

### Mantener seed

Mantener o reinsertar de forma idempotente:

```text
title: Trading Basado en Datos
slug: trading-basado-en-datos
status: active
```

### Riesgos de migracion

- Si `progress` ya contiene datos, renombrar a `module_progress` puede perder
  granularidad de leccion.
- Cambiar `ends_at` a `expires_at` requiere coordinar tipos TypeScript.
- Agregar check constraints puede fallar si existen estados invalidos.
- Activar RLS sin policies completas puede bloquear acceso legitimo.
- Si los module keys actuales no son estables, se debe definir un mapeo antes de
  migrar progreso local.

## Estado final de esta auditoria

Esta auditoria no modifica la base de datos. Solo documenta el esquema actual y
la propuesta v1.
