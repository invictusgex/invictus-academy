# Payment confirmed to Enrollment design

Fase: 8.6A - Payment confirmed -> Enrollment domain design.
Actualizacion FASE 8.6B: el fulfillment atomico queda implementado mediante
RPC server-only `public.fulfill_paid_purchase(p_purchase_id uuid)`.

Este documento es solo de diseno y auditoria. No implementa codigo, no crea
migraciones y no modifica el comportamiento actual de Enrollment.

## 1. Estado actual

El checkpoint comercial publicado ya incluye Stripe Checkout, Stripe Webhook,
Purchase, PurchaseEvent, StripeWebhookEvent, PurchaseService,
CheckoutService, StripeWebhookService, Supabase SSR, cliente Supabase admin
server-only, RLS comercial, grants endurecidos, tipos de base de datos y
migraciones comerciales.

FASE 8.6B agrega fulfillment academico automatico despues de
`payment_intent.succeeded`: una Purchase `paid` crea o reutiliza un Enrollment
activo, enlaza `purchases.enrollment_id` y registra `enrollment_granted`.

La migracion comercial declara explicitamente que no activa enrollments ni
procesa eventos Stripe para conceder acceso academico.

## 2. Regla de acceso activo

La regla real usada por codigo y policies academicas es:

- existe un Enrollment para el `profile_id` del usuario y el `product_id` del
  producto academico;
- `status = 'active'`;
- `revoked_at is null`;
- `starts_at <= now()`;
- `expires_at is null` o `expires_at > now()`.

El servicio de dominio tambien deniega acceso si el Enrollment no existe, si
esta revocado, si esta expirado, si aun no ha iniciado o si su estado no es
`active`.

Esta regla debe seguir siendo la unica fuente conceptual para decidir si un
alumno puede leer contenido academico protegido.

## 3. Modelo Enrollment actual

Tabla: `public.enrollments`.

Campos reales:

- `id uuid primary key default gen_random_uuid()`;
- `profile_id uuid not null`;
- `product_id uuid not null`;
- `status text not null default 'active'`;
- `starts_at timestamptz not null default now()`;
- `expires_at timestamptz null`;
- `revoked_at timestamptz null`;
- `access_source text not null default 'manual'`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Relaciones reales:

- `profile_id` referencia `public.profiles(id)` con `on delete cascade`;
- `product_id` referencia `public.products(id)` con `on delete restrict`.

No existen actualmente:

- `active` booleano;
- `metadata`;
- `created_by`;
- `granted_by`;
- `granted_at`;
- `purchase_id` en `enrollments`;
- `revocation_reason`;
- `revoked_by`.

## 4. Purchase to Enrollment

La tabla `public.purchases` ya contiene `enrollment_id uuid null` con foreign
key hacia `public.enrollments(id)` y `on delete set null`.

Lifecycle propuesto:

- Purchase `pending`: `enrollment_id` debe permanecer `null`.
- Purchase `paid`: el fulfillment crea o reutiliza un Enrollment valido y luego
  enlaza `purchases.enrollment_id`.
- Purchase `failed` o `canceled`: no se crea Enrollment.
- Purchase `refunded` o `disputed`: no debe revocar automaticamente en esta
  fase; requiere politica comercial separada.

Una Purchase pagada debe quedar asociada a un unico Enrollment. Si
`enrollment_id` ya existe, no debe sobrescribirse con otro Enrollment distinto.

## 5. Idempotencia

Stripe puede enviar eventos repetidos y el fulfillment debe ser idempotente
ademas de la maquina de estados de Purchase.

Reglas:

- si la Purchase ya tiene `enrollment_id`, el fulfillment debe terminar como
  no-op exitoso;
- si no tiene `enrollment_id`, pero ya existe un Enrollment activo para el
  mismo `profile_id/product_id`, debe reutilizarse y enlazarse;
- si ya existe un Enrollment revocado, no debe reactivarse automaticamente sin
  una regla explicita de negocio;
