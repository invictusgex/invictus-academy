# Runtime Grants y RLS End-To-End

## 1. Hallazgo original

La verificacion runtime de Fase 8.5C confirmo que las tablas, constraints,
indices, sequence, RLS y policies existen localmente.

El bloqueo pendiente era de permisos SQL: `anon`, `authenticated` y
`service_role` no tenian permisos operativos suficientes para probar RLS
end-to-end. En `pg_class.relacl` aparecian privilegios como `Dxtm`, pero no
`arwd`.

## 2. Diferencia entre grants y RLS

Los grants permiten que un rol intente ejecutar una operacion SQL sobre una
tabla. RLS decide que filas puede ver o modificar despues de que el permiso de
tabla existe.

Sin `SELECT`, `INSERT`, `UPDATE` o `DELETE` de tabla, las policies no llegan a
evaluarse de forma util.

## 3. Modelo de grants objetivo

- `anon`: sin lectura directa de contenido academico privado, perfiles,
  enrollments ni datos comerciales.
- `authenticated`: lectura sujeta a RLS en tablas necesarias para alumno,
  progreso, contenido y datos comerciales propios.
- `authenticated`: escrituras no comerciales ya existentes solo donde hay
  policies especificas.
- `service_role`: permisos administrativos explicitos para operaciones de
  servidor.

## 4. Migracion creada

Se creo:

```text
supabase/migrations/20260730000000_harden_runtime_grants.sql
```

La migracion revoca privilegios inseguros de `anon` y `authenticated` antes de
conceder permisos minimos. No crea policies nuevas, no cambia ownership y no
usa `SECURITY DEFINER`.

## 5. Grants authenticated

Permisos previstos:

- `SELECT`: `profiles`, `products`, `enrollments`, `admin_users`,
  `academy_modules`, `academy_module_videos`, `academy_resources`,
  `module_progress`, `purchases`, `purchase_events`.
- `INSERT`, `UPDATE`: `module_progress`.
- `INSERT`, `UPDATE`: `enrollments`, controlado por policies admin existentes.
- `UPDATE`: `academy_modules`, controlado por policy admin existente.
- `INSERT`, `UPDATE`, `DELETE`: `academy_module_videos` y
  `academy_resources`, controlado por policies admin existentes.

No se conceden escrituras comerciales directas sobre `purchases`,
`purchase_events` ni `stripe_webhook_events`.

## 6. Grants anon

`anon` no recibe permisos directos sobre las tablas privadas revisadas. La
aplicacion publica actual no requiere lectura directa desde cliente anonimo
sobre contenido academico o comercial.

## 7. Grants service_role

`service_role` recibe `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre las tablas
necesarias para operaciones server-side y administracion. Este rol no debe
usarse en navegador.

## 8. Sequence

`purchase_number_seq` queda sin permisos para `anon` y `authenticated`.

`service_role` recibe `USAGE`, `SELECT` y `UPDATE` para permitir inserciones
server-side de Purchases con `purchase_number` generado automaticamente.

## 9. Reset local

Comando preparado:

```powershell
npm.cmd run supabase:reset
```

Resultado en Codex:

```text
LegacyDbBootstrapError: failed to inspect service
```

La causa operacional es que Docker/Podman no esta visible para Codex.

## 10. Pruebas profiles

Pendiente. No se ejecuto RLS end-to-end porque el reset local no pudo aplicar
la migracion de grants.

Pruebas esperadas:

- usuario A lee profile A;
- usuario A no lee profile B;
- anon no lee profiles;
- usuario A no escribe profiles sin permiso previsto.

## 11. Pruebas purchases

Pendiente por bloqueo de reset local.

Pruebas esperadas:

- usuario A lee Purchase A;
- usuario A no lee Purchase B;
- usuario B no lee Purchase A;
- authenticated no inserta, actualiza ni elimina Purchases.

## 12. Pruebas purchase_events

Pendiente por bloqueo de reset local.

Pruebas esperadas:

- usuario A lee eventos de Purchase A;
- usuario A no lee eventos de Purchase B;
- authenticated no inserta eventos;
- anon no lee eventos.

## 13. Webhook events

Pendiente por bloqueo de reset local.

Modelo previsto:

- `authenticated` no lee ni escribe `stripe_webhook_events`.
- `anon` no lee `stripe_webhook_events`.
- `service_role` opera server-side.

## 14. Products/enrollments

Pendiente por bloqueo de reset local.

Modelo previsto:

- `authenticated` lee productos activos via RLS.
- usuario A lee su enrollment.
- usuario A no lee enrollment de B.
- anon no lee enrollments.

## 15. Contenido academico

Pendiente por bloqueo de reset local.

Modelo previsto:

- anon no lee modulos, videos ni recursos privados.
- authenticated sin enrollment activo no lee contenido protegido.
- authenticated con enrollment activo lee contenido publicado de su producto.
- admin conserva lectura por policies admin.

## 16. Claims simulados

Las policies reales usan `auth.uid()`. La prueba PostgreSQL prevista debe usar:

```sql
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"<uuid>","role":"authenticated"}',
  true
);
```

## 17. Limitaciones

- `where.exe docker` no encuentra Docker.
- `Get-Command docker` no encuentra Docker.
- `C:\Program Files\Docker\Docker\resources\bin\docker.exe` no existe desde
  Codex.
- `npx.cmd supabase status` falla con `docker: command not found`.
- `npm.cmd run supabase:reset` falla antes de aplicar migraciones.
- `npx.cmd supabase gen types typescript --local --schema public` falla por
  ausencia de Docker/Podman.

## 18. Tipos generados

En la fase posterior de integracion, el archivo generado quedo disponible:

```text
src/lib/supabase/database.types.ts
```

Incluye `Database`, schema `public`, tablas comerciales y
`amount_refunded_minor`.

## 19. Tipado de clientes

Clientes tipados con `Database`:

- `src/lib/database/client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/proxy.ts`

## 20. Tipado de repositories

Repositories comerciales tipados con aliases derivados de
`Database["public"]["Tables"]`:

- `profile.repository.ts`
- `product.repository.ts`
- `enrollment.repository.ts`
- `purchase.repository.ts`
- `purchase-event.repository.ts`
- `stripe-webhook-event.repository.ts`

## 21. Casts pendientes

Los casts `unknown as` comerciales objetivo fueron eliminados.

Siguen existiendo casts en repositories no comerciales de CMS/admin/progress y
escenarios. Quedan fuera del alcance comercial y deben abordarse en una fase
posterior de typing general.

## 22. Seguridad

No se uso `db push`, `link`, `login`, `migration repair`, Stripe CLI ni comandos
remotos.

No se implemento Enrollment por pago.

No se registraron secretos en documentacion.

## 23. Proximo checkpoint Git

Antes de crear un checkpoint:

1. Hacer visible Docker/Podman para Codex.
2. Ejecutar `npx.cmd supabase status`.
3. Ejecutar `npm.cmd run supabase:reset`.
4. Validar grants finales.
5. Ejecutar pruebas RLS end-to-end.
6. Ejecutar `git diff --check`, lint y build.
