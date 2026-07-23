# Student Program v1

Esta subfase convierte `/academy/programa` en el indice principal de la
formacion. No modifica auth, enrollment, progreso persistido, Supabase,
queries, repositories, services ni Storage.

## Objetivo

La pagina permite que el alumno entienda:

- su progreso general;
- el modulo actual o siguiente accion;
- que modulos estan completados, en progreso o no iniciados;
- el orden completo del programa;
- como entrar a cada modulo.

## Jerarquia

1. Encabezado de pagina.
2. Resumen del progreso.
3. Modulo actual.
4. Listado completo de modulos.
5. Estado vacio cuando no existen modulos disponibles.

## Fuente De Datos

La pagina sigue usando `getAcademyProgram()` desde el Server Component. El
contenedor cliente recibe el `course` ya cargado y consume `ProgressContext`
para leer el estado sincronizado por modulo.

No se agregan consultas nuevas para el indice del programa.

## Progreso

Se reutiliza la formula compartida con el dashboard:

```text
min(100, round((modulos_completados / modulos_disponibles) * 100))
```

El denominador incluye solo modulos disponibles para el alumno. El Modulo 4
cuenta como una sola unidad aunque tenga dos videos.

## Modulo Actual

La seleccion reutiliza la misma regla del dashboard:

1. primer modulo en progreso;
2. primer modulo accesible no completado;
3. primer modulo disponible cuando no hay progreso;
4. estado completado si todos estan terminados;
5. estado vacio si no existen modulos.

La ruta de accion es siempre `/academy/programa/[moduleId]`; nunca dirige a
videos.

## Estados De Modulo

Estados visibles:

- `No iniciado`;
- `En progreso`;
- `Completado`.

No se usan candados, prerequisitos ni opacidad baja para modulos accesibles.

## Miniaturas

Las miniaturas usan el flujo existente de signed URLs mediante
`useModuleThumbnailUrls`, que delega en `StorageService.resolveAssetUrl`. Las
URLs externas heredadas se conservan y las rutas internas no se envian como
`src` sin resolver. Si no hay imagen, se muestra un fallback interno por CSS.

## Loading

`/academy/programa/loading.tsx` refleja la estructura final:

- encabezado;
- resumen;
- modulo actual;
- listado.

Usa `StudentLoadingSkeleton` y no incluye spinner de pantalla completa.

## Empty State

Cuando no existen modulos disponibles:

- titulo: `Tu programa todavia no tiene modulos disponibles.`;
- descripcion: `El contenido aparecera aqui cuando sea publicado.`;
- accion: volver al dashboard.

## Responsive Y Accesibilidad

- Desktop: resumen compacto, modulo actual destacado y listado escaneable.
- Tablet: cards amplias sin columnas demasiado estrechas.
- Mobile: stack vertical, CTA full-width y miniaturas proporcionales.
- La pagina mantiene un solo `h1`.
- El progreso conserva ARIA mediante `ProgressBar`.
- No hay enlaces anidados ni botones dentro de enlaces.

## Limites

No se implementa:

- redisenio profundo del detalle del modulo;
- redisenio de recursos;
- busqueda o filtros;
- bloqueo secuencial;
- prerequisitos;
- certificados;
- favoritos;
- comentarios;
- notas del alumno;
- seguimiento por video;
- tiempo de estudio;
- nuevas rutas;
- Stripe;
- cambios administrativos.
