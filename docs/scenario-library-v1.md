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
No existen policies de `INSERT`, `UPDATE` ni `DELETE` en esta fase.

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

Toda consulta a Supabase vive en el repository.

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

## Funciones No Implementadas

Quedan fuera de esta fase:

- crear escenarios;
- editar escenarios;
- eliminar escenarios;
- publicar o archivar desde UI;
- categorias;
- etiquetas;
- comentarios;
- likes;
- recomendaciones;
- analytics;
- progreso por escenario;
- feed infinito;
- carga directa de archivos.
