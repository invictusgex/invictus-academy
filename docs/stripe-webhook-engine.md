# Stripe Webhook Engine

FASE 8.4 implementa el motor inicial de Webhooks de Stripe. No activa
enrollments, no crea Session 101, no sincroniza Stripe Customers, no envia emails
y no implementa portal ni UI comercial.

## Arquitectura

```text
POST /api/stripe/webhook
  -> raw body
  -> Stripe signature verification
  -> StripeWebhookService
  -> PurchaseService
  -> Repositories
  -> Commercial tables
```

La Route Handler solo se ocupa de HTTP, raw body y firma. La interpretacion de
eventos vive en `StripeWebhookService`. Las reglas de dominio se aplican en
`PurchaseService`.

## Raw Body Y Firma

La ruta usa:

```ts
await request.text()
```

No usa `request.json()` antes de verificar firma.

La firma se valida con:

```ts
stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
```

Si falta o falla `stripe-signature`, responde `400` y no procesa nada.

## Escritura Server-Side

Los Webhooks no tienen sesion de usuario. Para escribir respetando la separacion
de RLS, se agrego `src/lib/supabase/admin.ts`, marcado con `server-only`, usando
`SUPABASE_SERVICE_ROLE_KEY`.

Esta key no se expone al cliente y no debe importarse desde Client Components.

## Idempotencia

Antes de procesar cualquier evento, `StripeWebhookService` intenta insertar el
registro en `stripe_webhook_events`. La constraint unique de `stripe_event_id`
es la defensa final ante requests concurrentes.

Si ya existe y esta `processed` o `ignored`:

- responde como `duplicate`;
- no reejecuta reglas de dominio;
- no duplica `purchase_events`;
- no cambia `purchases`.

Si ya existe y esta `processing` fresco, responde duplicate 200. Si esta
`processing` antiguo o `failed`, permite reintento controlado.

Si el insert inicial se crea:

1. registra `received`;
2. marca `processing` e incrementa `attempt_count`;
3. procesa o ignora el evento;
4. marca `processed`, `failed` o `ignored`.

## Eventos Soportados

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

Todo evento no soportado se marca como `ignored`.

## Mapeo De Dominio

`checkout.session.completed`:

- busca Purchase por `provider_checkout_session_id`;
- verifica `metadata.purchase_id`, `profile_id` e `internal_product_id`;
- si no encuentra por Session ID, intenta recuperacion controlada por
  `metadata.purchase_id`;
- asocia `provider_payment_intent_id` cuando Stripe lo entrega;
- no duplica `payment_pending`, porque Checkout lo registra al crear la sesion;
- no marca `paid` por si solo;
- no crea Purchase.

`payment_intent.succeeded`:

- busca Purchase por `provider_payment_intent_id`;
- si no encuentra por PaymentIntent ID, intenta recuperacion controlada por
  `metadata.purchase_id`;
- falla con `PAYMENT_INTENT_MISMATCH` si ambas rutas apuntan a compras distintas;
- ejecuta `PurchaseService.confirmPayment()`;
- registra `payment_confirmed`.

`payment_intent.payment_failed`:

- ejecuta `PurchaseService.failPayment()`;
- registra `payment_failed`.
- si la compra ya esta `paid`, no revierte el estado ni duplica eventos.

`charge.refunded`:

- busca Purchase por PaymentIntent de la charge;
- valida amount y currency;
- ejecuta `PurchaseService.markRefunded()`;
- registra `refund_completed` o `partial_refund_completed`.
- usa `amount_refunded_minor` como acumulado idempotente.

`charge.dispute.created`:

- busca Purchase por PaymentIntent de la dispute;
- ejecuta `PurchaseService.markDisputed()`;
- registra `dispute_opened`.

## Anomalias

Si un evento soportado no puede localizar Purchase:

- `stripe_webhook_events.processing_status = 'failed'`;
- `last_error_code = 'PURCHASE_NOT_FOUND'`;
- no se inventan compras;
- no se reconstruye historial desde Stripe;
- no se activan enrollments.

Esta decision evita que Stripe se convierta en la fuente de verdad completa del
dominio.

## Politica HTTP

- firma ausente o invalida: 400;
- evento ignorado, procesado o duplicado finalizado: 200;
- anomalia permanente verificada: 200 con estado `permanent_failure`;
- fallo desconocido o transitorio: 500 con estado `retryable_failure`.

Stripe solo debe reintentar cuando el servidor no pudo completar una operacion
confiable.

## Seguridad

- No depende del navegador.
- No depende de `success_url`.
- No recibe IDs del cliente.
- No imprime payloads completos.
- No imprime cookies, tokens ni secrets.
- No concede acceso academico.
- No modifica enrollments.

## Limitaciones

El Checkout ya crea una `Purchase pending` antes de devolver URL. Si un webhook
no encuentra compra, se conserva como anomalia `PURCHASE_NOT_FOUND` y no se
reconstruye el dominio desde Stripe.

La migracion comercial sigue sin aplicarse en esta fase.