- si ya existe un Enrollment expirado, la reactivacion o extension debe ser una
  decision explicita;
- dos procesos concurrentes no deben poder crear dos accesos activos ni dos
  enlaces divergentes para la misma Purchase.

La idempotencia no debe depender solo de checks previos en TypeScript. Debe
estar protegida por constraint, row locking o RPC transaccional.

## 6. Unicidad

El modelo real actual conserva `unique (profile_id, product_id)` en
`public.enrollments`.

Esto significa que hoy existe como maximo un Enrollment por alumno y producto
para siempre. El diseno actual no es historico por compra.

Decision tecnica para la siguiente implementacion:

- respetar la unicidad actual;
- reutilizar el Enrollment existente cuando sea valido;
- no intentar crear multiples Enrollments historicos;
- no cambiar a "un unico activo por profile/product" sin una migracion
  deliberada y pruebas de impacto.

Si mas adelante se requiere historial de accesos por compra, habria que
replantear la constraint actual y posiblemente migrar a una unicidad parcial de
Enrollment activo.

## 7. Duracion

La tabla `products` no contiene actualmente `duration_days`,
`access_duration`, `lifetime`, `metadata`, `config`, tipo de producto ni fecha
limite de acceso.

El catalogo server-side de checkout contiene `slug`, `name` y `priceId`, pero
no define duracion.

Decision de diseno:

- no hardcodear duraciones dentro del webhook;
- usar una fuente server-side de dominio para decidir `expires_at`;
- para el producto actual, si el negocio confirma acceso indefinido, representar
  ese acceso con `expires_at = null`;
- si el negocio decide acceso limitado, introducir antes una configuracion de
  producto o catalogo server-side con duracion explicita.

La duracion comercial final queda pendiente de confirmacion.

## 8. Source

El modelo real ya tiene `access_source` con valores:

- `manual`;
- `purchase`;
- `promotion`.

Para fulfillment por pago, el Enrollment debe usar `access_source = 'purchase'`
si se crea nuevo.

Como `purchases.enrollment_id` ya existe, no se recomienda agregar tambien
`enrollments.purchase_id` en esta fase. Dos foreign keys bidireccionales
crearian redundancia y riesgo de inconsistencia.

Campos futuros utiles para proteger overrides:

- `granted_at`, si se necesita diferenciar inicio efectivo de fecha de creacion;
- `revoked_by`;
- `revocation_reason`;
- `revoked_source` o equivalente.

## 9. Estados

Estados actuales de Enrollment:

- `active`;
- `revoked`;
- `expired`.

Estados propuestos para esta fase:

- mantener exactamente los mismos.

No se justifica agregar `pending` o `suspended` todavia. Payment fulfillment
normalmente hace la transicion conceptual `none -> active`.

Transiciones permitidas:

- `active -> revoked`;
- `active -> expired`;
- `revoked -> active` solo mediante accion explicita;
- `expired -> active` solo mediante extension o nueva regla explicita.

## 10. CommercialFulfillmentService

La capa coordinadora separada es `CommercialFulfillmentService`.

Responsabilidades:

- recibir una Purchase ya confirmada como pagada;
- verificar elegibilidad;
- llamar la RPC transaccional que crea o reutiliza Enrollment;
- asociar `purchases.enrollment_id`;
- registrar `PurchaseEvent` de tipo `enrollment_granted`;
- manejar idempotencia;
- clasificar fallos como no-op, transitorios o permanentes.

No debe:

- interpretar eventos Stripe;
- verificar firmas;
- leer `Request`;
- devolver `Response`;
- conocer Checkout Session;
- crear Enrollment directamente saltando EnrollmentService.

Arquitectura objetivo:

```text
Stripe Webhook Route
  -> StripeWebhookService
  -> PurchaseService.confirmPayment()
  -> CommercialFulfillmentService
  -> CommercialFulfillmentService
  -> fulfill_paid_purchase RPC
```

## 11. EnrollmentService

