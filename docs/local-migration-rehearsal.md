# Local Migration Rehearsal

FASE 8.5A valida la preparacion de despliegue de base de datos sin tocar la
base remota. En este entorno no pudo ejecutarse el reset local porque Supabase
CLI y Docker no estan disponibles en PATH.

## 1. Entorno Detectado

- Supabase CLI: no disponible en PATH (`supabase` no reconocido).
- Docker: no disponible en PATH (`docker` no reconocido).
- `supabase/config.toml`: existe.
- `project_id` local en config: configurado.
- `supabase/.temp`: no existe; no se detecto vinculacion remota local.
- Variables relacionadas con Supabase/Stripe en entorno del proceso/usuario:
  ninguna detectada por nombre. No se imprimieron valores.

## 2. Estado Local Inicial

No se pudo ejecutar `supabase status` porque Supabase CLI no esta disponible.
No se inicio Supabase local y no se ejecuto `supabase db reset`.

## 3. Inventario De Migraciones

Orden actual:

1. `20260719213351_initial_schema.sql`
2. `20260720000000_database_model_v1.sql`
3. `20260720001000_rls_policies_v1.sql`
4. `20260720002000_module_progress_insert_policy.sql`
5. `20260720003000_admin_users.sql`
6. `20260720004000_admin_read_policies.sql`
7. `20260720005000_admin_enrollment_write_policies.sql`
8. `20260721000000_content_cms_v1.sql`
9. `20260721001000_admin_content_module_update_policy.sql`
10. `20260721002000_admin_content_video_write_policies.sql`
11. `20260721003000_admin_content_resource_write_policies.sql`
12. `20260721004000_scenario_library_v1.sql`
13. `20260721005000_admin_scenario_write_policies.sql`
14. `20260721010000_storage_academy_assets.sql`
15. `20260721011000_restrict_academy_content_read_policies.sql`
16. `20260729000000_commercial_domain_foundation.sql`

## 4. Dependencias Encontradas

- `profiles`, `products`, `enrollments` nacen en
  `20260719213351_initial_schema.sql`.
- `set_updated_at()` nace en `20260720000000_database_model_v1.sql`.
- `admin_users` nace en `20260720003000_admin_users.sql`.
- `academy_modules`, `academy_module_videos` y `academy_resources` nacen en
  `20260721000000_content_cms_v1.sql`.
- La migracion restrictiva de contenido se ejecuta despues de crear tablas CMS.
- La migracion comercial se ejecuta despues de perfiles, productos,
  enrollments, admin_users y `set_updated_at()`.

## 5. Auditoria Pre-Flight

`20260721011000_restrict_academy_content_read_policies.sql`:

- elimina policies publicas anteriores de contenido publicado;
- crea lectura de contenido academico solo para estudiantes con enrollment
  activo y no revocado;
- preserva lectura admin por las policies creadas previamente;
- referencia tablas ya creadas en migraciones anteriores.

`20260729000000_commercial_domain_foundation.sql`:

- crea `purchase_number_seq`;
- crea `purchases`, `purchase_events`, `stripe_webhook_events`;
- define FKs contra `profiles`, `products`, `enrollments` y `purchases`;
- define checks de estados, provider, currency, amounts y attempt count;
- define unique de `purchase_number`, `stripe_event_id`, checkout session,
  payment intent y pending por profile/product;
- usa `public.set_updated_at()` ya definido;
- habilita RLS;
- crea lectura propia de profile, purchases y purchase_events;
- crea lecturas admin;
- no abre escrituras comerciales para clientes normales.

## 6. Resultado Del Reset

No ejecutado. Motivo:

- `supabase --version` fallo porque el comando no existe en PATH.
- `docker --version` fallo porque el comando no existe en PATH.

No se instalo software, no se modifico Docker y no se intento usar `npx` para
descargar herramientas.

## 7. Correcciones Realizadas

Durante esta fase no se realizaron correcciones SQL adicionales. La revision
estatica encontro coherencia de orden y dependencias, pero no sustituye un reset
local real.

## 8. Tablas Y Columnas A Verificar En Rehearsal Real

Cuando Supabase CLI y Docker esten disponibles, verificar:

