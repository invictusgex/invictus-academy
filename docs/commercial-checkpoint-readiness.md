# Commercial Checkpoint Readiness

## 1. Alcance consolidado

Este checkpoint agrupa la base comercial local de Invictus Trading Academy:

- configuracion Supabase SSR/server/admin;
- Stripe Checkout server-side;
- Stripe Webhook server-side;
- dominio de Purchases;
- PurchaseEvents;
- StripeWebhookEvents;
- migracion comercial;
- migracion de hardening de grants;
- tipos Supabase generados;
- documentacion de integracion.

No incluye Enrollment automatico por pago, activacion de acceso, portal,
emails ni aplicacion remota de migraciones.

## 2. Arquitectura

La arquitectura mantiene separacion:

```text
Route Handler / UI
-> Service
-> Repository
-> Supabase Client
```

Los componentes React no importan Supabase directamente para operaciones
comerciales. El `service_role` permanece aislado en servidor.

## 3. Database types

El archivo generado es:

```text
src/lib/supabase/database.types.ts
```

Incluye `Database`, schema `public`, `Row`, `Insert`, `Update`,
`Relationships`, `purchases`, `purchase_events`, `stripe_webhook_events` y
`amount_refunded_minor`.

No debe editarse manualmente.

## 4. Clientes Supabase tipados

Clientes tipados con `Database`:

- `src/lib/database/client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/proxy.ts`

El cliente admin mantiene `server-only` y usa `SUPABASE_SERVICE_ROLE_KEY` solo
en servidor.

## 5. Repositories tipados

Repositories comerciales tipados contra `Database`:

- `profile.repository.ts`
- `product.repository.ts`
- `enrollment.repository.ts`
- `purchase.repository.ts`
- `purchase-event.repository.ts`
- `stripe-webhook-event.repository.ts`

Los tipos de dominio se mantienen separados de los tipos `Row`, `Insert` y
`Update`.

## 6. Mappers

Los mappers convierten:

- `snake_case` a `camelCase`;
- `timestamptz` a string ISO;
- `jsonb` a objetos de dominio seguros;
- estados string de DB a unions de dominio validadas.

Se conserva validacion runtime para enteros monetarios y `attempt_count`.

## 7. Casts eliminados

Se eliminaron casts inseguros en los repositories comerciales objetivo donde
los tipos generados permiten inferencia directa.

## 8. Casts pendientes

Siguen existiendo casts `unknown as` en repositories no comerciales o de CMS:

- admin content;
- academy content;
- scenario library;
- progress;
- admin students;
- admin enrollments;
- admin user lookup.

Motivo: usan selects compuestos, transformaciones de CMS o repositorios fuera
del alcance comercial de esta fase. Deben abordarse en una fase posterior de
typing del CMS/admin/progress.

## 9. Purchase lifecycle

`PurchaseRepository`:

- crea Purchases sin enviar `purchase_number`;
- no envia `created_at` ni `updated_at`;
- usa defaults de DB;
- lee por ID, purchase number, Checkout Session, PaymentIntent y pending por
  profile/product;
- actualiza status, refund acumulado, Checkout Session y PaymentIntent con
  updates acotados.

`PurchaseService` aplica maquina de estados y no concede Enrollment.

## 10. Webhooks

`StripeWebhookEventRepository` conserva estrategia insert-first con unique
`stripe_event_id`.

`StripeWebhookService`:

- procesa solo eventos soportados;
- distingue duplicados, ignorados, fallos permanentes y retryables;
- valida metadata, amount y currency;
- no crea Purchases faltantes;
- no concede acceso academico.

## 11. Grants

La migracion de grants es:

```text
supabase/migrations/20260730000000_harden_runtime_grants.sql
```

No usa `GRANT ALL` para `anon` ni `authenticated`, no concede a `PUBLIC` y no
incluye `SECURITY DEFINER`.

## 12. RLS

Los grants permiten llegar a la tabla. RLS decide filas.

`service_role` se trata como rol server-side administrativo y no debe usarse en
cliente.

## 13. Migraciones

Migraciones comerciales relevantes:

- `20260729000000_commercial_domain_foundation.sql`
- `20260730000000_harden_runtime_grants.sql`

No se modificaron migraciones remotas ni se ejecuto `db push`.

## 14. Runtime validation

Segun el contexto de la fase, el reset local y la generacion de tipos ya fueron
validados localmente antes de esta auditoria.

Durante esta fase se ejecuto validacion estatica, lint y build. No se aplico
ninguna migracion remota.

## 15. Limitaciones

- No hay Checkout real ejecutado desde esta fase.
- No hay Stripe CLI.
- No hay Enrollment automatico por pago.
- No hay activacion ni revocacion de acceso academico por compra.
- Algunos repositories no comerciales conservan casts pendientes.

## 16. Deuda tecnica restante

- Tipar repositories CMS/admin/progress/scenarios con `Database`.
- Resolver de forma explicita si `academy_modules` necesita un
  `thumbnail_url` real en una futura migracion. Actualmente el schema no lo
  tiene; los mappers de modulo retornan `thumbnailUrl: null`.
- Probar flujo Stripe completo en entorno controlado con Webhook firmado antes
  de habilitar pagos reales.

## 17. Riesgos antes de Enrollment

Antes de activar Enrollment por pago:

- validar Checkout autenticado de extremo a extremo;
- validar Webhook firmado;
- validar idempotencia por evento duplicado;
- validar pagos fallidos, refunds y disputes;
- validar que una success URL no concede acceso;
- definir politica operacional para compras `pending` antiguas.

## 18. Lista exacta de archivos para checkpoint

Incluir todos los archivos comerciales, de Supabase server/auth, Stripe,
repositories, services, migrations, docs y tipos generados relacionados con el
hito.

Excluir salvo decision expresa:

```text
docs/student-learning-workflow.md
```

## 19. Validaciones ejecutadas

- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- busquedas estaticas de casts, tipos, grants, secrets y enrollment.

## 20. Recomendacion de commit

Commit sugerido:

```text
feat(commercial): add Stripe checkout, webhook, purchases, and Supabase commercial foundation
```
