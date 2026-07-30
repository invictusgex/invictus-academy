# Local Tooling Setup

FASE 8.5B prepara herramientas locales para ejecutar Supabase sin tocar bases
remotas.

## 1. Estado Inicial

- `supabase` global no existia en PATH.
- `docker` no existia en PATH.
- Docker Desktop no estaba en rutas comunes.
- `supabase/config.toml` ya existia.
- No existia `supabase/.temp/project-ref`.

## 2. Windows Y Arquitectura

- Windows reportado por `ver`: `10.0.26200.8875`.
- Arquitectura exacta y RAM no pudieron consultarse via CIM porque la sesion
  devolvio `Acceso denegado`.
- `systeminfo` tambien devolvio `Acceso denegado`.

## 3. Virtualizacion Y WSL 2

`wsl --status`, `wsl --version` y `wsl -l -v` reportaron que WSL no esta
instalado.

Las features `Microsoft-Windows-Subsystem-Linux`, `VirtualMachinePlatform` y
`Microsoft-Hyper-V-All` no pudieron consultarse con `Get-WindowsOptionalFeature`
porque requieren elevacion.

Accion manual recomendada en PowerShell como Administrador:

```powershell
wsl --install
```

Este comando puede requerir reinicio. Despues del reinicio, verificar:

```powershell
wsl --status
wsl --version
wsl -l -v
```

## 4. Docker Desktop

Docker Desktop no esta instalado o no esta disponible en PATH:

- `where.exe docker`: no encontro ejecutable.
- `where.exe "Docker Desktop"`: no encontro ejecutable.
- `C:\Program Files\Docker\Docker\Docker Desktop.exe`: no existe.
- `C:\Program Files\Docker\Docker\resources\bin\docker.exe`: no existe.

`winget` tampoco esta disponible en PATH, por lo que Codex no pudo buscar ni
instalar Docker Desktop mediante Winget.

Accion manual recomendada despues de instalar WSL 2:

1. Instalar Docker Desktop desde el instalador oficial.
2. Usar Linux containers.
3. Usar backend WSL 2.
4. No activar Kubernetes.
5. Reiniciar Windows si el instalador lo solicita.
6. Verificar:

```powershell
docker --version
docker version
docker info
```

## 5. Supabase CLI Local

Se instalo Supabase CLI como dependencia local del proyecto:

```powershell
npm.cmd install --save-dev supabase
```

Version instalada:

```text
2.110.0
```

Metodo:

- dependencia local versionada en `devDependencies`;
- uso reproducible con `npx.cmd supabase`.

No se uso instalacion global.

## 6. Cambios En package.json

Se agrego:

```json
"supabase": "^2.110.0"
```

Tambien se agregaron scripts locales:

```json
"supabase:version": "supabase --version",
"supabase:status": "supabase status",
"supabase:start": "supabase start",
"supabase:stop": "supabase stop",
"supabase:reset": "supabase db reset"
```

No se ejecuto `supabase:reset`.

## 7. Estado De Supabase CLI

`npx.cmd supabase --version` respondio:

```text
2.110.0
```

`npx.cmd supabase status` respondio que no puede inspeccionar el stack porque
Docker/Podman no existen:

```text
failed to inspect container health: docker: command not found (podman also not found)
```

## 8. Smoke Test

No se ejecuto `npx.cmd supabase start`.

Motivo:

- WSL no esta instalado.
- Docker no esta instalado o no esta en PATH.
- Winget no esta disponible para instalar Docker.

## 9. Seguridad Y Aislamiento

Confirmado:

- no se ejecuto `supabase login`;
- no se ejecuto `supabase link`;
- no se ejecuto `supabase db push`;
- no se ejecuto `supabase migration repair`;
- no se ejecuto `supabase db reset`;
- no se creo `supabase/.temp/project-ref`;
- no se usaron tokens;
- no se modifico ninguna base remota;
- no se mostraron secretos.

## 10. Estado Final Del Stack Local

Supabase local no quedo iniciado. Docker tampoco quedo iniciado por esta fase.

## 10.1 Actualizacion Fase 8.5C

En la verificacion runtime posterior se comprobo:

- `npx.cmd supabase --version`: `2.110.0`.
- PostgreSQL local responde en `127.0.0.1:54322`.
- PostgREST local responde en `127.0.0.1:54321`.
- La base local contiene 16 migraciones aplicadas.
- Ultima migracion aplicada: `20260729000000`.

Limitacion real de la sesion:

- `docker` sigue sin estar disponible en PATH.
- `npx.cmd supabase status` falla porque la CLI no puede inspeccionar Docker.
- `npx.cmd supabase gen types ... --local` y `--db-url` tambien fallan porque
  Supabase CLI requiere Docker/Podman para esa operacion en esta instalacion.

Conclusion operativa:

- El runtime local de base de datos esta accesible por puerto.
- Docker Desktop puede estar ejecutando el stack, pero el ejecutable `docker`
  no esta disponible para esta sesion.
- Para completar operaciones CLI dependientes de Docker hay que restaurar PATH o
  abrir una sesion donde `docker version` funcione.

## 11. Proximo Paso Para Reanudar 8.5A

1. Instalar WSL 2 con PowerShell como Administrador:

```powershell
wsl --install
```

2. Reiniciar si Windows lo solicita.
3. Instalar Docker Desktop manualmente desde el instalador oficial.
4. Confirmar:

```powershell
wsl --status
docker --version
docker version
npx.cmd supabase --version
npx.cmd supabase status
```

5. Solo despues reanudar Fase 8.5A para ejecutar `npx.cmd supabase start` y,
   con aprobacion de fase, `npx.cmd supabase db reset`.