- `profiles`
- `products`
- `enrollments`
- `purchases`
- `purchase_events`
- `stripe_webhook_events`

Columnas comerciales esperadas:

- `purchases.id`
- `purchases.purchase_number`
- `purchases.profile_id`
- `purchases.product_id`
- `purchases.enrollment_id`
- `purchases.status`
- `purchases.payment_provider`
- `purchases.provider_checkout_session_id`
- `purchases.provider_payment_intent_id`
- `purchases.amount_total_minor`
- `purchases.amount_refunded_minor`
- `purchases.currency`
- `purchases.created_at`
- `purchases.updated_at`
- `purchase_events.*`
- `stripe_webhook_events.*`

## 9. Constraints A Verificar En Rehearsal Real

- `purchase_number` unique.
- `stripe_event_id` unique.
- `amount_total_minor >= 0`.
- `amount_refunded_minor >= 0`.
- `amount_refunded_minor <= amount_total_minor`.
- `currency` uppercase de tres letras.
- statuses de Purchase permitidos.
- provider `stripe`.
- `attempt_count >= 0`.
- unique parcial `purchases_one_pending_per_profile_product_key`.

## 10. Purchase Number

No probado en ejecucion local por falta de CLI/Docker. Revision estatica:

- default usa `nextval('public.purchase_number_seq')`;
- formato `ITA-` + padding de 6 digitos;
- el numero no se genera desde TypeScript.

## 11. Unique Pending

No probado en ejecucion local. Revision estatica:

```sql
create unique index if not exists purchases_one_pending_per_profile_product_key
  on public.purchases (profile_id, product_id)
  where status = 'pending';
```

## 12. Refund Constraints

No probado en ejecucion local. Revision estatica confirma:

- `amount_refunded_minor bigint not null default 0`;
- no negativo;
- no puede superar `amount_total_minor` cuando el total existe.

## 13. Currency Y Status Constraints

No probado en ejecucion local. Revision estatica confirma:

- `currency ~ '^[A-Z]{3}$'`;
- Purchase statuses limitados a `pending`, `paid`, `failed`, `canceled`,
  `refunded`, `partially_refunded`, `disputed`;
- webhook processing statuses limitados a `received`, `processing`,
  `processed`, `failed`, `ignored`.

## 14. Webhook Idempotency

No probado en ejecucion local. Revision estatica confirma:

- `stripe_webhook_events_event_id_key unique (stripe_event_id)`.

## 15. RLS

No probado con claims locales. Revision estatica confirma:

- `profiles_authenticated_read_own`;
- `purchases_authenticated_read_own`;
- `purchase_events_authenticated_read_own`;
- `stripe_webhook_events_admin_read`;
- sin policies comerciales de INSERT/UPDATE/DELETE para usuarios normales.

## 16. Grants

No auditado en base local porque no se pudo iniciar Postgres local. Revision
estatica no encontro grants explicitos innecesarios sobre la secuencia
`purchase_number_seq`.

## 17. Migracion Restrictiva De Contenido

Revision estatica:

- tablas objetivo existen antes de la migracion;
- policies publicas previas se eliminan;
- acceso queda condicionado a enrollment activo y producto del modulo;
- admins conservan lectura por policies anteriores.

## 18. Limitaciones

Esta fase no valida en ejecucion:

- sintaxis SQL real en PostgreSQL;
- reset completo reproducible;
- constraints mediante inserts con rollback;
- RLS con claims;
- grants reales;
- migration history local/remota.

## 19. Riesgos Pendientes

- Instalar o exponer Supabase CLI en PATH.
- Instalar o exponer Docker en PATH.
- Ejecutar `supabase db reset` local.

## 20. Actualizacion Runtime Fase 8.5C

Despues de la preparacion de tooling se informo un reset local exitoso. En esta
fase se verifico runtime contra PostgreSQL local por conexion directa a
`127.0.0.1:54322`, sin tocar bases remotas.

Resultado:

- PostgreSQL local accesible.
- PostgREST local accesible en `127.0.0.1:54321`.
- 16 migraciones aplicadas en `supabase_migrations.schema_migrations`.
- Ultima migracion aplicada: `20260729000000`.
- Tablas esperadas presentes:
  - `profiles`
  - `products`
  - `enrollments`
  - `academy_modules`
  - `academy_module_videos`
  - `academy_resources`
  - `purchases`
  - `purchase_events`
  - `stripe_webhook_events`

