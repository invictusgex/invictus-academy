# Commercial Domain Foundation

FASE 8.3 y 8.3A definen la fuente de verdad comercial de Invictus Trading
Academy. Esta base no implementa Webhooks, procesamiento de eventos Stripe,
activacion de enrollments, refunds automaticos, emails ni UI comercial.

## Arquitectura

Stripe es un proveedor de pago. El dominio comercial interno conserva el estado
normalizado y auditable de compras.

```text
Stripe Checkout / Webhooks futuros
  -> Services comerciales
  -> Repositories comerciales
  -> purchases
  -> purchase_events
  -> stripe_webhook_events
```

## Purchase Number

Cada compra tiene dos identificadores:

- `id`: UUID tecnico.
- `purchase_number`: identificador legible independiente del proveedor.

Estrategia:

```text
ITA-000001
ITA-000002
ITA-000003
```

La migracion usa `public.purchase_number_seq`, una secuencia PostgreSQL. Esto
evita `max() + 1`, no depende de Stripe y es seguro bajo concurrencia.

## Entidades

### Purchase

`Purchase` representa una compra interna realizada por un estudiante para un
producto academico.

Campos principales:

- `id`
- `purchase_number`
- `profile_id`
- `product_id`
- `enrollment_id`
- `status`
- `payment_provider`
- `provider_checkout_session_id`
- `provider_payment_intent_id`
- `amount_total_minor`
- `amount_refunded_minor`
- `currency`
- `created_at`
- `updated_at`

Estados definitivos:

- `pending`
- `paid`
- `failed`
- `canceled`
- `refunded`
- `partially_refunded`
- `disputed`

### PurchaseEvent

`PurchaseEvent` registra la historia de una compra.

Tipos de evento:

- `purchase_created`
- `payment_pending`
- `payment_confirmed`
- `payment_failed`
- `purchase_canceled`
- `refund_requested`
- `refund_completed`
- `partial_refund_completed`
- `dispute_opened`
- `dispute_won`
- `dispute_lost`
- `enrollment_granted`
- `enrollment_revoked`
- `manual_adjustment`

Sources:

- `system`
- `stripe_webhook`
- `admin`
- `student`

`actor_profile_id` es nullable y se reserva para acciones humanas. Eventos
automaticos pueden no tener actor.

### StripeWebhookEvent

`StripeWebhookEvent` registra recepcion e idempotencia de eventos Stripe.

Campos:

- `id`
- `stripe_event_id`
- `event_type`
- `api_version`
- `livemode`
- `processing_status`
- `attempt_count`
- `last_error_code`
- `purchase_id`
- `received_at`
- `processed_at`
- `error_message`
- `payload_summary`
- `created_at`
- `updated_at`

Estados de procesamiento:

- `received`
- `processing`
- `processed`
- `failed`
- `ignored`

No se almacena payload completo por defecto. `payload_summary` debe contener
solo datos minimos no sensibles.

## Money

La estrategia monetaria usa minor units:

```text
19900 = USD 199.00
```

SQL usa `bigint` en `amount_total_minor`. No se usan `float`, `real` ni
`double precision`.

`amount_total_minor` es nullable porque una compra puede crearse antes de que el
proveedor confirme el importe final.

`amount_refunded_minor` guarda el acumulado reembolsado confirmado por Stripe y
empieza en `0`. Permite distinguir refunds repetidos de refunds parciales
adicionales.

## Currency

`currency` es obligatoria y usa ISO 4217 uppercase:

```text
USD
EUR
MXN
```

La constraint exige exactamente tres letras mayusculas. El producto inicial usa
`USD`, pero no se cierra el modelo a una sola moneda.

## Multi Provider

La columna `payment_provider` separa dominio y proveedor. El valor inicial
permitido es:

```text
stripe
```

Los IDs externos se mantienen neutrales:

- `provider_checkout_session_id`
- `provider_payment_intent_id`

`stripe_webhook_events.stripe_event_id` conserva nombre especifico porque esa
tabla es exclusiva de Stripe.

## Relaciones

```text
profiles 1 ---- * purchases
products 1 ---- * purchases
enrollments 1 ---- * purchases (nullable)
purchases 1 ---- * purchase_events
purchases 1 ---- * stripe_webhook_events (nullable)
```

`purchases.enrollment_id` es nullable y no unique. Una compra puede existir
antes de que un Webhook verificado active acceso. Un enrollment manual no
requiere purchase.

