# Revision de migracion database model v1

## Archivo de migracion creado

```text
supabase/migrations/20260720000000_database_model_v1.sql
```

## Migracion de RLS v1

```text
supabase/migrations/20260720001000_rls_policies_v1.sql
```

Esta migracion agrega las policies minimas para que la aplicacion pueda leer
productos activos, verificar enrollments propios y preparar lectura/actualizacion
del progreso propio en `module_progress`.

No crea policies para `profiles`, no desactiva RLS y no habilita operaciones de
escritura para `products` ni `enrollments`.

Policies definidas:

- `products_authenticated_read_active`: usuarios autenticados pueden leer
  productos con `status = 'active'`.
- `enrollments_authenticated_read_own`: usuarios autenticados pueden leer solo
  filas con `profile_id = auth.uid()`.
- `module_progress_authenticated_read_own`: usuarios autenticados pueden leer
  solo su propio progreso.
- `module_progress_authenticated_update_own`: usuarios autenticados pueden
  actualizar solo su propio progreso.

## Operaciones realizadas

- Mantiene `profiles`, `products` y `enrollments`.
- Transforma `progress` en `module_progress`.
- Agrega checks de estado y origen de acceso.
- Agrega indices operativos para enrollments y progreso por modulo.
- Agrega funcion reutilizable `public.set_updated_at()`.
- Agrega triggers de `updated_at` para:
  - `profiles`
  - `products`
  - `enrollments`
  - `module_progress`

## Datos preservados

- El seed existente de `products` no se modifica.
- `enrollments.ends_at` se copia a `enrollments.expires_at` antes de eliminar
  `ends_at`.
- `progress` se renombra a `module_progress` cuando existe.
- Los datos de progreso por leccion se agregan por modulo antes de eliminar
  `lesson_slug`.

## Columnas renombradas

- `progress.module_slug` pasa a `module_progress.module_key`.
- `enrollments.ends_at` se reemplaza por `enrollments.expires_at` mediante copia
  de datos y posterior eliminacion de `ends_at`.

## Columnas anadidas

En `enrollments`:

- `access_source text not null default 'manual'`
- `expires_at timestamptz`
- `revoked_at timestamptz`

En `module_progress`:

- `progress_percent integer not null default 0`
- `started_at timestamptz`
- `last_seen_at timestamptz`

## Columnas eliminadas

- `enrollments.ends_at`, despues de copiar datos a `expires_at`.
- `module_progress.lesson_slug`, despues de agregar filas por modulo.

## Restricciones anadidas

- `profiles_role_check`
- `products_status_check`
- `enrollments_status_check`
- `enrollments_access_source_check`
- `enrollments_expires_after_starts_check`
- `enrollments_revoked_at_status_check`
- `module_progress_profile_product_module_key_key`
- `module_progress_status_check`
- `module_progress_percent_check`
- `module_progress_completed_status_check`

## Indices anadidos

- `products_status_idx`
- `enrollments_profile_id_status_idx`
- `enrollments_product_status_idx`
- `enrollments_expires_at_idx`
- `module_progress_product_module_key_idx`

## Triggers anadidos

- `set_profiles_updated_at`
- `set_products_updated_at`
- `set_enrollments_updated_at`
- `set_module_progress_updated_at`

Todos ejecutan `public.set_updated_at()`.

## Riesgos

- Si `progress` tiene multiples lecciones por modulo, la migracion conserva un
  registro agregado por modulo y elimina detalle por leccion.
- Si existen valores invalidos en `status`, se normalizan antes de crear checks.
- Si existen `expires_at` heredados menores o iguales a `starts_at`, se ajustan
  a `starts_at + interval '1 second'` para permitir la restriccion temporal.
- La migracion no activa RLS. Aplicarla en un entorno con politicas esperadas
  requiere una migracion posterior de seguridad.
- Si una tabla `module_progress` ya existe con una forma distinta, debe revisarse
  manualmente antes de aplicar esta migracion.

## Instrucciones de revision manual

Antes de aplicar:

1. Confirmar que solo existe la migracion inicial previa.
2. Revisar si `public.progress` contiene datos reales.
3. Si hay datos reales por leccion, aceptar explicitamente la agregacion por
   modulo o preparar una exportacion antes de aplicar.
4. Confirmar que los estados existentes son compatibles o pueden normalizarse.
5. Confirmar que no se requiere RLS en la misma entrega.

## Como verificar despues de aplicarla

Ejecutar consultas de inspeccion:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'products', 'enrollments', 'module_progress')
order by table_name, ordinal_position;

