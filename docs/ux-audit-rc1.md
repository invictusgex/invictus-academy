# UX Audit RC1

## Alcance

Auditoría de consistencia de la experiencia privada del alumno:

- Dashboard
- Programa
- Detalle de módulo

No se modificaron base de datos, autenticación, Stripe, Storage, CMS ni sistema
de progreso.

## Hallazgos

- La nomenclatura visible mezclaba `Modulo`, `modulo`, `modulos` y `formacion`
  sin acentos en pantallas privadas.
- Los loaders de Dashboard, Programa y Detalle de módulo no siempre usaban los
  mismos títulos que las pantallas cargadas.
- El detalle de módulo mantenía textos de videos, recursos, objetivos y
  navegación con copy menos consistente que el resto del área privada.
- Los estados vacíos eran correctos funcionalmente, pero algunos mensajes no
  mantenían la misma voz de mentoría profesional.
- No se encontraron referencias visibles al modelo anterior basado en sesiones
  dentro del flujo privado activo.

## Cambios Realizados

- Se normalizó la nomenclatura visible a `Programa`, `Módulo`, `Formación` y
  `Recursos` en Dashboard, Programa y Detalle de módulo.
- Se ajustaron títulos y descripciones de secciones para alinear loaders con
  pantallas cargadas.
- Se unificó el copy de estados vacíos para videos, recursos, objetivos,
  escenarios y módulos disponibles.
- Se ajustaron CTAs visibles como `Comenzar módulo`, `Continuar módulo`,
  `Revisar módulo` y `Ver módulo`.
- Se normalizó la navegación entre módulos con etiquetas consistentes:
  `Módulo anterior`, `Programa`, `Siguiente módulo`.

## Cambios Pospuestos

- No se creó un componente compartido para estilos de botones, aunque hay clases
  repetidas en CTAs primarios y secundarios. Conviene hacerlo en una fase de
  refactor visual con pruebas de regresión.
- No se modificó copy público de marketing, aunque algunas piezas públicas aún
  usan lenguaje comercial basado en sesiones.
- No se agregó una tarjeta visible de `Session 101`; corresponde a una fase
  funcional posterior del Student Journey.
- No se agregaron breadcrumbs nuevos para evitar cambios de navegación fuera de
  esta auditoría.

## Recomendaciones Para RC1.3

- Revisar el flujo completo de escenarios desde la perspectiva del alumno y
  alinear vacíos, errores y CTAs con el tono del Dashboard.
- Consolidar estilos de enlaces y botones privados en uno o dos componentes
  compartidos para reducir diferencias visuales.
- Revisar responsive con capturas reales en mobile y desktop antes del release
  final.

## Recomendaciones Para RC1.4

- Definir la primera versión visual del camino hacia `Session 101` sin
  modificar todavía reglas de desbloqueo.
- Integrar el futuro Student Journey como capa de experiencia sobre el progreso
  modular, sin convertir videos o recursos en unidades de progreso.
- Auditar copy público y privado de forma conjunta para evitar diferencias entre
  promesa comercial y experiencia interna.
