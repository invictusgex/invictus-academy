# Atomic Purchase Fulfillment

FASE 8.6B - Purchase paid -> Enrollment active.

## 1. Decisiones comerciales

Para la mentoria grabada actual:

- el acceso concedido por compra es indefinido: `expires_at = null`;
- si no existe Enrollment, se crea `active`;
- si existe Enrollment `active` vigente, se reutiliza;
- si existe Enrollment `revoked`, no se reactiva automaticamente;
- si existe Enrollment `expired`, no se reactiva automaticamente;
- una revocacion administrativa prevalece sobre retries de Stripe;
- refund parcial, refund total y dispute no revocan acceso en esta fase;
- no se implementan renovaciones ni recompra.

## 2. Arquitectura

```text
Stripe Webhook Route
  -> StripeWebhookService
  -> PurchaseService.confirmPayment()
  -> CommercialFulfillmentService
  -> public.fulfill_paid_purchase()
```

`PurchaseService` no crea Enrollments. `StripeWebhookService` no escribe en
`enrollments`. El unico tramo critico vive en la RPC PostgreSQL.

## 3. RPC

Firma exacta:

```sql
public.fulfill_paid_purchase(p_purchase_id uuid)
returns table (
  purchase_id uuid,
  enrollment_id uuid,
  outcome text,
  enrollment_created boolean,
  event_created boolean
)
```

Outcomes permitidos:

- `granted`;
- `already_fulfilled`;
- `active_enrollment_reused`.

## 4. Seguridad

La funcion usa:

- `language plpgsql`;
- `security definer`;
- `set search_path = ''`;
- referencias fully qualified;
- sin SQL dinamico.

Permisos:

- `revoke all` desde `public`;
- `revoke all` desde `anon`;
- `revoke all` desde `authenticated`;
- `grant execute` solo a `service_role`.

No usa `auth.uid()` porque fulfillment se ejecuta desde servidor con
`service_role` y valida todo desde DB.

## 5. Transaccion

PostgreSQL ejecuta la funcion dentro de la transaccion de la llamada RPC. Si se
lanza excepcion, no queda una actualizacion parcial.

Orden:

1. bloquear Purchase;
2. validar `status = 'paid'`;
3. resolver o crear Enrollment;
4. enlazar `purchases.enrollment_id`;
5. crear `purchase_events.enrollment_granted`;
6. devolver resultado tipado.

## 6. Locking

La RPC usa:

- `select ... for update` sobre `purchases`;
- `select ... for update` sobre `enrollments` cuando existe;
- fallback ante `unique_violation` si otro proceso crea el Enrollment primero.

Esto cubre retries, webhooks duplicados y llamadas concurrentes para la misma
Purchase.

## 7. Idempotencia

Si `purchases.enrollment_id` ya existe:

- valida que el Enrollment exista;
- valida `profile_id/product_id`;
- no crea otro Enrollment;
- no crea otro `enrollment_granted`;
- devuelve `already_fulfilled`.

La DB agrega un indice unico parcial:

```sql
purchase_events_one_enrollment_granted_per_purchase_key
```

sobre `purchase_events(purchase_id)` donde
`event_type = 'enrollment_granted'`.

## 8. Enrollment existente

Enrollment activo vigente:

- `status = 'active'`;
- `revoked_at is null`;
- `starts_at <= now()`;
- `expires_at is null or expires_at > now()`.

Resultado: se reutiliza y devuelve `active_enrollment_reused`.

## 9. Enrollment revocado

Si `status = 'revoked'` o `revoked_at is not null`:

- no se reactiva;
- no se actualiza;
- Purchase permanece `paid`;
- `enrollment_id` permanece `null`;
- error: `ENROLLMENT_REVOKED_CONFLICT`.

## 10. Enrollment expirado

Si `status = 'expired'` o `expires_at <= now()`:

- no se reactiva;
- no se extiende;
- error: `ENROLLMENT_EXPIRED_CONFLICT`.