select conname
from pg_constraint
where conrelid in (
  'public.profiles'::regclass,
  'public.products'::regclass,
  'public.enrollments'::regclass,
  'public.module_progress'::regclass
)
order by conname;
```

Verificar seed:

```sql
select title, slug, status
from public.products
where slug = 'trading-basado-en-datos';
```

## Estrategia de rollback manual

No hay rollback automatico. Si hiciera falta revertir:

1. Restaurar desde backup/snapshot previo.
2. Si no hay backup, renombrar `module_progress` a `progress` solo si se acepta
   que el detalle por leccion ya no existe.
3. Recrear `lesson_slug` no recupera datos por leccion eliminados.
4. Recrear `ends_at` desde `expires_at` es posible:
   `alter table public.enrollments add column ends_at timestamptz;`
   y luego copiar `expires_at`.
5. Eliminar triggers y constraints v1 manualmente si se vuelve al esquema
   anterior.

Recomendacion: aplicar primero en entorno local o staging con backup.

## Final static audit

### Problemas encontrados

- Se detectaron indices redundantes:
  - `enrollments_profile_id_idx` estaba cubierto por la restriccion unica
    existente `unique (profile_id, product_id)`.
  - `enrollments_product_id_idx` estaba cubierto por el indice compuesto
    `enrollments_product_status_idx`.
  - `enrollments_profile_product_status_idx` era redundante porque la unicidad
    `(profile_id, product_id)` ya resuelve esa busqueda y `status` puede
    filtrarse despues.
  - `module_progress_profile_id_idx` y `module_progress_profile_product_idx`
    estaban cubiertos por la restriccion unica
    `(profile_id, product_id, module_key)`.
  - `module_progress_product_id_idx` estaba cubierto por
    `module_progress_product_module_key_idx`.
- No se encontraron choques con constraints creadas por la migracion inicial.
- No se encontraron referencias a RLS o policies.
- No se encontraron valores divergentes entre SQL y TypeScript para
  `EnrollmentStatus` o `EnrollmentAccessSource`.

### Correcciones realizadas

- Se eliminaron de la migracion los indices redundantes listados arriba.
- Se mantuvieron solo indices con utilidad clara:
  - busquedas de enrollments por usuario y estado;
  - busquedas de enrollments por producto y estado;
  - auditoria por expiracion;
  - busquedas de progreso por producto y modulo.

### Indices eliminados por redundancia

- `enrollments_profile_id_idx`
- `enrollments_product_id_idx`
- `enrollments_profile_product_status_idx`
- `module_progress_profile_id_idx`
- `module_progress_product_id_idx`
- `module_progress_profile_product_idx`

### Datos potencialmente afectados

- `progress.lesson_slug` se elimina. Antes de eliminarlo, los registros se
  agregan por `(profile_id, product_id, module_key)`. Esto conserva progreso por
  modulo, pero elimina granularidad historica por leccion.
- Estados desconocidos se normalizan:
  - enrollments desconocidos pasan a `active`;
  - `inactive` y `cancelled` pasan a `revoked`;
  - progress desconocido pasa a `not_started`.
- Fechas `expires_at <= starts_at` se ajustan a
  `starts_at + interval '1 second'` para permitir la restriccion temporal.
- Si `revoked_at` existe en un registro, `status` se normaliza a `revoked`.

### Orden de ejecucion validado

1. Se crea o reemplaza `public.set_updated_at()`.
2. Se normalizan roles antes de crear `profiles_role_check`.
3. Se normalizan productos antes de crear `products_status_check`.
4. Se agregan `access_source`, `expires_at` y `revoked_at` antes de backfills.
5. Se copia `ends_at` a `expires_at` antes de eliminar `ends_at`.
6. Se normalizan `starts_at`, `status`, `access_source`, `revoked_at` y
   `expires_at` antes de crear checks de `enrollments`.
7. Se renombra `progress` a `module_progress` antes de usar la tabla nueva.
8. Se renombra `module_slug` a `module_key` antes de agregar por modulo.
9. Se agregan columnas de progreso antes de calcular `progress_percent`,
   `started_at` y `last_seen_at`.
10. Se agregan duplicados por modulo y se eliminan filas sobrantes antes de crear
    `unique (profile_id, product_id, module_key)`.
11. Se elimina `lesson_slug` despues de resolver la agregacion.
12. Se crean checks e indices finales.
13. Se recrean triggers `before update` con nombres estables.

### Resultado final

La migracion queda preparada para ejecutarse sobre el esquema de
`20260719213351_initial_schema.sql` sin depender de tablas imaginadas. La tabla
`progress` inicial existe, se renombra antes de usar `module_progress`, y las
columnas `module_slug`, `lesson_slug` y `ends_at` se usan solo durante la fase
de transformacion.

### Transaccionalidad

No se agrega `begin; ... commit;` manual. Supabase CLI aplica migraciones dentro
de su propio flujo de migraciones; envolver manualmente puede interferir con
herramientas que ya gestionan transacciones o con operaciones que el runner
espera controlar.

### Limitaciones de no haber ejecutado la migracion

- Esta revision no valida locks, tiempos de ejecucion ni volumen real de datos.
- No valida nombres auto-generados de constraints en una base que haya sido
  modificada manualmente fuera de las migraciones.
- No sustituye una prueba local/staging con backup.

### Esquema final esperado

`profiles`:

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text`
- `full_name text`
- `role text not null default 'student'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `profiles_role_check`
- trigger `set_profiles_updated_at`

`products`:

- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `slug text not null unique`
- `description text`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `products_status_check`
- `products_status_idx`
- trigger `set_products_updated_at`

`enrollments`:

- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `product_id uuid not null references products(id) on delete restrict`
- `status text not null default 'active'`
- `access_source text not null default 'manual'`
- `starts_at timestamptz not null default now()`
- `expires_at timestamptz`
- `revoked_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (profile_id, product_id)`
- checks:
  - `enrollments_status_check`
  - `enrollments_access_source_check`
  - `enrollments_expires_after_starts_check`
  - `enrollments_revoked_at_status_check`
- indices:
  - `enrollments_profile_id_status_idx`
  - `enrollments_product_status_idx`
  - `enrollments_expires_at_idx`
- trigger `set_enrollments_updated_at`

`module_progress`:

- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references profiles(id) on delete cascade`
- `product_id uuid not null references products(id) on delete cascade`
- `module_key text not null`
- `status text not null default 'not_started'`
- `progress_percent integer not null default 0`
- `started_at timestamptz`
- `completed_at timestamptz`
- `last_seen_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (profile_id, product_id, module_key)`
- checks:
  - `module_progress_status_check`
  - `module_progress_percent_check`
  - `module_progress_completed_status_check`
- index `module_progress_product_module_key_idx`
- trigger `set_module_progress_updated_at`
