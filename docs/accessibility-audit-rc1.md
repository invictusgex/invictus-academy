# Accessibility Audit RC1

## 1. Alcance Auditado

Auditoría de accesibilidad del área privada de estudiantes:

- Dashboard
- Programa
- Detalle de módulo
- Navegación privada
- Sidebar
- Botón flotante de soporte
- Tarjetas
- Videos
- Recursos
- Estados de carga
- Estados vacíos
- Mensajes de error

No se modificaron base de datos, autenticación, Stripe, Storage, CMS ni sistema
de progreso.

## 2. Hallazgos

- La navegación privada no exponía `aria-current` para indicar la página activa.
- El enlace de marca del sidebar no tenía el mismo indicador de foco visible que
  el resto de CTAs privados.
- Las barras de progreso tenían `role="progressbar"` y valores numéricos, pero
  no exponían `aria-valuetext`.
- Los skeletons anunciaban carga, pero sus bloques visuales podían permanecer
  dentro del árbol accesible.
- Algunos CTAs repetidos en tarjetas usaban texto visible genérico, como `Ver
  módulo`, `Ver escenario` o `Descargar`.
- El diálogo de soporte tenía nombre accesible y trampa de foco, pero no
  declaraba `aria-modal`.
- El botón flotante de soporte mantenía el mismo `aria-label` aunque el panel ya
  estuviera abierto.

## 3. Mejoras Aplicadas

- Se agregó `aria-current="page"` a la navegación privada, incluyendo rutas
  hijas como detalle de módulo.
- Se reforzó el foco visible del enlace de marca y de los enlaces de navegación
  del sidebar.
- Se agregó `aria-valuetext` al componente compartido de barra de progreso.
- Se añadió `aria-busy`, `aria-live` y `aria-hidden` en skeletons para anunciar
  el estado sin leer bloques decorativos.
- Se marcaron elementos decorativos de estados vacíos con `aria-hidden`.
- Se agregaron nombres accesibles descriptivos en CTAs repetidos de módulos,
  escenarios y recursos.
- Se agregó `aria-modal="true"` al panel flotante de soporte.
- El botón flotante de soporte ahora anuncia si abre o cierra soporte mediante
  `aria-label` dinámico.
- Se respetó `prefers-reduced-motion` en el botón flotante de soporte.

## 4. Código Conservado Sin Cambios Y Motivo

- Se conservó el botón visual `Cerrar sesión` del sidebar sin conectarlo a
  logout para no modificar autenticación ni comportamiento funcional. El cierre
  de sesión funcional existente sigue estando en el header.
- No se alteró la jerarquía visual de tarjetas ni headings para evitar un
  rediseño fuera del alcance.
- No se modificó copy visible salvo nombres técnicos accesibles (`aria-label`,
  `aria-valuetext`, `aria-modal`, `aria-current`).
- No se agregaron atajos de teclado nuevos.

## 5. Riesgos O Limitaciones

- El proyecto no tiene tooling de accesibilidad automatizado configurado, como
  axe, Lighthouse o eslint-plugin-jsx-a11y.
- No se instalaron dependencias nuevas durante esta fase.
- No se verificó con lector de pantalla real desde el entorno disponible.
- No se ejecutó una prueba visual interactiva en navegador real para contraste o
  foco; la revisión fue por código y validaciones estáticas.

## 6. Casos Que Requieren Pruebas Manuales

- Recorrido completo con Tab y Shift + Tab en Dashboard, Programa y Detalle de
  módulo.
- Apertura, cierre con Escape y retorno de foco del panel de soporte.
- Lectura de barras de progreso con lector de pantalla.
- Verificación visual del foco en mobile y desktop.
- Contraste real de texto secundario, badges y estados deshabilitados.
- Revisión del botón flotante con safe areas de iOS y Android.

## 7. Recomendaciones Para RC1.5

- Agregar una herramienta automatizada de accesibilidad si el proyecto decide
  incorporar pruebas visuales o de navegador.
- Revisar el botón de cierre de sesión duplicado en sidebar para decidir si debe
  conectarse al flujo existente, ocultarse o eliminarse.
- Ejecutar una sesión manual con lector de pantalla sobre el flujo privado
  completo.
- Revisar formularios administrativos con el mismo criterio de foco, errores y
  nombres accesibles.

## 8. Confirmación De Funcionalidad

Esta fase no cambió reglas de negocio, progreso, autenticación, datos,
enrollment, Storage, Stripe ni CMS. Las modificaciones se limitaron a semántica,
atributos accesibles, foco visible y documentación.
