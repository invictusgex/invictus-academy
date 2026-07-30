# Purchase Checkout Lifecycle

FASE 8.4A integra el ciclo comercial entre Checkout y Webhooks sin activar
enrollments ni conceder acceso academico.

## 1. Inconsistencia Corregida

Antes, Checkout creaba una Stripe Checkout Session, pero no creaba una
`Purchase`. El Webhook buscaba una compra existente y fallaba con
`PURCHASE_NOT_FOUND`.

Ahora toda URL de Checkout devuelta al navegador queda respaldada por una
`Purchase pending` persistida.

## 2. Nacimiento De Purchase

La `Purchase` nace en `createCheckoutSession()` despues de validar el usuario,
producto, enrollment y Stripe Price, pero antes de llamar a
`stripe.checkout.sessions.create()`.

## 3. Estados Del Ciclo

```text
pending
  -> paid
  -> failed
  -> canceled
  -> refunded
  -> partially_refunded
  -> disputed
```

Checkout solo crea `pending`. Los Webhooks actualizan pagos, refunds y disputes.

## 4. Importe Y Moneda

El servidor obtiene el Price desde Stripe usando `STRIPE_MENTORSHIP_PRICE_ID`.

Validaciones:

- Price existe.
- Price esta activo.
- `type = one_time`.
- No tiene `recurring`.
- `unit_amount` no es null.
- `currency` se normaliza a uppercase ISO 4217.

No se aceptan importes, moneda ni Price ID desde el navegador.

## 5. Metadata

Session y PaymentIntent usan la misma metadata minima:

- `purchase_id`
- `purchase_number`
- `profile_id`
- `product_slug`
- `internal_product_id`
- `environment`

No se guardan secretos, tokens ni payloads serializados.

## 6. Asociacion Checkout Session

Despues de crear la Session, el servidor llama
`PurchaseService.attachProviderCheckoutSession()`.

Esa operacion valida que la compra:

- exista;
- use provider `stripe`;
- siga `pending`;
- no tenga otra Checkout Session distinta.

## 7. Asociacion PaymentIntent

Si Stripe entrega `session.payment_intent` al crear o completar Checkout, se
guarda con `PurchaseService.attachProviderPaymentIntent()`.

Si no llega en Checkout, `payment_intent.succeeded` o
`payment_intent.payment_failed` pueden asociarlo usando metadata controlada.

## 8. Compensaciones

Si falla crear `Purchase`, no se crea Checkout.

Si falla Stripe despues de crear `Purchase`, la compra se marca `canceled` y se
registra `purchase_canceled`.

Si Stripe crea la Session pero falla la asociacion local o el evento
`payment_pending`, el servidor:

1. marca la compra como `canceled`;
2. registra `purchase_canceled`;
3. intenta expirar la Session de Stripe;
4. no devuelve URL.

Si falla expirar la Session, se responde con error controlado
`CHECKOUT_SESSION_EXPIRATION_FAILED`.

## 9. Idempotencia De Checkout

La estrategia busca una compra `pending` para el mismo `profile_id` y
`product_id`.

Si existe y fue creada dentro de 15 minutos, responde
`DUPLICATE_PENDING_PURCHASE` y no crea otra Session.

Si existe pero supera la ventana, se marca `canceled` antes de intentar crear
otra compra.

La migracion agrega un indice unique parcial:

```text
unique (profile_id, product_id)
where status = 'pending'
```

Esto evita que dos requests concurrentes creen dos compras `pending` para el
mismo estudiante/producto. Las compras antiguas deben cancelarse explicitamente
antes de crear una nueva.

## 10. Resolucion Desde Webhooks

`checkout.session.completed`:

- busca por `provider_checkout_session_id`;
- verifica metadata;
- puede recuperar por `metadata.purchase_id`;
- asocia PaymentIntent si existe;
- no marca `paid`.

`payment_intent.succeeded`:

- busca por `provider_payment_intent_id`;
- puede recuperar por `metadata.purchase_id`;
- valida que no haya mismatch;
- marca `paid`;
- registra `payment_confirmed`.

`payment_intent.payment_failed`:

- usa la misma resolucion;
- marca `failed`;
- registra `payment_failed`.

Refunds y disputes se resuelven por PaymentIntent de la Charge o Dispute. No se
usan email, importe ni customer como llave principal.

## 10.1 Maquina De Estados

Transiciones permitidas en esta fase:

- `pending -> paid`
- `pending -> failed`
- `pending -> canceled`
- `failed -> paid`, solo si ya existe `provider_payment_intent_id`
- `paid -> partially_refunded`
- `paid -> refunded`
- `paid -> disputed`
- `partially_refunded -> refunded`
- `partially_refunded -> disputed`
- `disputed -> paid`, reservado para disputa ganada futura
- `disputed -> refunded`, reservado para cierre futuro

No se permite `canceled -> paid`. Un `payment_failed` tardio no revierte una
compra `paid`.

## 10.2 Idempotencia De Eventos De Dominio

`PurchaseService` revisa el estado actual antes de insertar eventos:

- si la compra ya esta en el estado objetivo, no duplica `PurchaseEvent`;
- si `payment_failed` llega despues de `paid`, se trata como no-op;
- refunds repetidos con el mismo `amount_refunded_minor` se tratan como no-op;
- refunds parciales adicionales si aumentan el acumulado generan un nuevo evento.

`amount_refunded_minor` guarda el acumulado confirmado por Stripe.

## 11. Inconsistencias Y Anomalias

Si metadata y Purchase no coinciden, el Webhook falla con:

- `PURCHASE_METADATA_MISMATCH`
- `PAYMENT_INTENT_MISMATCH`

Si no encuentra Purchase, falla con `PURCHASE_NOT_FOUND` y no reconstruye la
compra desde Stripe.

## 12. Service Role

Las escrituras comerciales de Checkout y Webhooks usan el cliente administrativo
server-only. La service role key no se exporta, no se devuelve al cliente y no
debe importarse desde Client Components.

## 13. RLS

RLS permanece habilitado. No se abren INSERT ni UPDATE policies para anon o
authenticated. Las escrituras privilegiadas son explicitas en servidor.

## 14. Riesgos Transaccionales

Supabase JS no ofrece transacciones multioperacion directas desde el cliente
HTTP. Esta fase adopta operaciones secuenciales con compensacion e
idempotencia.

No se agregan funciones `SECURITY DEFINER` en esta fase.

## 14.1 Webhook Idempotency Y Retries

El Webhook usa patron `insert-first` sobre `stripe_webhook_events`. La unique
constraint de `stripe_event_id` es la defensa final ante concurrencia.

Estados:

- `processed` o `ignored`: duplicate 200;
- `processing` fresco: duplicate 200 para evitar doble procesamiento;
- `processing` antiguo: reintento controlado;
- `failed`: reintento controlado.

Errores permanentes se registran como `permanent_failure` y responden 200.
Errores desconocidos o transitorios responden 500 para permitir retry de Stripe.

## 15. Pendiente Antes De Enrollment

Falta:

- aplicar la migracion comercial;
- probar Webhooks reales o fixtures;
- definir activacion de enrollment;
- conectar Session 101 si aplica;
- definir retries operativos.

## 16. Success URL No Concede Acceso

La redireccion `success_url` solo devuelve al navegador desde Stripe. No activa
enrollments, no marca progreso y no concede acceso. La fuente confiable sigue
siendo el Webhook firmado.
