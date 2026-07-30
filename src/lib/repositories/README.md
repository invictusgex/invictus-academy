# Repositories

Esta carpeta alojara los contratos e implementaciones de acceso a datos del
dominio.

## Proposito

Dar a la aplicacion una forma estable de leer y escribir entidades como usuarios,
productos, compras, inscripciones, modulos, lecciones, recursos y progreso.

## Responsabilidades

- Exponer metodos orientados al dominio.
- Ocultar detalles de Supabase u otros proveedores.
- Mapear datos externos a tipos internos.
- Permitir cambiar persistencia sin cambiar componentes.

## Que tipos de archivos viviran aqui

- `auth.repository.ts`
- `user.repository.ts`
- `product.repository.ts`
- `enrollment.repository.ts`
- `purchase.repository.ts`
- `program.repository.ts`
- `progress.repository.ts`

## Que NO debe vivir aqui

- JSX o componentes React.
- Estado visual de formularios.
- Validaciones de UI.
- Clientes de proveedores importados directamente por componentes.
- Secretos o configuracion sensible.

## Relacion con otras capas

Los hooks llaman repositories para obtener datos. Los repositories pueden usar
services para reglas complejas y database para persistencia. Deben devolver
datos listos para el dominio, no respuestas crudas del proveedor.

## Patron Repository

El patron Repository define una API estable entre la UI y la infraestructura.
Los componentes React y hooks futuros deben depender de metodos como
`AuthRepository.getSession()` o `AuthRepository.signIn()`, no de Supabase ni de
clientes externos.

Flujo esperado:

```text
UI futura
  |
  v
Hooks futuros
  |
  v
Repositories
  |
  v
Services
  |
  v
Database / Supabase
```

Reglas del patron:

- Un repository no debe importar componentes React.
- Un repository no debe exponer respuestas crudas de Supabase.
- Un repository puede llamar services, pero la UI no debe llamar services
  directamente cuando exista un repository del dominio.
- Si cambia el proveedor de autenticacion, el cambio debe concentrarse en
  `auth/service.ts` o adaptadores internos, no en componentes.

## AuthRepository

`auth.repository.ts` expone:

- `getCurrentUser()`
- `getSession()`
- `signIn()`
- `signOut()`
- `resetPassword()`

Este repository utiliza solamente `AuthService`. No accede directamente a
Supabase y no esta conectado todavia a hooks, rutas ni pantallas.

## EnrollmentRepository

`enrollment.repository.ts` implementa el acceso a datos para autorizacion de
acceso al programa:

- `getEnrollmentForProduct()`
- `getEnrollments()`

El repository resuelve el producto por `slug`, consulta `enrollments` por
`profile_id` y `product_id`, y devuelve tipos internos en camelCase. No decide
por si solo si el acceso esta habilitado: esa regla vive en
`EnrollmentService`, donde se evaluan `status`, `startsAt`, `expiresAt` y
`revokedAt`.

## Authentication, Authorization y Enrollment

Authentication confirma la identidad del usuario: quien es.

Authorization decide permisos: que puede ver o hacer.

Enrollment representa la relacion comercial o administrativa que concede acceso
a un producto o programa.

```text
Usuario autenticado
  !=
Usuario con acceso al programa
```

Un usuario puede tener sesion valida y aun asi no tener una inscripcion activa.
El acceso futuro a `Trading Basado en Datos` debe depender de `Enrollment`, no
solo de `AuthSession`.

## ProfileRepository

`profile.repository.ts` resuelve perfiles internos desde un cliente Supabase
inyectado por la capa server-side. Esto permite que Route Handlers y Server
Actions usen el mismo cliente por request que ya conoce las cookies de sesion.

Reglas:

- No crea clientes Supabase propios.
- No lee cookies directamente.
- No recibe tokens ni sesiones desde la UI.
- Devuelve un perfil de dominio en camelCase.

## Commercial Repositories

La Fase 8.3 agrega repositories comerciales separados:

- `purchase.repository.ts`
- `purchase-event.repository.ts`
- `stripe-webhook-event.repository.ts`

Reglas:

- `PurchaseRepository` conoce compras internas, no decisiones Stripe.
- `PurchaseEventRepository` registra auditoria de dominio.
- `StripeWebhookEventRepository` prepara idempotencia por `stripe_event_id`.
- Ninguno activa enrollments.
- Ninguno procesa Webhooks por si solo.
