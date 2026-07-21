# Admin panel v1

Este documento describe la fundacion del Panel Administrativo v1 de Invictus
Trading Academy.

## Objetivo

Crear una base segura para proteger `/admin` y preparar la futura gestion de
alumnos, accesos, productos y progreso, sin implementar todavia operaciones
administrativas de escritura desde la aplicacion.

## Arquitectura

```text
RequireAuth
  |
AdminProvider
  |
RequireAdmin
  |
AdminLayout
  |
/admin
```

Responsabilidades:

- `AdminRepository`: consulta Supabase para comprobar si el usuario autenticado
  actual existe en `public.admin_users`.
- `AdminService`: expone `isCurrentUserAdmin()`.
- `AdminProvider`: mantiene `loading`, `isAdmin` y `refreshAdminStatus()`.
- `RequireAdmin`: bloquea `/admin` si el usuario no es administrador.
- `AdminShell`: presenta la estructura visual inicial del panel.

Los componentes React no importan `service_role` ni acceden directamente a
Supabase. El acceso a datos administrativos pasa por service y repository.

## Tabla admin_users

Migracion:

```text
supabase/migrations/20260720003000_admin_users.sql
```

Estructura:

```sql
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id)
);
```

`user_id` representa al usuario autorizado como administrador.

## RLS

RLS queda activado en `public.admin_users`.

Policy creada:

```sql
create policy admin_users_authenticated_read_own
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());
```

Esta policy permite que un usuario autenticado compruebe solo si su propio
`user_id` existe en `admin_users`.

No se crean policies de cliente para:

- `insert`
- `update`
- `delete`
- listar administradores completos

## Primer administrador

La migracion no crea administradores automaticamente. El primer administrador
debe agregarse manualmente desde el SQL Editor de Supabase usando un `user_id`
real obtenido desde `auth.users`.

Ejemplo:

```sql
insert into public.admin_users (user_id, created_by)
values ('USER_ID_DEL_ADMIN', null)
on conflict (user_id) do nothing;
```

No usar emails hardcodeados como control principal de seguridad en el frontend.

## Retirar un administrador

La retirada debe hacerse manualmente desde SQL Editor o desde una futura
herramienta administrativa segura:

```sql
delete from public.admin_users
where user_id = 'USER_ID_DEL_ADMIN';
```

La aplicacion cliente no tiene policy para ejecutar este `delete`.

## Por que no se usa service_role en navegador

`service_role` ignora RLS y permite acciones privilegiadas. Por eso nunca debe
exponerse en componentes React, variables `NEXT_PUBLIC_` ni codigo enviado al
navegador.

El panel v1 usa la anon key publica junto con RLS para comprobar unicamente si
el usuario autenticado actual tiene una fila propia en `admin_users`.

## Flujo de acceso

- Usuario no autenticado: `RequireAuth` redirige a `/login`.
- Usuario autenticado no administrador: `RequireAdmin` redirige a `/academy`.
- Usuario administrador: se muestra `/admin`.
- El enlace visual a `/admin` se muestra en la navegacion privada solo cuando
  `isAdmin` es `true`.

Ocultar el enlace no sustituye la proteccion de ruta. `/admin` permanece
protegido aunque se escriba la URL directamente.

## Siguientes fases

- Listado de alumnos.
- Vista de enrollments.
- Acciones administrativas seguras para conceder o revocar acceso.
- Auditoria de operaciones administrativas.
- Gestion de productos academicos.

## Fase 2: alumnos de solo lectura

Rutas creadas:

- `/admin/students`
- `/admin/students/[userId]`

El modulo administrativo de alumnos consulta:

- `profiles`: identificador, email, nombre y fecha de alta.
- `enrollments`: cursos inscritos, estado y fecha de inscripcion.
- `products`: titulo, slug y estado del producto.
- `module_progress`: progreso por modulo y ultima actividad.

`auth.users` no se consulta desde el cliente.

La capa de lectura queda organizada asi:

```text
AdminStudentsPage / AdminStudentDetailPage
  |
AdminStudentsService
  |
AdminStudentsRepository
  |
Supabase Client
```

