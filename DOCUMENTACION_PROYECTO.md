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

La base tecnica de Invictus Trading Academy fue inicializada con Next.js en la carpeta raiz del proyecto. La aplicacion mantiene la pagina inicial basica creada por Next.js. Git fue inicializado localmente en la rama main con identidad local del repositorio configurada. Las comprobaciones npm run lint y npm run build finalizaron correctamente.

## Historial de cambios

### 2026-07-18 - Inicializacion tecnica base

Se inicializo el proyecto invictus-academy directamente en C:\Users\ariel\Desktop\invictus-trading-academy usando create-next-app con TypeScript, ESLint, Tailwind CSS, App Router, carpeta src, alias @/* y npm. No se inicializo Git ni se agregaron servicios o dependencias adicionales fuera de la base generada.

### 2026-07-18 - Inicializacion de Git local

Se inicializo el repositorio Git local en la carpeta raiz del proyecto, se establecio la rama principal main y se configuro la identidad Git local con user.name invictusgex y user.email invictusgex@gmail.com. Se preparo el proyecto para crear el primer punto de restauracion estable sin conectar repositorios remotos.
