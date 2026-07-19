# Documentacion del proyecto

## Identidad

- Nombre visible: Invictus Trading Academy
- Nombre tecnico: invictus-academy
- Ruta local del proyecto: C:\Users\ariel\Desktop\invictus-trading-academy
- Fecha de inicializacion: 2026-07-18

## Tecnologias instaladas

- Next.js
- React
- React DOM
- TypeScript
- ESLint
- Tailwind CSS
- App Router de Next.js
- Estructura con carpeta src
- Alias de importacion @/*
- npm como administrador de paquetes

## Versiones instaladas

- next: 16.2.10
- react: 19.2.4
- react-dom: 19.2.4
- typescript: 5.9.3
- tailwindcss: 4.3.3

## Decisiones tomadas

- Se inicializo la aplicacion directamente en la carpeta raiz del proyecto, sin crear una carpeta anidada adicional.
- Se uso create-next-app con la configuracion estable recomendada actualmente.
- Se habilito TypeScript.
- Se habilito ESLint.
- Se habilito Tailwind CSS.
- Se habilito App Router.
- Se habilito la carpeta src.
- Se configuro el alias de importacion @/*.
- Se uso npm como administrador de paquetes.
- Se desactivo la inicializacion automatica de Git porque Git se realizara en un paso posterior.
- Se conservo la pagina inicial basica generada por Next.js.
- No se agregaron Supabase, autenticacion, base de datos, reproductor de YouTube, shadcn/ui, Framer Motion, Stripe ni dependencias adicionales no necesarias.
- No se publico el proyecto.
- Se inicializo Git localmente en la carpeta raiz del proyecto.
- Se configuro la rama principal como main.
- Se configuro la identidad Git solo a nivel local del repositorio:
  - user.name: invictusgex
  - user.email: invictusgex@gmail.com
- Se conecto el repositorio local con el repositorio remoto privado de GitHub.
- Se configuro el remoto origin con la URL https://github.com/invictusgex/invictus-academy.git.
- Se conecto la rama local main con origin/main.
- No se uso force push.
- No se registraron credenciales, contrasenas, tokens ni secretos en archivos.
- Se reemplazo la pagina inicial generica de Next.js por una portada institucional para Invictus Trading Academy.
- Se definio una base visual sobria, oscura, tecnologica y responsive.
- Se usaron colores principales negro, azul profundo, cyan, blanco y grises secundarios.
- No se instalaron dependencias nuevas para la base visual.
- No se agregaron rutas, autenticacion, base de datos, videos, pagos ni integraciones externas.
- Se refino la composicion de la portada sin redisenarla por completo.
- Se redujo el espacio vertical entre el encabezado y la seccion principal.
- Se unifico el ancho maximo y la alineacion lateral de header, hero, tarjetas y footer.
- Se reemplazo el bloque derecho simple por un panel institucional con grafico abstracto hecho solo con HTML y CSS.
- Se mejoro el comportamiento responsive para escritorio ancho, aproximadamente 1024 px y movil.
- Se inicio la Fase 3 con la estructura interna inicial de la academia.
- Se creo la ruta publica temporal /academy mediante App Router.
- Se separo la base visual de la academia en componentes reutilizables pequenos.
- Se crearon carpetas preparadas para futuras funciones de autenticacion y progreso, sin implementar esas funciones todavia.
- No se instalaron dependencias nuevas para la estructura de academia.
- Se construyo una navegacion principal de aprendizaje con datos provisionales.
- Se corrigio la arquitectura de aprendizaje: cada modulo contiene directamente un video principal.
- Las rutas actuales de contenido educativo son /academy, /academy/programa y /academy/programa/[moduleId].
- No existen clases internas dentro de los modulos.
- Se elimino la ruta /academy/programa/[moduleId]/[lessonId].
- No se implemento reproductor funcional, progreso real, guardado de estado, autenticacion, Supabase ni base de datos.
- Se mantuvo shadcn/ui pospuesto y no se instalaron dependencias nuevas.
- Se valido que moduleId use los valores provisionales existentes mediante notFound() para parametros invalidos.
- Se inicio la arquitectura academica para soportar multiples cursos en el futuro.
- Se introdujo el concepto Course con la jerarquia Academy -> Course -> Module -> Resource.
- El proyecto mantiene un unico curso provisional con siete modulos.
- Cada modulo contiene video provisional estructural y resources como lista vacia.
- Se incorporaron los campos overview y learningObjectives al modelo Module.
- Se mejoro la experiencia del estudiante mostrando que aprendera en cada modulo desde el programa y desde la vista del modulo.
- Se redefinio el dashboard como centro de control del estudiante.
- Se elimino del dashboard la duplicacion del programa y sus tarjetas de modulos.
- Se incorporo una tarjeta institucional del curso con acceso al programa completo.
- Se incorporo un sistema global de soporte dentro del shell compartido de academia.
- Se uso NEXT_PUBLIC_SUPPORT_EMAIL como configuracion publica para el canal de soporte.
- Se agrego .env.example para documentar la configuracion publica esperada.
- Se creo .env.local solo en el entorno local para probar el canal de soporte y se confirmo que permanece ignorado por Git.

## Comandos ejecutados

```powershell
Get-ChildItem -Force
```

```powershell
npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
```

Resultado: bloqueado por la politica de ejecucion de scripts de PowerShell para npx.ps1. No se crearon archivos con este intento.

```powershell
npx.cmd create-next-app@latest . --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
```

Resultado: inicializacion completada correctamente.

```powershell
npm.cmd list next react react-dom typescript tailwindcss --depth=0
```

Resultado: versiones instaladas verificadas correctamente.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente.

```powershell
npm.cmd run build
```

Resultado inicial: fallo por falta de acceso de red al descargar las fuentes Geist y Geist Mono desde Google Fonts durante la compilacion.

```powershell
npm.cmd run build
```

Resultado final: build de produccion finalizado correctamente con acceso de red permitido para la descarga de fuentes.

```powershell
git init -b main
```

Resultado: repositorio Git local inicializado correctamente en la carpeta raiz del proyecto.

```powershell
git config user.name "invictusgex"
```

Resultado: user.name configurado a nivel local del repositorio.

```powershell
git config user.email "invictusgex@gmail.com"
```

Resultado: user.email configurado a nivel local del repositorio.

```powershell
git rev-parse --is-inside-work-tree
```

Resultado: Git reconoce correctamente el repositorio.

```powershell
git branch --show-current
```

Resultado: main.

```powershell
git status --short
```

Resultado: archivos del proyecto pendientes de preparar para el primer commit.

```powershell
git remote -v
```

Resultado inicial: no habia remotos configurados.

```powershell
git remote add origin https://github.com/invictusgex/invictus-academy.git
```

Resultado: remoto origin configurado correctamente con la URL autorizada.

```powershell
git push -u origin main
```

Resultado: la rama main fue subida correctamente al repositorio privado y quedo configurada para seguir origin/main.

```powershell
git remote -v
```

Resultado: origin apunta a https://github.com/invictusgex/invictus-academy.git para fetch y push.

```powershell
git branch -vv
```

Resultado: main sigue origin/main.

```powershell
git log --oneline --decorate -5
```

Resultado: el commit inicial 41c031c aparece en main y origin/main.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de crear la base visual institucional.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de crear la base visual institucional.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues del refinamiento visual de composicion.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues del refinamiento visual de composicion.

```powershell
New-Item -ItemType Directory -Force src\components\layout, src\components\ui, src\features\academy, src\features\auth, src\features\progress, src\lib, src\types, src\utils, src\app\academy
```

Resultado: arquitectura minima de carpetas creada para la Fase 3.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de crear la estructura inicial de la academia.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de crear la estructura inicial de la academia. La ruta /academy fue generada como contenido estatico.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de crear la navegacion completa de aprendizaje.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de crear la navegacion completa de aprendizaje. Las rutas /academy/programa, /academy/programa/[moduleId] y /academy/programa/[moduleId]/[lessonId] compilaron correctamente.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de mejorar la navegacion de clases.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de mejorar la navegacion de clases. Las rutas validas de academia siguen generandose correctamente.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de corregir la arquitectura a un video por modulo.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de corregir la arquitectura a un video por modulo. El build incluye /academy, /academy/programa y /academy/programa/[moduleId], y ya no genera /academy/programa/[moduleId]/[lessonId].

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de introducir la arquitectura de cursos.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de introducir la arquitectura de cursos. Las rutas de academia se mantienen sin cambios visibles significativos.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de mostrar objetivos de aprendizaje por modulo.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de mostrar objetivos de aprendizaje por modulo.

```powershell
npm.cmd run lint
```

Resultado: ESLint finalizo correctamente despues de redefinir el dashboard como centro de control.

```powershell
npm.cmd run build
```

Resultado: build de produccion finalizado correctamente despues de redefinir el dashboard como centro de control.

```powershell
npm.cmd run lint
```

Resultado final: ESLint finalizo correctamente despues de crear el sistema global de soporte.

```powershell
npm.cmd run build
```

Resultado inicial: fallo por un conflicto de tipos entre KeyboardEvent de React y el evento nativo del documento en AcademySupport.
Resultado final: build de produccion finalizado correctamente despues de corregir el tipo del evento de teclado.

## Archivos importantes creados

- package.json
- package-lock.json
- next.config.ts
- tsconfig.json
- eslint.config.mjs
- postcss.config.mjs
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- public/next.svg
- public/vercel.svg
- README.md
- DOCUMENTACION_PROYECTO.md

## Estado actual del proyecto

La base tecnica de Invictus Trading Academy fue inicializada con Next.js en la carpeta raiz del proyecto. La aplicacion cuenta con una primera portada institucional sobria, oscura, tecnologica y adaptable a movil y escritorio. Git fue inicializado localmente en la rama main con identidad local del repositorio configurada. El repositorio local quedo conectado al repositorio remoto privado de GitHub https://github.com/invictusgex/invictus-academy.git mediante origin, y main quedo conectada con origin/main. Las comprobaciones npm run lint y npm run build finalizaron correctamente.

## Base visual institucional

- Archivos modificados:
  - src/app/page.tsx
  - src/app/globals.css
  - src/app/layout.tsx
  - DOCUMENTACION_PROYECTO.md
- Decisiones de diseno:
  - Portada de una sola pagina con estructura semantica header, main, section y footer.
  - Estilo institucional y tecnologico, con fondo oscuro y contraste alto.
  - Navegacion visual simple con Inicio, Programa y Acceder.
  - Botones visuales sin funcionalidad real todavia.
  - Tres tarjetas de enfoque: Datos, no opiniones; Lectura de liquidez; Gestion del riesgo.
  - Mensaje discreto de estado: Plataforma educativa en desarrollo.
  - Sin testimonios, precios, estadisticas falsas, logos de terceros ni imagenes externas.
- Colores principales utilizados:
  - Fondo principal: #05070c
  - Fondo secundario: #080f1a
  - Texto principal: #f8fbff
  - Texto secundario: #a7b0bf
  - Borde: #1c2b3e
  - Azul: #1d4ed8
  - Cyan: #22d3ee
  - Hover: #0f2238 y #67e8f9
- Dependencias:
  - No se instalaron dependencias nuevas.

## Refinamiento visual de portada

- Archivos modificados:
  - src/app/page.tsx
  - src/app/globals.css
  - DOCUMENTACION_PROYECTO.md
- Problemas visuales corregidos:
  - Exceso de espacio vertical entre header y seccion principal.
  - Alineacion lateral poco uniforme entre header, hero, tarjetas y footer.
  - Bloque derecho demasiado simple para la direccion institucional aprobada.
  - Separacion visual mejorable entre la seccion principal y las tarjetas.
  - Necesidad de mejor adaptacion del menu, titulo, botones, panel y tarjetas en movil.
- Decision de grafico abstracto:
  - Se creo un panel decorativo con niveles horizontales, cuadricula sutil, puntos y linea abstracta usando solamente HTML y CSS.
  - No se usaron datos reales, precios, resultados, canvas, imagenes externas ni SVG complejo.
  - El movimiento es minimo y respeta prefers-reduced-motion.
- Dependencias:
  - No se instalaron dependencias nuevas.

## Fase 3 - Estructura inicial de academia

- Ruta creada:
  - /academy
- Carpetas creadas:
  - src/components/layout
  - src/components/ui
  - src/features/academy
  - src/features/auth
  - src/features/progress
  - src/lib
  - src/types
  - src/utils
  - src/app/academy
- Componentes creados:
  - AcademySidebar
  - AcademyHeader
  - ProgressBar
  - ModuleCard
- Archivos creados:
  - src/app/academy/page.tsx
  - src/components/layout/academy-sidebar.tsx
  - src/components/layout/academy-header.tsx
  - src/components/ui/progress-bar.tsx
  - src/features/academy/module-card.tsx
  - src/features/auth/README.md
  - src/features/progress/README.md
  - src/lib/academy-content.ts
  - src/types/academy.ts
  - src/utils/class-names.ts
- Archivos modificados:
  - src/app/page.tsx
  - DOCUMENTACION_PROYECTO.md
- Decisiones:
  - La ruta /academy queda publica temporalmente.
  - No se implemento autenticacion, login ni proteccion de acceso.
  - Las carpetas src/features/auth y src/features/progress conservan README de alcance para dejar claro que aun no tienen implementacion funcional.
  - No se conecto Supabase ni se creo base de datos.
  - No se crearon rutas de modulos ni lecciones.
  - Los siete modulos se mantienen como tarjetas provisionales sin nombres especificos.
  - El progreso general se mantiene en 0 %.
  - No se instalaron dependencias nuevas.
- Comportamiento responsive:
  - En escritorio, la academia usa una barra lateral izquierda y contenido principal a la derecha.
  - En movil, la navegacion se apila de forma simple y las tarjetas se muestran en una sola columna, sin menu hamburguesa funcional.

## Fase 3 - Navegacion completa de aprendizaje

Nota de arquitectura: esta seccion documenta una implementacion historica que fue corregida posteriormente. La estructura vigente ya no contiene clases internas ni ruta /academy/programa/[moduleId]/[lessonId].

- Rutas creadas:
  - /academy/programa
  - /academy/programa/[moduleId]
  - /academy/programa/[moduleId]/[lessonId]
- Archivos creados:
  - src/app/academy/programa/page.tsx
  - src/app/academy/programa/[moduleId]/page.tsx
  - src/app/academy/programa/[moduleId]/[lessonId]/page.tsx
  - src/components/layout/academy-shell.tsx
  - src/features/academy/lesson-card.tsx
- Archivos modificados:
  - src/app/academy/page.tsx
  - src/features/academy/module-card.tsx
  - src/lib/academy-content.ts
  - src/types/academy.ts
  - DOCUMENTACION_PROYECTO.md
- Navegacion:
  - Mi programa apunta a /academy/programa.
  - Los botones Entrar llevan desde cada modulo provisional hacia su ruta de modulo.
  - Los botones Abrir clase llevan desde cada clase provisional hacia su ruta de clase.
  - Clase anterior y Clase siguiente respetan los limites de Clase 1 a Clase 10.
- Datos provisionales:
  - Siete modulos: Modulo 1 a Modulo 7.
  - Diez clases por modulo: Clase 1 a Clase 10.
  - Estado de modulo: No iniciado.
  - Texto de modulo: Contenido pendiente de definicion.
  - Progreso real no implementado.
- Restricciones mantenidas:
  - No se instalo ninguna dependencia.
  - No se agrego autenticacion, login, Supabase, base de datos, YouTube, reproductor funcional, guardado de estado, videos ni pagos.
  - No se modifico la landing publica.
  - No se cambiaron colores, configuracion Git ni repositorio remoto.

## Fase 3 - Mejora de navegacion de clases

Nota de arquitectura: esta seccion documenta una mejora historica sobre una estructura de clases que fue corregida posteriormente por decision del propietario. La estructura vigente usa un video principal por modulo.

- Alcance principal:
  - src/app/academy/programa/[moduleId]/[lessonId]/page.tsx
- Archivos creados:
  - src/features/academy/lesson-navigation.tsx
- Archivos modificados:
  - src/app/academy/programa/[moduleId]/[lessonId]/page.tsx
  - DOCUMENTACION_PROYECTO.md
- Migas de pan:
  - Programa enlaza a /academy/programa.
  - Modulo X enlaza al modulo actual.
  - Clase Y representa la clase actual y usa aria-current.
- Indice lateral de clases:
  - LessonNavigation muestra Clase 1 a Clase 10 usando academy-content.ts.
  - La clase actual se distingue con borde/fondo cyan discreto, texto Actual y aria-current="page".
  - Incluye enlace Volver al modulo.
- Navegacion anterior y siguiente:
  - Los enlaces muestran el destino: Clase anterior: Clase X y Clase siguiente: Clase Y.
  - Clase 1 no muestra control anterior.
  - Clase 10 no muestra control siguiente.
  - No se permite navegar fuera del rango provisional de Clase 1 a Clase 10.
- Validacion de parametros:
  - moduleId se valida contra los modulos provisionales 1 a 7.
  - lessonId se valida contra las clases provisionales 1 a 10.
  - Valores invalidos usan notFound().
- Responsive:
  - En escritorio, el area reservada para video queda a la izquierda y el indice de clases a la derecha.
  - En pantallas medianas y moviles, todo queda en una sola columna, con indice debajo y sin scroll horizontal previsto.
- Decisiones:
  - shadcn/ui queda pospuesto.
  - No se instalaron dependencias nuevas.
  - No se agregaron videos, reproductor, autenticacion, Supabase, base de datos, progreso real, recursos descargables ni notas.

## Correccion de arquitectura de aprendizaje

- Estructura vigente:
  - Existen exactamente siete modulos.
  - Cada modulo contiene inicialmente un solo video principal.
  - No existen clases internas dentro de los modulos.
- Rutas actuales de contenido educativo:
  - /academy
  - /academy/programa
  - /academy/programa/[moduleId]
- Ruta eliminada:
  - /academy/programa/[moduleId]/[lessonId]
- Archivos eliminados:
  - src/app/academy/programa/[moduleId]/[lessonId]/page.tsx
  - src/features/academy/lesson-card.tsx
  - src/features/academy/lesson-navigation.tsx
- Archivos modificados:
  - src/app/academy/page.tsx
  - src/app/academy/programa/page.tsx
  - src/app/academy/programa/[moduleId]/page.tsx
  - src/features/academy/module-card.tsx
  - src/lib/academy-content.ts
  - src/types/academy.ts
  - DOCUMENTACION_PROYECTO.md
- Datos eliminados:
  - AcademyLesson
  - academyLessons
  - getAcademyLesson
  - lessonId
  - Clase 1 a Clase 10
  - navegacion anterior/siguiente entre clases
- Vista de modulo:
  - Muestra migas de pan Programa > Modulo X.
  - Muestra etiqueta y titulo provisional Modulo X.
  - Muestra estado No iniciado.
  - Muestra un area reservada para el video del modulo.
  - Incluye Volver al programa.
  - Permite navegar entre modulos sin salir del rango 1 a 7.
- Validacion:
  - moduleId solo acepta valores provisionales del 1 al 7.
  - Valores invalidos usan notFound().
- Responsive:
  - El area audiovisual usa proporcion visual amplia en escritorio.
  - En movil se mantiene una sola columna y botones adaptables sin scroll horizontal previsto.
- Dependencias:
  - No se instalaron dependencias nuevas.
  - shadcn/ui sigue pospuesto.

## Fase 4 - Arquitectura academica de cursos

- Objetivo:
  - Preparar el modelo academico interno para soportar multiples cursos en el futuro sin cambiar de forma significativa el diseno visible.
- Jerarquia logica:
  - Academy
  - Course
  - Module
  - Resource
- Estado actual:
  - Existe un unico Course provisional.
  - El curso contiene exactamente siete modulos.
  - Cada modulo contiene un video provisional estructural.
  - Cada modulo contiene resources: [].
- Tipos creados:
  - Course
  - Module
  - ModuleVideo
  - ModuleResource
- Video provisional:
  - Contiene solamente id, title y placeholder.
  - No contiene URL real.
  - No contiene YouTube.
- Resources:
  - Cada modulo mantiene una lista vacia.
  - No se agregaron recursos ficticios.
- Archivos modificados:
  - src/types/academy.ts
  - src/lib/academy-content.ts
  - src/app/academy/page.tsx
  - src/app/academy/programa/page.tsx
  - src/app/academy/programa/[moduleId]/page.tsx
  - src/features/academy/module-card.tsx
  - DOCUMENTACION_PROYECTO.md
- Decisiones:
  - Las paginas del dashboard, programa y modulo leen primero el curso provisional y luego sus modulos.
  - Se evita duplicacion de datos manteniendo la informacion academica en academy-content.ts.
  - No se agregaron tipos de usuarios ni base de datos.
  - No se instalo ninguna dependencia.

## Historial de cambios

### 2026-07-18 - Inicializacion tecnica base

Se inicializo el proyecto invictus-academy directamente en C:\Users\ariel\Desktop\invictus-trading-academy usando create-next-app con TypeScript, ESLint, Tailwind CSS, App Router, carpeta src, alias @/* y npm. No se inicializo Git ni se agregaron servicios o dependencias adicionales fuera de la base generada.

### 2026-07-18 - Inicializacion de Git local

Se inicializo el repositorio Git local en la carpeta raiz del proyecto, se establecio la rama principal main y se configuro la identidad Git local con user.name invictusgex y user.email invictusgex@gmail.com. Se preparo el proyecto para crear el primer punto de restauracion estable sin conectar repositorios remotos.

### 2026-07-18 - Conexion privada con GitHub

Se configuro el remoto origin con el repositorio privado https://github.com/invictusgex/invictus-academy.git y se subio la rama main mediante git push -u origin main. La rama local main quedo conectada con origin/main. No se uso force push y no se registraron credenciales en archivos.

### 2026-07-18 - Base visual institucional

Se reemplazo la pagina generica de Next.js por una portada profesional, sobria y responsive para Invictus Trading Academy. Se actualizaron los metadatos del proyecto, se definieron variables CSS reutilizables para la identidad visual y se documento que no se instalaron dependencias ni se agregaron funciones externas.

### 2026-07-18 - Refinamiento de composicion de portada

Se ajustaron espaciado, alineacion lateral, equilibrio de columnas y relacion visual entre la seccion principal y las tarjetas. Se incorporo un panel institucional con grafico abstracto construido solo con HTML y CSS, sin dependencias nuevas ni funcionalidad adicional.

### 2026-07-19 - Estructura inicial de academia

Se inicio la Fase 3 creando la arquitectura interna inicial y la ruta publica temporal /academy. Se agrego un dashboard estructural con barra lateral, encabezado superior, tarjeta de bienvenida, progreso general en 0 % y siete tarjetas provisionales de modulos sin nombres especificos. No se agregaron autenticacion, Supabase, base de datos, rutas de modulos, rutas de lecciones ni dependencias nuevas.

### 2026-07-19 - Navegacion completa de aprendizaje

Se crearon las rutas /academy/programa, /academy/programa/[moduleId] y /academy/programa/[moduleId]/[lessonId] con datos provisionales. El programa muestra siete modulos, cada modulo lista diez clases y cada clase muestra un area reservada para futuro reproductor con navegacion anterior/siguiente dentro de sus limites. No se agregaron autenticacion, Supabase, base de datos, reproductor funcional, progreso real ni dependencias nuevas.

### 2026-07-19 - Mejora de navegacion de clases

Se mejoro la vista de clase con migas de pan, encabezado basado en el nombre provisional de la clase, distribucion en dos columnas para escritorio, indice lateral de clases del modulo y navegacion anterior/siguiente con destino explicito. Los parametros moduleId y lessonId se mantienen validados contra los datos provisionales y shadcn/ui queda pospuesto sin instalar dependencias nuevas.

### 2026-07-19 - Correccion a un video por modulo

Se corrigio la arquitectura de aprendizaje para reflejar la decision del propietario: existen siete modulos y cada modulo contiene directamente un video principal, sin clases internas. Se elimino la ruta /academy/programa/[moduleId]/[lessonId], se retiraron los componentes y datos de clases, y se adapto /academy/programa/[moduleId] como pantalla audiovisual directa del modulo.

### 2026-07-19 - Arquitectura academica de cursos

Se introdujo el concepto Course para preparar soporte futuro de multiples cursos bajo la jerarquia Academy -> Course -> Module -> Resource. Actualmente existe un unico curso provisional con siete modulos; cada modulo contiene datos estructurales de video provisional y una lista resources vacia. No se agregaron dependencias, autenticacion, Supabase, base de datos, URLs reales ni recursos ficticios.

## Fase 4 - Objetivos de aprendizaje por modulo

- Campos incorporados al modelo Module:
  - overview
  - learningObjectives
- Datos provisionales:
  - Cada modulo incluye un overview neutro.
  - Cada modulo incluye exactamente cuatro objetivos de aprendizaje provisionales.
  - Los siete modulos comparten temporalmente la misma estructura neutral.
- Visualizacion en /academy/programa:
  - Cada tarjeta muestra nombre del modulo, estado, overview y cuatro objetivos bajo el texto Aprenderas.
  - No se muestra duracion, progreso individual ni cantidad de recursos.
- Visualizacion en /academy/programa/[moduleId]:
  - Se agrego la seccion Que aprenderas en este modulo.
  - Se muestra el overview del modulo.
  - Se muestran los cuatro objetivos bajo Al finalizar este modulo podras.
- Arquitectura:
  - Toda la informacion proviene de academy-content.ts mediante el modelo Course.
  - No se duplicaron arrays de objetivos en componentes.
  - Los objetivos forman parte del modulo, no de resources.
- Archivos modificados:
  - src/types/academy.ts
  - src/lib/academy-content.ts
  - src/features/academy/module-card.tsx
  - src/app/academy/programa/page.tsx
  - src/app/academy/programa/[moduleId]/page.tsx
  - DOCUMENTACION_PROYECTO.md
- Restricciones mantenidas:
  - No se instalaron dependencias.
  - No se agregaron recursos reales, videos reales, YouTube, Supabase, autenticacion ni base de datos.

### 2026-07-19 - Objetivos de aprendizaje por modulo

Se agregaron overview y learningObjectives al modelo Module para explicar de forma provisional que aprendera el estudiante en cada modulo. La pagina del programa muestra estos objetivos en cada tarjeta y la vista del modulo incluye una seccion especifica de aprendizaje, todo alimentado desde academy-content.ts sin duplicar datos ni agregar recursos reales.

## Fase 4 - Dashboard como centro de control

- Cambio de UX:
  - El dashboard deja de duplicar el programa.
  - La pagina Mi programa queda como unico lugar donde se muestra el contenido completo del curso.
  - El dashboard se enfoca en bienvenida, progreso general y acceso institucional al curso.
- Secciones eliminadas del dashboard:
  - Mi programa.
  - Tarjetas de los siete modulos.
  - Duplicacion del listado completo del programa.
- Nueva tarjeta institucional:
  - Titulo: Trading basado en datos.
  - Descripcion: Curso principal de Invictus Trading Academy.
  - Informacion: 7 modulos.
  - Estado: No iniciado.
  - Boton: Ver programa completo.
- Arquitectura:
  - La cantidad de modulos se lee desde el Course provisional en academy-content.ts.
  - No se duplico informacion del programa.
  - Continuar aprendiendo sigue apuntando a /academy/programa y queda preparado para futura logica de siguiente modulo.
- Archivos modificados:
  - src/app/academy/page.tsx
  - DOCUMENTACION_PROYECTO.md
- Restricciones mantenidas:
  - No se modifico la landing.
  - No se modifico la pagina del programa.
  - No se modifico la pagina del modulo.
  - No se instalaron dependencias.
  - No se agregaron autenticacion, Supabase, base de datos, reproduccion de video ni recursos reales.

### 2026-07-19 - Dashboard como centro de control

Se redefinio /academy como centro de control del estudiante, eliminando la seccion Mi programa y las tarjetas de modulos para evitar duplicar el contenido del curso. Se agrego una tarjeta institucional de curso con acceso a /academy/programa, manteniendo el progreso general en 0 % y sin implementar logica adicional.

## Fase 4 - Sistema global de soporte de academia

- Objetivo:
  - Incorporar un punto de soporte reutilizable y global dentro del area privada provisional de academia.
- Integracion:
  - AcademySupport se integra una sola vez en AcademyShell.
  - Las paginas /academy, /academy/programa y /academy/programa/[moduleId] heredan el soporte desde el shell compartido.
  - No se agregaron botones de soporte duplicados dentro de paginas individuales.
- Configuracion:
  - Se creo .env.example con NEXT_PUBLIC_SUPPORT_EMAIL=invictusgex@gmail.com.
  - Se creo .env.local solo como configuracion local ignorada por Git.
  - No se registraron contrasenas, tokens ni secretos.
- Accesibilidad:
  - El disparador usa button semantico con aria-label, aria-haspopup, aria-expanded y aria-controls.
  - El panel usa role dialog y aria-labelledby.
  - Escape cierra el panel.
  - Al abrir, el foco pasa a la accion principal o al boton de cierre.
  - Al cerrar, el foco vuelve al disparador flotante.
- Comportamiento responsive:
  - El disparador queda fijo en la esquina inferior derecha.
  - En movil respeta env(safe-area-inset-bottom).
  - El contenido principal de academia incluye espacio inferior para evitar superposiciones.
- Decisiones:
  - No se instalo una libreria de iconos; package.json no contiene una dependencia de iconos existente.
  - Se uso un SVG inline pequeno y decorativo para el icono de soporte.
  - Se uso un dialogo personalizado accesible para controlar foco, Escape y posicion responsive sin depender de librerias externas.
  - No se agrego chat en vivo, tickets, analytics, autenticacion, Supabase, base de datos ni rutas nuevas.
- Archivos creados:
  - src/components/support/AcademySupport.tsx
  - .env.example
- Archivos modificados:
  - src/components/layout/academy-shell.tsx
  - .gitignore
  - DOCUMENTACION_PROYECTO.md
- Dependencias:
  - No se instalaron dependencias nuevas.

### 2026-07-19 - Sistema global de soporte de academia

Se creo un componente global AcademySupport para mostrar un acceso flotante de soporte en todas las paginas que usan AcademyShell. El canal de contacto se configura mediante NEXT_PUBLIC_SUPPORT_EMAIL, documentado en .env.example, y el panel mantiene comportamiento accesible con foco controlado, cierre con Escape y restauracion del foco al disparador.