## 11. Purchase linkage

La RPC actualiza solo:

```sql
purchases.enrollment_id
```

No cambia:

- status;
- importes;
- Stripe IDs;
- provider;
- currency.

La actualizacion exige que `enrollment_id is null` o ya coincida con el
Enrollment resuelto.

## 12. enrollment_granted

Evento:

- `event_type = 'enrollment_granted'`;
- `source = 'system'`;
- `actor_profile_id = null`;
- summary: `Academic access granted after confirmed payment.`;
- metadata minima:

```json
{
  "enrollment_id": "...",
  "enrollment_created": true
}
```

No guarda payload Stripe, email, price, PaymentIntent completo ni webhook
completo.

## 13. Errores

Permanentes:

- `PURCHASE_NOT_FOUND`;
- `PURCHASE_NOT_PAID`;
- `ENROLLMENT_LINK_CONFLICT`;
- `ENROLLMENT_REVOKED_CONFLICT`;
- `ENROLLMENT_EXPIRED_CONFLICT`;
- `ENROLLMENT_NOT_YET_ACTIVE_CONFLICT`.

Transitorios:

- `ENROLLMENT_CREATION_FAILED`;
- `ENROLLMENT_LINK_FAILED`;
- `FULFILLMENT_TRANSACTION_FAILED`;
- `DATABASE_UNAVAILABLE`.

La funcion usa `raise exception using errcode = 'P0001', message = '<CODE>'`.

## 14. Retry

Fallos permanentes:

- marcan webhook `failed`;
- devuelven `permanent_failure`;
- la ruta responde 200 para evitar retry infinito;
- requieren intervencion manual.

Fallos transitorios:

- marcan webhook `failed`;
- devuelven `retryable_failure`;
- la ruta responde 500;
- Stripe puede reintentar.

La Purchase permanece `paid`; nunca se revierte a `pending` o `failed`.

## 15. Webhook integration

Solo `payment_intent.succeeded` ejecuta fulfillment.

No ejecutan fulfillment:

- `checkout.session.completed`;
- `payment_intent.payment_failed`;
- `charge.refunded`;
- `charge.dispute.created`.

## 16. Recuperacion paid/no enrollment

`PurchaseService.confirmPayment()` puede no cambiar nada si la Purchase ya era
`paid`. Aun asi, `StripeWebhookService` llama fulfillment para recuperar compras
pagadas sin `enrollment_id`.

## 17. Runtime tests

Casos definidos:

- Purchase pending -> `PURCHASE_NOT_PAID`;
- Purchase paid sin Enrollment -> crea Enrollment, link y evento;
- retry -> `already_fulfilled`;
- Enrollment active existente -> reutiliza;
- Enrollment revoked -> conflicto permanente;
- Enrollment expired -> conflicto permanente;
- link conflict -> `ENROLLMENT_LINK_CONFLICT`;
- authenticated -> no puede ejecutar RPC;
- service_role -> puede ejecutar RPC.

## 18. RLS/grants

La RPC no abre permisos al navegador. `anon` y `authenticated` no tienen execute.
El servidor usa `service_role`. Las tablas conservan RLS y grants existentes.

## 19. Limitaciones

- No implementa historico de multiples Enrollments por producto.
- No reactiva accesos revocados o expirados.
- No agrega campos de motivo de revocacion.
- No resuelve recompra.
- No envia emails.
- No modifica UI.

## 20. Refunds/disputes fuera de alcance

Refund parcial, refund total y dispute no revocan ni suspenden acceso en esta
fase. Solo actualizan estado comercial existente cuando corresponda.

## 21. Proxima fase

La siguiente fase deberia enfocarse en:

- validacion operativa del webhook con Stripe CLI o fixtures controlados;
- vista/admin para Purchases paid con fulfillment conflictivo;
- politica comercial final de refunds/disputes;
- auditoria admin de revocaciones y reactivaciones.
