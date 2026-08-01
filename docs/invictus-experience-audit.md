# Auditoría de experiencia Invictus GEX

## Alcance

Auditoría documental realizada sobre la plataforma actual antes de modificar producto. Se revisaron landing, programa público, oferta, login, registro, dashboard, módulos, Session 101 y administración.

No se modificó código de producto, autenticación, Stripe, Workflow, Progress, Enrollments, Supabase remoto ni Hostinger.

## Problemas encontrados

### 1. La mentoría no aparece como culminación clara del proceso

- Rutas afectadas: `/`, `/programa`, `/oferta`, `/academy`, `/academy/sesion-101`, `/admin/students/[profileId]`.
- Componentes implicados: `PublicLanding`, `PublicProgramPage`, `PublicOfferPage`, `StudentDashboard`, `Session101AccessPage`, `AdminStudentDetailPage`.
- Impacto: la propuesta actual comunica formación y proceso, pero no explica suficientemente que la mentoría 1 a 1 es la etapa final y que la plataforma debe prepararla desde el primer módulo.
- Texto a cambiar: secciones de CTA, transformación, oferta y Session 101 deben incorporar preparación de mentoría sin prometer resultados.

### 2. Nombres internos visibles en la experiencia del participante

- Rutas afectadas: `/academy`, `/academy/sesion-101`.
- Componentes implicados: `StudentDashboard`, `Session101AccessPage`, `academy-workflow.ts`.
- Ejemplos: `Session 101`, `Learning Workflow`, `Trading days`.
- Impacto: esos nombres describen arquitectura o reglas internas, pero no siempre transmiten una experiencia institucional de mentoría.
- Recomendación: convertirlos narrativamente en preparación de mentoría, práctica documentada y requisitos académicos, manteniendo los nombres técnicos solo en código.

### 3. Registro y login todavía hablan en clave de acceso, no de recorrido formativo

- Rutas afectadas: `/login`, `/registro`.
- Componentes implicados: `LoginPage`, `RegisterPage`, `AuthPageShell`, `LoginForm`, `RegisterForm`.
- Impacto: la entrada funciona, pero podría reforzar mejor pertenencia, proceso y preparación.
- Texto a cambiar: `Acceso de estudiantes`, `Registro de estudiantes`, `Crea tu cuenta...` pueden evolucionar hacia acceso al programa profesional y preparación del recorrido.

### 4. Dashboard comunica progreso, pero no evidencia para mentoría

- Ruta afectada: `/academy`.
- Componentes implicados: `StudentDashboard`, `TradingDaysPanel`, `StudentProgressSummary`, `StudentProgramsOverview`.
- Impacto: el dashboard muestra progreso, programa, escenarios y días de práctica, pero no guía explícitamente al participante a documentar dudas, ejemplos y reflexiones por módulo.
- Funcionalidad faltante: bloque de preparación de mentoría con estado de reflexiones y adjuntos.

### 5. El módulo permite consumo y completado, pero no reflexión libre

- Ruta afectada: `/academy/programa/[moduleId]`.
- Componentes implicados: `StudentModuleDetailPage`, `ModuleVideosSection`, `ModuleResourcesSection`, `ModuleCompletionPanel`, `ModuleObjectivesSection`.
- Impacto: el módulo presenta videos, recursos, objetivos y completado, pero no captura la evidencia cualitativa que alimentaría la mentoría.
- Funcionalidad faltante: reflexión libre por módulo con adjuntos de imágenes.

### 6. Admin tiene base útil, pero no ficha integral del mentor

- Ruta afectada: `/admin/students/[profileId]`.
- Componentes implicados: `AdminStudentDetailPage`.
- Funcionalidades reutilizables: perfil, enrollments, progreso, formularios, trading days y purchases.
- Faltantes: reflexiones por módulo, adjuntos, dudas pendientes, agenda de mentoría, zona horaria, notas privadas del mentor, estado de dudas, conclusiones y próximos pasos.

### 7. Páginas públicas ya evitan promesas financieras, pero pueden elevar la propuesta