Las pantallas no ejecutan acciones de escritura. El listado incluye busqueda,
ordenacion basica y paginacion preparada.

## Policies admin de lectura

Migracion propuesta:

```text
supabase/migrations/20260720004000_admin_read_policies.sql
```

Esta migracion agrega acceso administrativo de solo lectura para:

- `products`
- `profiles`
- `enrollments`
- `module_progress`

La condicion usada es:

```sql
exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
)
```

No se agregan permisos administrativos de escritura.

La migracion no fue ejecutada desde la aplicacion.

## Fase 3: gestion de accesos

Ruta creada:

- `/admin/access`

La gestion de accesos permite a un administrador:

- conceder acceso a un producto activo;
- revocar un enrollment sin eliminarlo;
- reactivar un enrollment revocado o expirado;
- definir o limpiar una fecha de vencimiento;
- consultar el resultado actualizado despues de cada accion.

No se implementa administracion de productos en esta fase.

## Arquitectura de enrollments administrativos

```text
AdminAccessManager
  |
AdminEnrollmentsService
  |
AdminEnrollmentsRepository
  |
Supabase Client
```

Tipos:

- `AdminEnrollment`
- `GrantEnrollmentInput`
- `RevokeEnrollmentInput`
- `ReactivateEnrollmentInput`
- `UpdateEnrollmentExpirationInput`
- `EnrollmentMutationResult`
- `EnrollmentAccessStatus`

Repository:

- obtiene enrollment por `user_id + product_id`;
- obtiene enrollment por id;
- crea enrollment activo;
- actualiza estado, `revoked_at` y `expires_at`;
- lista productos activos asignables;
- lista enrollments de un alumno.

Service:

- valida `userId`, `productId` y `enrollmentId`;
- valida que la fecha de vencimiento sea futura cuando existe;
- evita duplicados usando el enrollment existente;
- mantiene operaciones idempotentes;
- devuelve errores controlados para la UI.

## Flujo para conceder acceso

1. El administrador selecciona un alumno.
2. Selecciona un producto activo asignable.
3. Opcionalmente define `expires_at` futuro.
4. El service consulta si ya existe enrollment para `profile_id + product_id`.
5. Si no existe, crea uno con:
   - `status = active`
   - `access_source = manual`
   - `starts_at = now`
   - `revoked_at = null`
6. Si existe revocado o expirado, lo reactiva.
7. Si ya existe activo, no crea duplicado y devuelve resultado idempotente.

## Revocacion no destructiva

La revocacion no ejecuta `delete`.

Actualiza el enrollment existente:

```text
status = revoked
revoked_at = now
```

Se conserva `created_at`, `profile_id`, `product_id` y el historial de relacion
con el alumno.

## Reactivacion

La reactivacion restaura acceso:

```text
status = active
revoked_at = null
expires_at = fecha futura opcional o null
```

Esto vuelve a ser compatible con `RequireEnrollment` siempre que `starts_at` no
sea futuro y `expires_at` no este vencido.

## Expiracion

Si se define vencimiento, debe ser una fecha futura. La UI evita fechas pasadas
con `min`, y el service vuelve a validar antes de llamar al repository.

Si `expires_at` queda vacio, el acceso activo no tiene vencimiento.

## Policies admin de escritura

Migracion propuesta:

```text
supabase/migrations/20260720005000_admin_enrollment_write_policies.sql
```

Policies:

- `enrollments_admin_insert`
- `enrollments_admin_update`

Ambas verifican que el usuario autenticado exista en `public.admin_users`.

No se crea policy `delete`. No se conceden escrituras administrativas sobre:

- `profiles`
- `products`
- `module_progress`
- `admin_users`

La migracion no fue ejecutada desde la aplicacion.

## Compatibilidad con RequireEnrollment

`RequireEnrollment` conserva su comportamiento actual:

- `active` permite acceso si `starts_at` ya comenzo y `expires_at` no vencio.
- `revoked` bloquea acceso.
- `expired` bloquea acceso.
- `revoked_at` presente bloquea acceso.
- `expires_at <= now` bloquea acceso aunque el estado sea `active`.

El producto requerido para `/academy` no cambia:

```text
trading-basado-en-datos
```
