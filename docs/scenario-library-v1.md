# Scenario Library v1

La Biblioteca de Escenarios agrega un espacio independiente para publicar
analisis, ejemplos operativos y estructuras de mercado. No forma parte del
programa academico y no modifica modulos, videos, recursos ni progreso.

## Proposito

La biblioteca permite consultar contenido dinamico del mercado:

- analisis;
- escenarios operativos;
- capturas;
- videos;
- PDFs;
- enlaces;
- ejemplos de gamma, order flow, heatmap y perfil de volumen.

No es una red social. No incluye recomendaciones, likes, comentarios,
seguidores, feed infinito ni progreso por escenario.

## Diferencia Respecto Al Programa

El programa academico usa:

- `academy_modules`
- `academy_module_videos`
- `academy_resources`
- `module_progress`

La biblioteca usa solo:

- `market_scenarios`

Los escenarios no pertenecen a modulos y no son unidad de progreso.

## Schema

Tabla principal:

```text
public.market_scenarios
```

Columnas:

- `id uuid primary key`
- `scenario_key text not null unique`
- `title text not null`
- `summary text not null default ''`
- `description text not null default ''`
- `scenario_type text not null`
- `market text not null`
- `instrument text not null default ''`
- `event_date date`
- `thumbnail_url text`
- `video_provider text`
- `video_id text`
- `video_url text`
- `document_url text`
- `metadata jsonb not null default '{}'`
- `status text not null default 'draft'`
- `published_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

No se almacena HTML arbitrario ni codigo embed.

## Tipos

`scenario_type` esta limitado a:

- `market_analysis`
- `trade_review`
- `execution_example`
- `gamma_structure`
- `order_flow`
- `heatmap`
- `volume_profile`
- `macro_event`
- `other`

`market` esta limitado a:

- `futures`
- `options`
- `equities`
- `macro`
- `other`

`instrument` queda como texto normalizado para permitir valores como `NQ`,
`MNQ`, `ES`, `MES`, `SPX` o `SPY`.

## Estados

Estados:

- `draft`
- `published`
- `archived`

Constraint de publicacion:

```text
published_at is null or status = 'published'
```

Solo los escenarios `published` son visibles para alumnos.

## RLS

RLS esta habilitado en `market_scenarios`.

Policies de lectura:

- `market_scenarios_admin_read_all`: administradores autenticados presentes en
  `public.admin_users` pueden leer todos los escenarios.
- `market_scenarios_enrolled_read_published`: alumnos autenticados con
  enrollment activo, no revocado, iniciado y no vencido del producto
  `trading-basado-en-datos` pueden leer escenarios `published`.

No existe policy publica para `anon`.

La fase 6B agrega la migracion
`20260721005000_admin_scenario_write_policies.sql` con policies de escritura
solo para usuarios en `public.admin_users`:

- `INSERT`
- `UPDATE`
- `DELETE`

No amplia permisos de alumnos.

## Repository

Archivo:

```text
src/lib/repositories/scenario-library.repository.ts
```

Operaciones:

- `getPublishedScenarios`
- `getPublishedScenarioByIdOrKey`
- `getAdminScenarios`
- `getAdminScenarioById`
- `getAdminScenarioSummary`
- `scenarioKeyExists`
- `createScenario`
- `updateScenario`
- `updateScenarioStatus`
- `deleteScenario`

Toda consulta y escritura a Supabase vive en el repository.

## Service

Archivo:

```text
src/lib/services/scenario-library.service.ts
```

Responsabilidades:

- normalizar filtros;
- mapear filas SQL;
- ocultar datos no necesarios al alumno;
- generar etiquetas en espanol;
- construir URLs seguras de video para proveedores soportados;
- validar entradas administrativas;
- generar `scenario_key`;
- aplicar reglas de publicacion;
- validar cambios de estado;
- validar eliminacion;
- convertir errores tecnicos en resultados controlados.

Orden por defecto para alumnos:

1. `event_date` descendente;
2. `published_at` descendente.

Orden por defecto para administradores:

1. `updated_at` descendente.

## Rutas

Alumno:

- `/academy/escenarios`
- `/academy/escenarios/[scenarioKey]`

Estas rutas quedan dentro del layout privado existente:

```text
RequireAuth
RequireEnrollment
AcademyShell
```

Administracion:

- `/admin/scenarios`
- `/admin/scenarios/[scenarioId]`
- `/admin/scenarios/new`
- `/admin/scenarios/[scenarioId]/edit`

Estas rutas quedan dentro de:

```text
RequireAuth
RequireAdmin
AdminShell
```

## Filtros

La lectura permite filtros controlados:

- `scenario_type`
- `market`
- `instrument`
- `year`
- rango `event_date`
- busqueda simple por `title`

## Contenido Visible Para Alumnos

Los alumnos ven:

- titulo;
- resumen;
- descripcion;
- tipo;
- mercado;
- instrumento;
- fecha del escenario;
- thumbnail si existe;
- video seguro si existe;
- documento o enlace si existe.

No ven metadata interna ni estados no publicados.

## Gestion Administrativa

La fase 6B permite:

- crear escenarios;
- editar escenarios;
- publicar escenarios;
- volver escenarios publicados a borrador;
- archivar escenarios;
- eliminar escenarios solo si estan en `draft` o `archived`.

No se permite eliminar escenarios `published`.

## Campos Editables

El formulario administrativo permite editar:

- `title`
- `summary`
- `description`
- `scenario_type`
- `market`
- `instrument`
- `event_date`
- `thumbnail_url`
- `video_provider`
- `video_id`
- `video_url`
- `document_url`
- `status`

`metadata` se conserva como `{}` porque aun no hay campos funcionales definidos
y no se acepta JSON arbitrario desde la UI.

Campos protegidos:

- `id`
- `scenario_key`
- `published_at`
- `created_at`
- `updated_at`

## Generacion De `scenario_key`

`scenario_key` se genera al crear el escenario:

- basado inicialmente en `title`;
- minusculas;
- sin acentos;
- solo letras, numeros y guiones;
- sin guiones duplicados;
- sin guiones al inicio o final;
- con control de colisiones mediante sufijos numericos.

No se regenera al editar el titulo.

## Publicacion

`published_at` no se edita manualmente.

Reglas:

- al pasar a `published` sin fecha previa, se asigna la fecha actual;
- si continua `published`, conserva `published_at`;
- al pasar a `draft` o `archived`, se guarda `published_at = null`.

## Validaciones

Limites elegidos:

- `title`: obligatorio, maximo 160 caracteres.
- `summary`: obligatorio, maximo 300 caracteres.
- `description`: opcional, maximo 5000 caracteres.
- `instrument`: maximo 32 caracteres, normalizado a mayusculas.
- URLs: maximo 500 caracteres, solo `http` o `https`.
- `video_id`: maximo 300 caracteres.

Tambien se validan:

- `scenario_type` segun constraint real;
- `market` segun constraint real;
- `status` segun constraint real;
- `event_date` con formato valido;
- coherencia entre `video_provider`, `video_id` y `video_url`;
- ausencia de marcado HTML arbitrario.

## Storage

Supabase Storage no esta implementado en esta fase. Miniaturas, documentos y
videos se registran mediante URLs.

## Funciones No Implementadas

Quedan fuera de esta fase:

- categorias;
- etiquetas;
- comentarios;
- likes;
- recomendaciones;
- analytics;
- progreso por escenario;
- feed infinito;
- carga directa de archivos.
- duplicacion de escenarios.
