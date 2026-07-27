# Responsive Audit RC1

## Alcance

Auditoría responsive del área privada del alumno:

- Dashboard
- Programa
- Detalle de módulo
- Videos
- Recursos
- Objetivos
- Componentes compartidos
- Layout privado

No se modificaron lógica, base de datos, autenticación, Stripe, Storage, CMS ni
sistema de progreso.

## Viewports Revisados

Se revisaron los breakpoints y patrones de layout para:

- desktop grande
- laptop
- tablet horizontal
- tablet vertical
- móvil horizontal
- móvil vertical

## Problemas Encontrados

- El layout privado no tenía una protección explícita contra overflow horizontal
  accidental en el contenedor raíz.
- La navegación lateral, cuando se muestra arriba en pantallas pequeñas, pasaba
  de una columna a cuatro columnas demasiado pronto y podía quedar apretada con
  etiquetas largas.
- Las tarjetas destacadas con miniatura lateral cambiaban a layout de columnas
  en `lg`, que puede ser estrecho en laptop cuando el sidebar ya ocupa ancho.
- Los badges de estado usaban `w-fit` sin límite máximo, lo que podía producir
  desbordes con textos largos en tarjetas angostas.
- Algunas tarjetas de módulo/escenario tenían CTAs sin ancho completo en móvil,
  generando alineaciones menos estables.
- La navegación entre módulos no protegía todos los títulos largos con
  `min-w-0` y `break-words`.
- El placeholder de video usaba padding alto en móvil vertical.

## Mejoras Aplicadas

- Se agregó `overflow-x-hidden` al shell privado para evitar scroll horizontal
  accidental.
- Se ajustó la navegación superior móvil a `min-[420px]`, `md` y `lg` para que
  distribuya mejor enlaces largos antes de convertirse en sidebar.
- Se movieron layouts de imagen lateral de `lg` a `xl` en tarjetas destacadas y
  hero de módulo, conservando layout vertical en laptop/tablet cuando el ancho
  es más limitado.
- Se alineó el skeleton del detalle de módulo con el nuevo breakpoint `xl`.
- Se reforzaron badges, estadísticas y navegación con `max-w-full`, `min-w-0`,
  `break-words` y alineación centrada donde aplica.
- Se hizo que CTAs de tarjetas de módulo y escenario ocupen ancho completo en
  móvil y vuelvan a ancho de contenido desde `sm`.
- Se redujo el padding del placeholder de video en móvil y se conserva el
  padding amplio desde `sm`.

## Casos Pendientes

- No existe tooling visual responsive configurado en el proyecto, como
  Playwright o Cypress, por lo que no se agregaron capturas automatizadas.
- El copy público de marketing no fue parte de esta fase.
- Los formularios administrativos existentes no fueron rediseñados; solo se
  revisó que esta fase no los modificara.
- El soporte flotante no se rediseñó, aunque debe revisarse con capturas reales
  en RC1.4 por su posición fija en móvil.

## Recomendaciones Para RC1.4

- Añadir una comprobación visual con capturas en viewports representativos:
  1440, 1280, 1024, 768, 667 horizontal y 390 vertical.
- Revisar la experiencia autenticada real con datos de módulos, recursos y
  escenarios largos.
- Definir una utilidad compartida para CTAs privados y reducir variaciones entre
  botones.
- Auditar el soporte flotante con safe areas de iOS y Android.
