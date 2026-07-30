# Commercial Integration Audit

FASE 8.4B audita y endurece la integracion comercial antes de aplicar
migraciones o crear enrollments.

## 1. Arquitectura Final

```text
POST /api/stripe/checkout
  -> requireServerAuthContext
  -> ProductRepository / EnrollmentRepository
  -> CheckoutService
  -> Stripe SDK server-side
  -> PurchaseService
  -> PurchaseRepository / PurchaseEventRepository

POST /api/stripe/webhook
  -> raw body
  -> Stripe signature verification
  -> StripeWebhookService
  -> PurchaseService
  -> Repositories
```

`PurchaseService` no importa Stripe, no conoce HTTP y no recibe `Request` ni
`Response`.

## 2. Clientes Supabase

- Browser: anon key, seguro para cliente.
- Server SSR: anon key y cookies por request.
- Proxy: refresca cookies, sin service role.
- Admin: service role, `server-only`, sin cookies ni persistencia.

## 3. RLS

RLS permanece como barrera de lectura para usuarios normales. No se agregan
policies de escritura para `authenticated` ni `anon`. Checkout y Webhooks
escriben con cliente administrativo server-side.

La auditoria detecto que faltaba lectura propia de `profiles`; se agrego
`profiles_authenticated_read_own` para que Checkout server-side pueda resolver
el perfil del usuario autenticado sin service role.

## 4. SQL Y TypeScript

Los campos SQL snake_case se mapean a TypeScript camelCase en repositories.
`amount_total_minor`, `amount_refunded_minor` y `attempt_count` se validan como
enteros seguros porque PostgREST puede devolver `bigint` como string o number.

No existen tipos generados de Supabase en el repo. Deben generarse despues de
aplicar migraciones si el proyecto decide adoptar `database.types.ts`.

## 5. Purchase Number

`purchase_number` usa `public.purchase_number_seq` y default
`ITA-000001`. Los huecos son aceptables por concurrencia, rollbacks o borrados.
Los clientes normales no tienen policies para insertar purchases.

## 6. Idempotencia Checkout

Se permite una sola `Purchase pending` por `profile_id/product_id` mediante
unique parcial. Si una pending tiene menos de 15 minutos, Checkout responde
`DUPLICATE_PENDING_PURCHASE`. Si es mas antigua, se cancela antes de crear otra.

Stripe usa `checkout-session:{purchase.id}` como idempotency key.

## 7. Maquina De Estados

Transiciones principales:

- `pending -> paid | failed | canceled`
- `failed -> paid` solo con PaymentIntent asociado
- `paid -> partially_refunded | refunded | disputed`
- `partially_refunded -> refunded | disputed`

`canceled -> paid` no esta permitido. `paid -> failed` se trata como no-op ante
eventos tardios.

## 8. Webhooks Fuera De Orden

`payment_intent.succeeded` puede llegar antes que `checkout.session.completed`
si la metadata permite localizar la Purchase. `checkout.session.completed`
asocia PaymentIntent cuando aparece, pero no marca `paid`.

Refunds y disputes se resuelven por PaymentIntent, nunca por email, customer o
amount solamente.

## 9. Idempotencia De Dominio

`PurchaseService` no inserta eventos duplicados cuando el estado final ya fue
alcanzado. Refunds parciales usan `amount_refunded_minor` acumulado para aceptar
nuevos parciales reales y omitir repetidos.

## 10. Webhook Concurrency

El registro de Webhook usa `insert-first`. La unique constraint sobre
`stripe_event_id` evita doble procesamiento cuando dos requests llegan juntos.

## 11. Webhook Retries

- `processed` / `ignored`: duplicate 200.
- `processing` fresco: duplicate 200.
- `processing` antiguo: retry controlado.
- `failed`: retry controlado.

Un worker futuro podria listar registros `processing` antiguos para
reconciliacion.

## 12. Error Classification

Permanentes:

- `PURCHASE_NOT_FOUND`
- metadata mismatch
- amount/currency mismatch
- estado invalido
- transicion invalida

Transitorios:

- errores de base de datos desconocidos
- fallos de escritura de eventos
- fallos de actualizacion no clasificados

## 13. HTTP Responses

- firma invalida: 400;
- processed/ignored/duplicate/permanent_failure: 200;
- retryable_failure: 500.

## 14. Datos Sensibles

No se guarda payload completo, `billing_details`, payment method, card,
receipt URL, client secret, address ni phone. `payload_summary` es allowlist.

## 15. Checklist Para Aplicar Migraciones

- Revisar orden completo de migraciones.
- Confirmar existencia de `public.set_updated_at`.
- Confirmar que no se aplico la migracion comercial previamente.
- Aplicar primero en entorno controlado.
- Regenerar tipos de Supabase si se adopta `database.types.ts`.

## 16. Checklist Previo A Enrollment

- Probar Checkout autenticado.
- Probar Webhook firmado.
- Probar idempotencia por evento duplicado.
- Probar pending expirada.
- Probar pago exitoso, fallido, refund y dispute.
- Solo despues conectar activacion de enrollment.

## 17. Limitaciones

No se implementa worker de retry, Stripe Customer persistente, Portal,
subscriptions, coupons, invoices, emails ni activacion de acceso academico.

## 18. Actualizacion Runtime Grants Fase 8.5C1

Se preparo la migracion:

```text
supabase/migrations/20260730000000_harden_runtime_grants.sql
```

Para el dominio comercial, el modelo objetivo es:

- `authenticated` puede leer `purchases` y `purchase_events` solamente bajo
  RLS de propiedad o admin.
- `authenticated` no tiene `INSERT`, `UPDATE` ni `DELETE` directos sobre
  `purchases`, `purchase_events` o `stripe_webhook_events`.
- `authenticated` no tiene `SELECT` sobre `stripe_webhook_events`.
- `anon` no lee tablas comerciales.
- `service_role` conserva operaciones server-side para checkout, webhooks y
  auditoria.
- `purchase_number_seq` queda disponible solo para `service_role`.

La migracion no se pudo aplicar localmente durante esta fase porque Docker no
esta disponible para Codex. No se modifico la base remota.

## 19. Actualizacion Type Integration Fase 8.5D

Se integro `src/lib/supabase/database.types.ts` en clientes Supabase y
repositories comerciales.

Clientes tipados:

- browser/legacy client;
- server SSR;
- proxy;
- admin server-only.

Repositories comerciales revisados:

- Profiles;
- Products;
- Enrollments;
- Purchases;
- PurchaseEvents;
- StripeWebhookEvents.

Se conservaron mappers de dominio y validaciones runtime para montos,
`amount_refunded_minor`, `attempt_count`, estados y JSON serializable.

No se implemento Enrollment por pago ni se concedio acceso academico.