Se verificaron en ejecucion con transaccion y rollback:

- formato/default de `purchase_number` con prefijo `ITA-`;
- unique de `purchase_number`;
- unique parcial de Purchase `pending`;
- insercion de nueva `pending` despues de cancelar la anterior;
- constraints de amounts/refunds;
- constraint de currency uppercase de tres letras;
- constraint de PurchaseStatus;
- constraint de PaymentProvider;
- constraints de `purchase_events.event_type` y `purchase_events.source`;
- foreign key de `purchase_events.purchase_id`;
- unique de `stripe_webhook_events.stripe_event_id`;
- constraint de `stripe_webhook_events.attempt_count`;
- constraint de `stripe_webhook_events.processing_status`.

Hallazgo runtime:

- RLS esta habilitado y las policies existen.
- Los grants SQL actuales para `anon`, `authenticated` y `service_role` sobre
  tablas publicas verificadas no incluyen `SELECT`, `INSERT`, `UPDATE` ni
  `DELETE`; aparecen solo privilegios como `REFERENCES`, `TRIGGER` y
  `TRUNCATE`.
- Esto bloquea pruebas end-to-end por rol mediante `SET ROLE authenticated` y
  explica errores `permission denied for table ...`.

Limitacion pendiente:

- La CLI de Supabase no pudo generar tipos porque `docker` no existe en PATH
  para esta sesion.
- No se ejecuto `db push`, `link`, `login` ni `migration repair`.
- Ejecutar pruebas SQL con rollback.
- Repetir validaciones de build despues del reset real.

## 20. Plan De Despliegue Remoto Posterior

1. Habilitar Supabase CLI y Docker localmente.
2. Ejecutar `supabase start`.
3. Ejecutar `supabase db reset` local.
4. Verificar tablas, constraints, RLS y grants con SQL local.
5. Solo despues preparar aplicacion remota controlada.
6. No usar `supabase db push` hasta aprobacion explicita.
7. No usar `supabase migration repair` sin instruccion explicita.

## 21. Confirmaciones

- No se modifico la base remota.
- No se ejecuto `supabase db push`.
- No se ejecuto `supabase migration repair`.
- No se crearon enrollments.
- No se modifico `docs/student-learning-workflow.md`.

## 22. Environment Remediation Status

Fase 8.5B instalo Supabase CLI local como dependencia `devDependency` y
verifico `npx.cmd supabase --version = 2.110.0`.

El rehearsal completo sigue pendiente porque:

- WSL no esta instalado;
- Docker no esta instalado o no esta en PATH;
- `npx.cmd supabase status` no puede inspeccionar contenedores sin Docker;
- no se ejecuto `supabase start`;
- no se ejecuto `supabase db reset`.

## 23. Actualizacion Fase 8.5C1

Se creo una nueva migracion incremental:

```text
supabase/migrations/20260730000000_harden_runtime_grants.sql
```

Objetivo de la migracion:

- revocar privilegios no operativos o inseguros de `anon` y `authenticated`;
- conceder `SELECT` a `authenticated` donde RLS debe decidir filas;
- mantener escrituras no comerciales existentes sujetas a policies admin o de
  progreso;
- no conceder escrituras comerciales directas a `authenticated`;
- dejar `stripe_webhook_events` fuera del alcance de lectura de
  `authenticated`;
- conceder permisos administrativos a `service_role`;
- limitar `purchase_number_seq` a operaciones server-side.

El rehearsal por `npm.cmd run supabase:reset` no pudo completarse porque Codex
no ve Docker/Podman. El comando fallo antes de aplicar migraciones con:

```text
LegacyDbBootstrapError: failed to inspect service
```

No se uso `db push`, `link`, `login` ni `migration repair`.

## 24. Actualizacion Fase 8.5D

El checkpoint comercial queda preparado para revisar con:

- migracion comercial;
- migracion de grants;
- tipos Supabase generados;
- clientes Supabase tipados;
- repositories comerciales tipados;
- documentacion de readiness.

No se ejecuto `db push`, `migration repair`, staging, commit ni push durante
esta fase.
