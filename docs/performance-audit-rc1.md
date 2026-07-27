# RC1.5 Performance Audit & Client Efficiency

## 1. Alcance auditado

Se reviso el area privada de estudiantes: Dashboard, Programa, Detalle de modulo, componentes compartidos de academia, hooks de miniaturas y recursos, ProgressProvider, ProgressContext, servicios de progreso, servicios de contenido, servicio de Storage, resolucion de signed URLs, imagenes y componentes marcados como client-side.

La auditoria se mantuvo dentro del alcance de rendimiento. No se modifico base de datos, autenticacion, Stripe, CMS, Storage RLS, modelo academico, copy, UI, progreso funcional ni dependencias.

## 2. Cuellos de botella encontrados

- `StorageService.createSignedUrl()` generaba una URL firmada en cada llamada valida, incluso cuando el mismo path ya habia sido resuelto dentro de la misma sesion.
- Las resoluciones concurrentes hacia el mismo objeto privado podian disparar mas de una llamada a Supabase Storage antes de que la primera respuesta estuviera disponible.
- Las listas de modulos, escenarios, previews y detalle de modulo dependen de thumbnails privados; por eso la optimizacion mas segura era centralizar cache y deduplicacion en el servicio, no en cada componente.
- Las imagenes usan `next/image` con `width`, `height` y `unoptimized` para URLs externas o firmadas. Esto evita depender del optimizer para URLs temporales, pero limita optimizaciones automaticas de responsive `srcset`.

## 3. Mejoras aplicadas

- Se agrego cache temporal en memoria para signed URLs, con clave por `path` y duracion.
- Se agrego deduplicacion de solicitudes concurrentes para el mismo `path` y `expiresInSeconds`.
- Se agrego margen de expiracion de 30 segundos para evitar reutilizar URLs cercanas a vencer.
- Se invalida la cache asociada al path despues de `uploadFile()`, `replaceFile()` y `deleteFile()`.
- La base de datos sigue guardando rutas internas, no URLs firmadas.

Estas mejoras son inferidas por revision de codigo: reducen llamadas repetidas a Supabase Storage para el mismo objeto durante una sesion activa. No se afirma una reduccion cuantitativa de tiempo, renders o bundle.

## 4. Optimizaciones descartadas y motivo

- Convertir componentes client-side a Server Components: descartado por riesgo funcional. Dashboard, Programa y Detalle consumen contexto de progreso, hooks, estado de cliente o navegacion interactiva.
- Quitar `unoptimized` de imagenes privadas: descartado porque las signed URLs son temporales y no se deben tratar como URLs publicas estables.
- Agregar nuevas herramientas de bundle analysis: descartado por alcance; no se pueden instalar dependencias nuevas.
- Memoizar indiscriminadamente arrays, objetos y callbacks: descartado porque no habia evidencia suficiente de renders costosos y podria aumentar complejidad sin beneficio claro.
- Cambiar contratos de servicios para resolucion por lote: descartado para no modificar comportamiento ni arquitectura publica durante RC1.5.

## 5. Componentes que deben permanecer client-side

- `ProgressProvider`: usa hooks de React, contexto, cache local, usuario autenticado y sincronizacion con Supabase.
- `ProgressContext`: expone `useProgressContext()` para consumo del estado de progreso.
- `StudentDashboard`: consume progreso y renderiza estado derivado de la sesion del alumno.
- `StudentProgramPage`: consume progreso y estado de carga del provider.
- `StudentModuleDetailPage`: consume progreso y estados de video del provider.
- Hooks de assets de academia: resuelven URLs firmadas en cliente y deben reaccionar a cambios de datos.
- Componentes administrativos de preview/formularios: usan estado local, efectos y previews.

## 6. Revision de signed URLs

El bucket `academy-assets` permanece privado. La aplicacion usa `createSignedUrl()` y no `getPublicUrl()` para objetos internos. Las URLs firmadas se generan bajo demanda, no se guardan en base de datos y se reutilizan temporalmente solo en memoria del cliente.

La duracion actual por defecto continua siendo de 300 segundos. La cache respeta esa duracion y deja de reutilizar una URL 30 segundos antes de su expiracion.

## 7. Revision de imagenes

Las miniaturas usan `next/image` con dimensiones explicitas, lo que evita layout shifts basicos. Se mantiene `unoptimized` para URLs firmadas o externas, ya que no se configuro ni se debe forzar un flujo de optimizer para assets privados temporales en esta fase.

No se modifico identidad visual, tamanos, placeholders ni copy.

## 8. Revision de progreso y cache

El progreso sigue centralizado en `ProgressProvider` y se consume mediante `useProgressContext()`. No se detectaron recalculos globales activos fuera del provider en Dashboard, Programa o Detalle de modulo. No se modifico `module_progress`, el modelo basado en modulo ni la compatibilidad historica por video.

## 9. Limitaciones de medicion

No se instalo bundle analyzer ni herramientas externas. La validacion disponible es estatica: lint, build y salida nativa de Next.js durante `npm.cmd run build`.

La mejora de signed URLs esta verificada por revision de codigo, no por metricas de red capturadas en navegador.

Metricas nativas observadas en build:

- Next.js 16.2.10 con Turbopack.
- Compilacion de produccion completada en 6.0s.
- TypeScript completado en 10.3s.
- Generacion estatica completada: 16/16 paginas en 694ms.
- Rutas del area privada de alumnos: `/academy`, `/academy/escenarios`, `/academy/programa` estaticas; `/academy/escenarios/[scenarioKey]` y `/academy/programa/[moduleId]` dinamicas.

## 10. Recomendaciones para RC1.6

- Medir requests reales de signed URLs en navegador antes y despues de sesiones de navegacion por Dashboard, Programa y Detalle.
- Evaluar si los thumbnails privados pueden resolverse en lote desde servicios server-side sin romper RLS ni experiencia autenticada.
- Revisar `next/image` con una estrategia segura para assets privados si en el futuro se habilita un loader controlado.
- Considerar medicion de bundle por ruta si se autoriza una herramienta de analisis.

## 11. Confirmacion funcional

No se implementaron funcionalidades nuevas. No se modifico el flujo academico, progreso, autenticacion, Stripe, CMS, Storage RLS, base de datos, copy ni UI.