API propuesta minima:

- `grantAccessForPurchase(input)`;
- `getActiveEnrollment(profileId, productId)`;
- `getEnrollmentByProfileAndProduct(profileId, productId)`.

En FASE 8.6B no se duplica `grantAccessForPurchase` en TypeScript. El
`EnrollmentService` existente conserva la evaluacion de acceso; el grant vive en
la RPC para mantener atomicidad.

Una version futura de `grantAccessForPurchase` deberia:

- validar que la Purchase esta pagada;
- decidir `starts_at`;
- decidir `expires_at` desde configuracion server-side;
- solicitar al repository la creacion, reutilizacion o resolucion del
  Enrollment;
- no importar Stripe;
- no conocer eventos HTTP.

APIs futuras, no necesarias para el primer grant:

- `reactivateEnrollment`;
- `revokeEnrollment`;
- `expireEnrollment`;
- `extendEnrollment`.

## 12. EnrollmentRepository

Metodos existentes relevantes:

- obtener Enrollment por producto academico;
- listar Enrollments del usuario;
- obtener Enrollment por `profileId/productId`.

Metodos propuestos:

- `getById(id)`;
- `getByProfileAndProduct(profileId, productId)`;
- `getActiveByProfileAndProduct(profileId, productId)`;
- `createActiveEnrollment(input)`;
- `reactivateEnrollment(input)` solo si la politica lo permite;
- `updateExpiration(input)` solo con campos acotados.

No se recomienda un metodo generico de update que permita modificar cualquier
campo sin intencion de dominio.

La asociacion `Purchase.enrollment_id` debe vivir en PurchaseRepository o en una
RPC transaccional, no como responsabilidad primaria de EnrollmentRepository.

## 13. Transaccion

Fulfillment atomico implementado:

1. Confirmar que la Purchase esta `paid`.
2. Encontrar o crear Enrollment.
3. Asociar `Purchase.enrollment_id`.
4. Registrar `PurchaseEvent enrollment_granted`.

Supabase JS no ofrece una transaccion multi-step directa para estas operaciones.
La implementacion usa una RPC SQL server-only y transaccional para el
fulfillment.

Si se usa `security definer`, la funcion debe cumplir:

- `search_path = ''`;
- sin SQL dinamico;
- permisos revocados a `public`, `anon` y `authenticated`;
- ejecucion solo por `service_role`;
- validacion interna de Purchase `paid`;
- row locking sobre Purchase;
- manejo idempotente;
- errores controlados.

## 14. Concurrencia

Escenarios y comportamiento esperado:

- dos `payment_intent.succeeded` concurrentes: un proceso enlaza la Purchase y
  el otro termina como no-op;
- retry de webhook: si `enrollment_id` ya existe, no se crea nada nuevo;
- caida tras crear Enrollment antes de enlazar Purchase: el retry reutiliza el
  Enrollment existente y lo enlaza;
- caida tras enlazar Purchase antes de registrar evento: el retry detecta el
  enlace y registra el evento si falta;
- Enrollment activo ya existe: reutilizar y enlazar;
- Purchase ya vinculada: no-op exitoso;
- Enrollment revocado existe: conflicto permanente o revision manual, no
  reactivacion automatica.

La constraint actual `unique(profile_id, product_id)` protege contra duplicados
por producto, pero no reemplaza la necesidad de bloquear la Purchase durante el
fulfillment.

## 15. PurchaseEvent

`PurchaseEventType` ya contiene:

- `enrollment_granted`;
- `enrollment_revoked`.

`enrollment_granted` debe registrarse:

- solo despues de que el Enrollment existe;
- solo despues de que la Purchase esta vinculada;
- una sola vez por Purchase;
- con metadata minima y sin secretos.

El source recomendado es `system`. Stripe origina el pago, pero el dominio
comercial-academico concede el acceso.

## 16. Fallos

Codigos propuestos:

