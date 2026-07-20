# Progress sync v1

Este documento describe la segunda fase de sincronizacion de progreso de
Invictus Trading Academy. Supabase pasa a ser la fuente principal del progreso y
`localStorage` se conserva como cache temporal y mecanismo de recuperacion.

## Arquitectura actual

```text
RequireAuth
  |
RequireEnrollment
  |
ProgressProvider
  |
ProgressService
  |
ProgressRepository
  |
Supabase Client
```

Responsabilidades:

- `ProgressProvider`: estado visible para la UI privada, carga inicial,
  `refresh()`, `markCompleted()` y `markInProgress()`.
- `ProgressService`: fusion entre progreso remoto y cache local, calculo del
  progreso remoto por modulo y conversion al modelo local cacheado.
- `ProgressRepository`: lectura y escritura de `module_progress` en Supabase.
- `progress-cache.service`: lectura/escritura segura de `localStorage`.
- `module-progress`: calculos reutilizables de porcentaje, resumen de modulos,
  resumen del programa y siguiente sesion pendiente.

Los componentes React no importan Supabase directamente. La UI privada consume
`ProgressProvider`.

## Modelo local de cache

La cache local vive en:

```text
invictus-academy-progress-v1
```

Estructura:

```ts
{
  version: 1,
  programs: {
    [programId]: {
      modules: {
        [moduleId]: {
          videos: {
            [videoId]: {
              status: "not-started" | "in-progress" | "completed",
              updatedAt: string
            }
          }
        }
      }
    }
  }
}
```

La cache local no es la fuente principal. Se usa para:

- recuperar la experiencia si Supabase falla;
- hidratar la UI mientras se sincroniza;
- conservar cambios locales hasta que puedan subirse.

## Modelo remoto

La tabla remota usada en esta fase es:

```text
public.module_progress
```

Columnas relevantes:

- `profile_id`
- `product_id`
- `module_key`
- `status`
- `progress_percent`
- `started_at`
- `completed_at`
- `last_seen_at`

El remoto guarda progreso agregado por modulo. No existe todavia una tabla
`lesson_progress`.

## Flujo de carga

```text
login
  |
RequireEnrollment
  |
ProgressProvider
  |
leer Supabase mediante ProgressService
  |
si Supabase falla: usar cache local
  |
si Supabase responde: actualizar cache local
  |
render Dashboard y paginas privadas
```

El Dashboard, las tarjetas del programa y la sesion de formacion leen progreso
desde `ProgressProvider`.

## Sincronizacion bidireccional

Reglas:

- Si remoto > local, se actualiza `localStorage`.
- Si local > remoto, se actualiza Supabase.
- Si ambos representan el mismo progreso, no se escribe.
- Nunca se degrada progreso.

El progreso remoto normaliza siempre:

- `progressPercent = 0` => `status = not_started`
- `progressPercent > 0 && progressPercent < 100` => `status = in_progress`
- `progressPercent = 100` => `status = completed`

## Modulos con varias sesiones

El programa actual tiene 7 modulos y 8 sesiones. El Modulo 4 contiene 2
sesiones.

El calculo del progreso se hace por sesiones completadas:

```text
completedSessions / totalSessions
```

Para el Modulo 4:

- 1 de 2 sesiones completadas => `progress_percent = 50`
- 2 de 2 sesiones completadas => `progress_percent = 100`

Un modulo solo se considera completado cuando todas sus sesiones estan
completadas.

## Continuar formacion

`Continuar formacion` se calcula desde `ProgressProvider`, usando
`getNextPendingSession()`.

La busqueda recorre `course.modules` en el orden definido por `program.ts` y
luego los videos de cada modulo en orden. La primera sesion que no este
`completed` se considera la siguiente sesion pendiente.

## Limitaciones actuales

- `localStorage` permanece como cache y recuperacion.
- Supabase conserva progreso agregado por modulo, no detalle remoto por sesion.
- La reconstruccion de sesiones desde progreso remoto agregado usa el orden de
  videos definido en el contenido editorial.
- No se modifica autenticacion, enrollment ni RLS en esta fase.
- No se ejecutan migraciones en esta fase.
