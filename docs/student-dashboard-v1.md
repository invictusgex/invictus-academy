# Student Dashboard v1

Esta fase convierte `/academy` en un dashboard funcional del alumno usando
datos reales ya disponibles. No agrega tablas, migraciones, RLS, reglas de
auth, reglas de enrollment ni nuevas escrituras de progreso.

## Objetivo

El dashboard ayuda al alumno a:

- entender su posicion dentro del programa;
- continuar su formacion;
- ver progreso general por modulo;
- acceder a modulos disponibles;
- ver escenarios recientes publicados;
- navegar rapidamente a las areas privadas existentes.

## Fuentes De Datos

- Programa y modulos: `getAcademyProgram` mediante
  `AcademyContentService` y `AcademyContentRepository`.
- Progreso: `ProgressContext`, usando el estado persistido sincronizado de
  `module_progress.status` para el resumen del dashboard, sin modificar la
  escritura actual ni el sync existente.
- Usuario: `useAuth`, usando email solo para derivar un nombre legible cuando
  no existe otra fuente disponible en la infraestructura actual.
- Escenarios recientes: `ScenarioLibraryService.getRecentPublishedScenarios`,
  que reutiliza `ScenarioLibraryRepository` y limita la consulta a 3 registros.
- Miniaturas privadas: `StorageService.resolveAssetUrl`.

Los componentes visuales no importan Supabase ni repositories.

## Calculo De Progreso

El progreso general se calcula como:

```text
modulos completados / modulos publicados y accesibles
```

Un modulo cuenta como una sola unidad academica. El Modulo 4 sigue contando
como una unidad aunque tenga dos videos. Un modulo se considera completado
solamente cuando el registro sincronizado de `module_progress` para ese
`module_key` tiene `status = 'completed'`. Si no existe registro para un modulo
visible, se trata como `not_started`.

El porcentaje se calcula asi:

```text
min(100, round((modulos_completados / modulos_disponibles) * 100))
```

Si no existen modulos disponibles, el porcentaje es 0.

Estados mostrados:

- `Formacion no iniciada`
- `Formacion en progreso`
- `Programa completado`

## Continuar Formacion

La tarjeta principal usa esta prioridad:

1. primer modulo con `module_progress.status = 'in_progress'`;
2. primer modulo publicado y accesible no completado;
3. primer modulo disponible cuando no existen registros de progreso;
4. estado de programa completado cuando no hay pendientes.

La tarjeta de continuar dirige a:

```text
/academy/programa/[moduleId]
```

El CTA principal del hero dirige a `/academy/programa` cuando no hay progreso,
a `/academy/programa/[moduleId]` cuando existe un modulo iniciado y a
`/academy/programa` cuando el programa esta completado.

No se dirige directamente a videos.

## Modulos Mostrados

La vista compacta muestra hasta 4 modulos accesibles en orden academico. No
aplica bloqueo secuencial porque esa regla no existe en el negocio actual.
Los registros de progreso cuyo `module_key` no coincide con un modulo visible
del programa no entran en el denominador ni aumentan los completados.

## Escenarios Recientes

Se cargan hasta 3 escenarios publicados visibles para el alumno. No se agregan
busqueda, filtros, favoritos, recomendaciones ni progreso de escenarios.

Si falla la carga de escenarios, el resto del dashboard permanece visible y la
seccion muestra un estado discreto.

## Storage

Las miniaturas internas se resuelven bajo demanda mediante signed URLs. No se
usa `getPublicUrl`, no se guardan signed URLs y no se envia una ruta interna
como `src` de imagen. Las URLs externas heredadas se conservan cuando ya son
seguras para mostrar. En el dashboard solo se firman miniaturas de modulos
realmente visibles en la seccion compacta o en la tarjeta de continuar.

## Estados Vacios

Se cubren:

- sin modulos disponibles;
- sin progreso;
- programa completado;
- sin escenarios publicados;
- ausencia de miniaturas.

## Responsive

- Desktop: hero amplio, resumen en 3 columnas y grids balanceados.
- Tablet: reduccion progresiva de columnas.
- Mobile: stack vertical, CTA full-width y tarjetas sin overflow.

## Accesibilidad

- `/academy` mantiene un solo `h1` dentro del hero.
- Los skeletons usan `role="status"`.
- Los enlaces tienen textos descriptivos.
- El progreso conserva etiqueta accesible mediante `ProgressBar`.
- Las imagenes informativas tienen `alt`; los fallbacks no dependen solo del
  color.

## Refinamiento Visual Fase 7.2

La jerarquia visual final queda:

1. Hero de bienvenida.
2. Continuar formacion.
3. Resumen del programa.
4. Programa.
5. Escenarios recientes.
6. Accesos rapidos.

El refinamiento mantiene el fondo oscuro institucional y el acento cyan sin
agregar datos, rutas, metricas ni nuevas consultas. El hero suma decoracion CSS
abstracta de estructura/flujo, la tarjeta de continuar recibe mayor peso visual,
las tarjetas compactas estabilizan miniaturas y alturas, y los CTAs tienen
microinteracciones sutiles con soporte `motion-reduce`.

En responsive, los CTAs pasan a ancho completo en mobile, las miniaturas usan
proporcion estable `16/10` y los grids conservan stack vertical antes de pasar a
2, 3 o 4 columnas. Los fallbacks de miniaturas son internos por CSS y no cargan
imagenes remotas. La accesibilidad conserva un unico `h1`, headings por seccion,
foco visible y barra de progreso con ARIA.

## Limites

No se implementa:

- dashboard analitico avanzado;
- perfil;
- certificados;
- gamificacion;
- notificaciones;
- pagos;
- Stripe;
- nuevas rutas de recursos;
- pagina de Mi progreso;
- bloqueo secuencial;
- tracking de tiempo;
- nuevas tablas de actividad;
- Fase 6C.3.