- `PURCHASE_NOT_FOUND`;
- `PURCHASE_NOT_PAID`;
- `PURCHASE_ALREADY_FULFILLED`;
- `ENROLLMENT_CREATION_FAILED`;
- `ENROLLMENT_LINK_FAILED`;
- `ENROLLMENT_CONFLICT`;
- `FULFILLMENT_TRANSACTION_FAILED`;
- `FULFILLMENT_PERMANENT_FAILURE`.

Categorias:

- no-op idempotente: no requiere retry;
- fallo transitorio: responder 500 para que Stripe reintente;
- fallo permanente: registrar anomalia y evitar retries infinitos si no puede
  resolverse automaticamente.

Si el pago ya esta confirmado y fulfillment falla, la Purchase debe permanecer
`paid`. No se revierte el pago.

## 17. Webhook integration

Integracion futura con `payment_intent.succeeded`:

1. StripeWebhookService valida el evento y delega la confirmacion de pago.
2. PurchaseService confirma la Purchase como `paid`.
3. CommercialFulfillmentService ejecuta el grant.
4. Si fulfillment es exitoso o idempotente, el webhook responde 200.
5. Si fulfillment falla de forma transitoria, el evento queda failed/retryable y
   el webhook responde 500.
6. Si hay conflicto permanente, se registra como permanent failure y se decide
   responder 200 para evitar retries infinitos.

Si el pago ya estaba confirmado por un evento anterior, el webhook aun debe
intentar fulfillment si la Purchase no tiene `enrollment_id`.

## 18. Refund policy

Politica tecnica inicial, sin implementar:

- refund total: candidato a revocar acceso comprado, salvo override admin;
- refund parcial: mantener acceso salvo decision comercial contraria;
- refund solicitado pero no completado: no revocar;
- refund completado despues de Session 101 o uso avanzado: requiere decision
  comercial/legal.

La revocacion automatica por refund no debe implementarse hasta definir la
politica comercial y la precedencia de overrides.

## 19. Dispute policy

Politica tecnica inicial, sin implementar:

- dispute abierto: no revocar automaticamente hasta definir si se necesita
  suspension;
- dispute won: mantener o restaurar acceso si habia sido suspendido en una fase
  futura;
- dispute lost: candidato a revocacion de acceso comprado;
- dispute fraudulento o riesgo alto: requiere decision comercial y soporte.

Como no existe estado `suspended`, no se debe introducir solo por anticipacion.

## 20. Admin overrides

Workflows actuales:

- admin puede conceder acceso manual;
- admin puede revocar acceso;
- admin puede reactivar;
- admin puede actualizar expiracion.

Precedencia propuesta:

- un admin puede conceder acceso manual aunque no exista Purchase;
- un admin puede revocar acceso comprado;
- un retry de webhook no debe reactivar un Enrollment revocado manualmente sin
  una regla explicita;
- fulfillment no debe pisar decisiones admin.

Limitacion actual: no existe `revoked_by` ni `revocation_reason`, por lo que no
se puede distinguir con precision si una revocacion fue manual, comercial o de
sistema. Antes de automatizar reactivaciones por compra sobre Enrollments
revocados, conviene agregar metadata de revocacion.

## 21. Existing Enrollment cases

A. No existe Enrollment:

- crear Enrollment activo con `access_source = 'purchase'`;
- enlazar Purchase.

B. Existe Enrollment activo del mismo producto:

- reutilizar;
- enlazar Purchase si `enrollment_id` esta vacio;
- no duplicar.

C. Existe Enrollment revocado:

- no reactivar automaticamente;
- marcar conflicto o revision manual.

D. Existe Enrollment expirado:

- no reactivar sin decision explicita;
- si la compra debe renovar acceso, definir si se actualiza el mismo row o se
  cambia el modelo de unicidad.

E. Existe Enrollment asociado a otra Purchase:

- con la unicidad actual, nuevas Purchases del mismo producto deberian poder
  apuntar al mismo Enrollment si el negocio permite recompras o upgrades;