- Rutas afectadas: `/`, `/programa`, `/oferta`.
- Componentes implicados: `PublicLanding`, `PublicProgramPage`, `PublicOfferPage`, `public-program.ts`.
- Aspecto positivo: ya aparecen mensajes contra señales, ganancias garantizadas y promesas de rentabilidad.
- Oportunidad: reemplazar la percepción de producto educativo por programa profesional con preparación de mentoría.

### 8. No se encontraron emojis visibles

- Rutas afectadas: búsqueda global sobre `src` y `docs`, excluyendo `docs/student-learning-workflow.md`.
- Resultado: no se detectaron emojis en los archivos auditados.
- Recomendación: mantener esta regla como criterio de revisión de UI.

## Componentes reutilizables

- `StudentDashboard`: base para centro de avance y preparación.
- `TradingDaysPanel`: puede evolucionar hacia registros de práctica.
- `ModuleCompletionPanel`: puede convivir con reflexión libre sin cambiar el progreso actual.
- `ModuleResourcesSection`: ya estructura materiales complementarios.
- `AdminStudentDetailPage`: base para ficha del mentor.
- `AdminStatusBadge`, `StudentStatusBadge`, `StudentSection`, `StudentCard`: útiles para mantener consistencia visual.
- `academy-workflow.ts`: puede renombrar narrativa visible sin cambiar reglas técnicas.
- `public-program.ts`: fuente útil para narrativa pública.

## Funcionalidades nuevas necesarias

1. Reflexión libre por módulo.
2. Adjuntos de imágenes por reflexión, duda o ejemplo.
3. Preparación de mentoría visible desde el dashboard.
4. Agenda de mentoría con fecha, hora y zona horaria.
5. Ficha administrativa del participante orientada al mentor.
6. Notas privadas del mentor.
7. Estados de dudas.
8. Conclusiones y próximos pasos posteriores a la mentoría.

## Orden recomendado de implementación

1. Actualizar narrativa pública: landing, programa y oferta.
2. Renombrar lenguaje visible interno sin tocar dominios técnicos.
3. Diseñar reflexión libre por módulo.
4. Añadir adjuntos de imágenes.
5. Integrar estado de preparación de mentoría en dashboard.
6. Crear ficha de mentoría en admin usando datos existentes más reflexiones.
7. Añadir agenda de mentoría.
8. Añadir notas privadas, estados de dudas, conclusiones y próximos pasos.
9. QA final de lanzamiento.

## Riesgos

- Prometer mentoría antes de tener agenda y ficha administrativa operativas.
- Cambiar nombres técnicos internos y romper integraciones estables.
- Mezclar progreso académico con calidad de reflexión.
- Convertir la reflexión libre en formulario rígido.
- Sobrecargar la UI privada con textos largos.
- Exponer notas privadas del mentor por error.
- Implementar adjuntos sin política clara de permisos y almacenamiento privado.

## Propuesta de fases pequeñas

### Fase 13.1: Narrativa pública Invictus GEX

Actualizar solo textos visibles de `/`, `/programa` y `/oferta` para presentar programa profesional, preparación de mentoría y ausencia de promesas financieras.

### Fase 13.2: Lenguaje interno de preparación

Actualizar etiquetas visibles de dashboard y Session 101 para reducir términos internos como `Learning Workflow` y `Trading days`.

### Fase 13.3: Diseño funcional de reflexión libre

Definir modelo, rutas, permisos y UI mínima para reflexión libre por módulo, sin adjuntos todavía.

### Fase 13.4: Adjuntos de imágenes

Agregar subida privada de imágenes vinculadas a reflexiones o dudas, reutilizando Storage privado.

### Fase 13.5: Preparación de mentoría

Crear vista del participante con resumen de dudas, ejemplos y estado de preparación.

### Fase 13.6: Ficha del mentor

Extender admin para ver identidad, progreso, reflexiones, adjuntos, práctica, dudas y preparación.

### Fase 13.7: Agenda y seguimiento

Añadir fecha, hora, zona horaria, notas privadas, estado de dudas, conclusiones y próximos pasos.