## Indices

Conservados/agregados:

- `purchases_provider_checkout_session_id_key`
- `purchases_provider_payment_intent_id_key`
- `purchases_profile_product_status_created_at_idx`
- `purchases_product_id_status_idx`
- `purchases_created_at_idx`
- `purchases_enrollment_id_idx`
- `purchase_events_purchase_id_created_at_idx`
- `purchase_events_event_type_created_at_idx`
- `stripe_webhook_events_processing_status_received_at_idx`
- `stripe_webhook_events_event_type_received_at_idx`
- `stripe_webhook_events_purchase_id_idx`

Se evitaron indices simples duplicados cuando una unique constraint o indice
compuesto cubre la consulta esperada.

## Constraints E Integridad

`purchases`:

- `purchase_number` obligatorio y unique;
- status controlado;
- `payment_provider` controlado;
- `amount_total_minor >= 0` cuando existe;
- `amount_refunded_minor >= 0`;
- `amount_refunded_minor <= amount_total_minor` cuando existe total;
- `currency ~ '^[A-Z]{3}$'`;
- IDs de proveedor nullable y unicos por provider cuando existen.

`purchase_events`:

- `purchase_id` obligatorio;
- `event_type` controlado;
- `source` controlado.

`stripe_webhook_events`:

- `stripe_event_id` obligatorio y unique;
- `processing_status` controlado;
- `attempt_count >= 0`.

## ON DELETE

El historial financiero debe preservarse.

- `purchases.profile_id`: `on delete restrict`.
- `purchases.product_id`: `on delete restrict`.
- `purchases.enrollment_id`: `on delete set null`.
- `purchase_events.purchase_id`: `on delete restrict`.
- `stripe_webhook_events.purchase_id`: `on delete set null`.
- `actor_profile_id`: `on delete set null`.

No hay FK circular entre Purchase y Enrollment.

## RLS

Las tres tablas tienen RLS habilitado.

Politicas:

- estudiantes autenticados pueden leer su propio `profile`;
- estudiantes autenticados pueden leer sus propias `purchases`;
- estudiantes autenticados pueden leer `purchase_events` de sus propias compras;
- admins autenticados pueden leer `purchases`, `purchase_events` y
  `stripe_webhook_events`;
- estudiantes no pueden leer `stripe_webhook_events`;
- no hay policies anonimas;
- no hay policies de escritura desde cliente.

## Escritura Futura Desde Webhooks

Los Webhooks no tienen sesion de usuario. La escritura comercial se realiza con
cliente administrativo exclusivo de servidor:

- `src/lib/supabase/admin.ts` importa `server-only`;
- `SUPABASE_SERVICE_ROLE_KEY` no usa prefijo `NEXT_PUBLIC`;
- `persistSession`, `autoRefreshToken` y `detectSessionInUrl` quedan
  deshabilitados;
- los repositories reciben explicitamente el cliente que usara cada operacion.

No se abren policies de escritura para clientes normales.

## Preparacion Para Fase 8.4

La fase de Webhooks debera:

- verificar firma con `STRIPE_WEBHOOK_SECRET`;
- insertar `stripe_webhook_events` por `stripe_event_id`;
- evitar reprocesar eventos duplicados;
- mapear eventos Stripe a `PurchaseStatus` y `PurchaseEventType`;
- actualizar `purchases`;
- registrar `purchase_events`;
- activar enrollment solo desde eventos verificados.

## Preparacion Para Fase 8.4A

Checkout crea `Purchase pending` antes de devolver la URL de Stripe. Esta compra
contiene `amount_total_minor`, `currency`, `payment_provider`, `profile_id` y
`product_id` desde datos server-side.

La asociacion con Stripe se guarda mediante:

- `provider_checkout_session_id`
- `provider_payment_intent_id`, si esta disponible inmediatamente o si llega por
  webhook posterior.

La idempotencia inicial bloquea compras `pending` recientes para el mismo
`profile_id` y `product_id` en una ventana de 15 minutos. Una `pending` mas
antigua se cancela antes de crear otra. La migracion agrega un unique parcial
para que exista como maximo una compra `pending` por estudiante/producto.

## Limitaciones

No se creo:

- `StripeCustomer`;
- `Subscriptions`;
- `Invoices`;
- `Coupons`;
- sync de customers;
- activacion de enrollments;
- UI comercial.
