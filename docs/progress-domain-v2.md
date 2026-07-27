# Progress Domain v2

## Dominio oficial

El dominio oficial de progreso academico es `ProgramProgress`.

La unidad academica y la unidad de progreso es el modulo. Los videos pertenecen
al modulo y pueden ser uno o varios, pero no cambian el conteo academico del
programa. El Modulo 4 puede contener dos videos y sigue contando como un solo
modulo.

## Modelo de progreso

`ProgramProgress` representa:

- `totalModules`: cantidad de modulos disponibles para progreso.
- `completedModules`: modulos completados.
- `inProgressModules`: modulos con avance parcial.
- `percentage`: porcentaje calculado por modulos completados.
- `currentModule`: modulo actual sugerido para continuar.
- `nextModule`: siguiente modulo en orden academico, si existe.
- `status`: estado global del programa.

Los estados permitidos son:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

No existen sesiones en el dominio publico de lectura. Los videos son contenido
interno del modulo y no agregan unidades de progreso al programa.

## Reglas de calculo

El porcentaje se calcula asi:

```text
completedModules / totalModules * 100
```

Solo participan los modulos que cumplen las reglas del contenido academico:

- `availability` debe ser `available`.
- `status` no debe ser `draft`.
- `status` no debe ser `archived`.
- el orden se toma del orden academico del programa.

Un modulo se considera una sola unidad academica. El programa nunca suma videos
como avance independiente: el Modulo 4 puede tener dos videos, pero aporta como
un unico modulo completado cuando su estado modular llega a completado.

## Responsabilidades del ProgressProvider

`ProgressProvider` es la fuente oficial de lectura para la UI privada.

Sus responsabilidades son:

- leer el progreso local como cache temporal;
- sincronizar con Supabase mediante `ProgressService`;
- mantener adaptadores temporales para la escritura historica por video;
- derivar el estado oficial `ProgramProgress`;
- exponer `progress` a traves de `ProgressContext`;
- evitar que Dashboard, Programa o vistas futuras recalculen porcentajes.

El estado crudo de cache permanece interno al provider y no debe ser consumido
directamente por componentes visuales.

## Responsabilidades de la UI

La UI debe consumir:

```ts
const { progress } = useProgressContext();
```

Dashboard, Programa y futuras vistas deben usar el mismo objeto `progress` para:

- porcentaje;
- modulos completados;
- modulo actual;
- siguiente modulo;
- estado del programa;
- listado de modulos con estado.

La UI puede resolver aspectos visuales como miniaturas, labels y composicion,
pero no debe implementar una segunda logica de progreso.

## Compatibilidad

Esta version no modifica:

- persistencia local;
- `module_progress`;
- sincronizacion;
- repositories;
- services de datos;
- queries;
- tablas;
- migraciones;
- auth;
- enrollment;
- Storage.

La escritura historica por video se conserva como adaptador temporal para no
romper la cache local ni la sincronizacion actual. Esa escritura no debe
convertirse en un nuevo dominio publico: la lectura oficial se consolida a nivel
de modulo mediante `ProgramProgress`.

## Legacy Cleanup

Se eliminaron componentes heredados que no estaban referenciados por rutas,
pantallas ni componentes activos:

- `DashboardProgressCenter`
- `ModuleProgramCard`
- `TrainingSession`
- `ModuleSessionsList`
- `SessionCompletionPanel`
- `SessionProgress`

Tambien se eliminaron aliases y tipos internos que solo existian para esos
componentes, como `CompletedModuleVideos`, `isModuleCompleted`,
`completedSessions`, `pendingSessions` y `totalSessions` dentro del resumen de
modulo. Se limpiaron ademas `formatVideoProgressStatusLabel` y la exposicion
publica de `getModuleSummary` en `ProgressContext`, porque ya no tenian
consumidores activos.

Se conserva temporalmente la escritura historica por video en `ProgressProvider`,
`ProgressContext`, `progress-cache.service.ts` y `progress.service.ts`. Esa capa
no representa el dominio oficial de lectura; existe para no romper la cache
local ni la sincronizacion existente con `module_progress`.
