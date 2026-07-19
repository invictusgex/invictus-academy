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