- si se necesita trazabilidad uno-a-uno, habra que modificar el modelo.

## 22. Cambios SQL implementados

Migracion creada:

```text
supabase/migrations/20260730010000_atomic_purchase_fulfillment.sql
```

Cambios implementados:

- RPC transaccional `fulfill_paid_purchase(p_purchase_id uuid)`;
- logica transaccional para impedir sobrescribir
  `purchases.enrollment_id` con otro Enrollment;
- indice unico parcial o check transaccional para registrar
  `enrollment_granted` una sola vez por Purchase;
- grants de ejecucion solo para `service_role`.

No implementado:

- campos de revocacion futura: `revoked_by`, `revocation_reason` o
  `revoked_source`;
- configuracion server-side o columna futura para duracion de acceso;
- revocacion por refund o dispute.

No se recomienda cambiar ahora `unique(profile_id, product_id)` sin una fase
dedicada de migracion.

## 23. RLS

Reglas actuales relevantes:

- alumnos autenticados leen sus propios Enrollments;
- admins leen Enrollments mediante policy admin;
- admins insertan y actualizan Enrollments mediante policies admin;
- grants dan `insert, update` sobre `enrollments` a `authenticated`, pero RLS
  limita esas escrituras a administradores;
- `service_role` tiene permisos completos y bypass de RLS.

RLS propuesta para fulfillment:

- no abrir escrituras de Enrollment al cliente alumno;
- no exponer RPC a `anon` ni `authenticated`;
- ejecutar fulfillment solo desde servidor con `service_role`;
- si se usa RPC `security definer`, revocar `execute` a `public`, `anon` y
  `authenticated`, y conceder solo a `service_role`.

Despues de cualquier migracion futura se debe regenerar
`src/lib/supabase/database.types.ts`; no editarlo manualmente.

## 24. Riesgos

Riesgos principales:

- activar acceso dos veces si el fulfillment no es transaccional;
- dejar Purchase `paid` sin Enrollment si cae el proceso a mitad;
- reactivar un acceso revocado por admin durante un retry de webhook;
- hardcodear una duracion comercial incorrecta;
- duplicar relacion con `Enrollment.purchase_id` y `Purchase.enrollment_id`;
- exponer una RPC de fulfillment a usuarios autenticados;
- registrar `enrollment_granted` mas de una vez por Purchase;
- responder 200 a Stripe ante un fallo transitorio y perder retries utiles.

## 25. Preguntas comerciales pendientes

Decisiones pendientes:

- el acceso a "Trading Basado en Datos" es permanente, indefinido mientras no se
  revoque o limitado por dias;
- un refund total revoca acceso inmediatamente o pasa por revision;
- un refund parcial mantiene acceso;
- un dispute abierto suspende, revoca o solo registra alerta;
- un dispute lost revoca automaticamente;
- una recompra del mismo producto extiende acceso, crea historial o reutiliza el
  mismo Enrollment;
- una revocacion admin puede ser revertida por una compra nueva sin revision.

## 26. Plan de implementacion

Plan recomendado para una fase futura:

1. Confirmar decisiones comerciales de duracion, refunds y disputes.
2. Disenar la migracion minima: RPC de fulfillment, proteccion de evento unico y
   metadata de revocacion si aplica.
3. Regenerar `src/lib/supabase/database.types.ts` despues de migrar.
4. Crear CommercialFulfillmentService sin dependencias de Stripe.
5. Ampliar EnrollmentService y EnrollmentRepository con operaciones acotadas.
6. Ampliar PurchaseRepository para enlazar Enrollment solo de forma segura o
   delegarlo por completo a la RPC.
7. Integrar fulfillment despues de `PurchaseService.confirmPayment()`.
8. Registrar `PurchaseEvent enrollment_granted` con `source = 'system'`.
9. Cubrir idempotencia, concurrencia y fallos transitorios/permanentes.
10. Validar sin cambiar UI ni enrollment manual existente.
