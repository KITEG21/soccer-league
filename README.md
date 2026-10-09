<p align="center">
  <img src="Web/public/favicon.svg" width="76" alt="Escudo de SoccerLeague">
</p>

<h1 align="center">SoccerLeague</h1>

<p align="center">
  Gestión de ligas de fútbol, desde la plantilla hasta el último resultado.
  <br>
  Equipos, temporadas, partidos, estadísticas y reportes en un mismo lugar.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-0F172A?style=flat-square" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-0F172A?style=flat-square" alt="React 19">
  <img src="https://img.shields.io/badge/Go-1.21+-059669?style=flat-square" alt="Go 1.21 o superior">
  <img src="https://img.shields.io/badge/PostgreSQL-059669?style=flat-square" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docs-VitePress-047857?style=flat-square" alt="Documentación VitePress">
</p>

<p align="center">
  <a href="#empezar-en-local">Empezar</a> ·
  <a href="#documentación">Documentación</a> ·
  <a href="#arquitectura">Arquitectura</a> ·
  <a href="#equipo">Equipo</a>
</p>

## El proyecto

SoccerLeague centraliza la información de una liga de fútbol y facilita su administración y consulta. La aplicación combina una interfaz en español e inglés, temas claro y oscuro y acceso por roles con una API Go y persistencia en PostgreSQL.

El sistema parte de las necesidades de la Liga Nacional de Fútbol descritas en el [enunciado original](docs/Project%20Specifications.md). La documentación distingue esos requisitos del [comportamiento implementado](docs/negocio/requisitos.md).

## Funcionalidades

| Área | Capacidades |
| --- | --- |
| Equipos y plantillas | Equipos, jugadores y entrenadores; dorsales, posiciones y experiencia |
| Temporadas y estadios | Intervalos de competición y sedes con capacidad |
| Partidos | Programación, estado pendiente/disputado y asistencia |
| Estadísticas | Rendimiento individual por encuentro y marcador calculado desde los goles |
| Reportes | Clasificación, enfrentamientos, agenda, entrenadores, audiencia, estado de equipo y estrellas |
| Exportación | PDF de los siete reportes, en español o inglés |
| Acceso | Usuarios, permisos y sesiones con renovación de tokens |
| Interfaz | Filtros, búsqueda, paginación, idiomas y temas claro/oscuro |

### Roles

| Rol | Acceso |
| --- | --- |
| `superadmin` | Administración de la liga, reportes y gestión de cuentas |
| `admin` | Administración de la liga y consulta de reportes |
| `visitante` | Consulta de datos y reportes; requiere iniciar sesión |

Las [reglas de negocio](docs/negocio/reglas.md) y los [límites actuales](docs/referencia/estado.md) detallan cómo se validan e interpretan los datos.

## Arquitectura

```text
Navegador → Next.js → API Go → PostgreSQL
              │
              └─ Sesión en cookies HttpOnly y proxy /api/backend

Markdown → VitePress → Sitio de documentación independiente
```

| Componente | Tecnologías | Responsabilidad |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS | Pantallas, formularios y navegación |
| Estado y validación | TanStack Query, nuqs, React Hook Form, Zod | Consultas, filtros y captura de datos |
| Servidor web | Next.js Server Actions y Route Handlers | Sesión, renovación y proxy de API |
| Backend | Go, Chi, JWT, bcrypt | Autorización, negocio y contratos HTTP |
| Persistencia | PostgreSQL, pgx, sqlc, golang-migrate | Consultas tipadas, relaciones y migraciones |
| PDF | go-pdf/fpdf | Generación de informes |
| Documentación | VitePress y Vue | Sitio estático con navegación y búsqueda local |

La API protege los recursos mediante permisos y consulta el rol actual del usuario. El frontend oculta las acciones no disponibles y controla el acceso a páginas. Consulte las capas de [frontend](docs/arquitectura/frontend.md), [backend](docs/arquitectura/backend.md) y [seguridad](docs/arquitectura/seguridad.md).

## Empezar en local

### Requisitos

- Node.js 22 o superior y pnpm; Web declara pnpm 10.28.0.
- Go 1.21 o superior.
- PostgreSQL accesible desde la API.
- Git para clonar el repositorio.

Los siguientes pasos usan PowerShell. Ejecuta la API, la web y la documentación en terminales independientes.

### 1. Clonar y preparar el entorno

```sh
git clone https://github.com/Br4voCode/soccer-league.git
cd soccer-league
```

Copia las plantillas desde la raíz:

```powershell
Copy-Item .env.example .env
Copy-Item Web/.env.example Web/.env
```

Crea una base de datos PostgreSQL, por ejemplo `football`, y ajusta la conexión en el `.env` de la raíz:

```dotenv
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/football?sslmode=disable
PORT=8080
JWT_SECRET=YOUR_RANDOM_SECRET
```

Genera una clave para sustituir `YOUR_RANDOM_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

En `Web/.env`, configura:

```dotenv
API_TARGET=local
API_URL_LOCAL=http://localhost:8080
JWT_SECRET=YOUR_RANDOM_SECRET
```

**La clave JWT debe ser exactamente la misma en Web y en Go.** `DATABASE_URL` tiene prioridad sobre las variables individuales `DB_*`. Consulta la [configuración completa](docs/operacion/configuracion.md) para conocer valores predeterminados y carga del entorno.

### 2. Iniciar la API

```sh
cd Api
go mod download
go run ./cmd/api
```

Al arrancar, Go comprueba la conexión y aplica las migraciones pendientes. La referencia interactiva de la API está en **[localhost:8080/docs](http://localhost:8080/docs)**.

### 3. Preparar la primera cuenta

Las migraciones no insertan usuarios automáticamente. La primera cuenta necesita rol `superadmin` y una contraseña almacenada como hash bcrypt; el procedimiento se describe en [primer acceso](docs/operacion/configuracion.md#base-nueva-y-primera-cuenta).

Para desarrollo con PostgreSQL en un contenedor Docker local y la API ya iniciada, el script [seed-db.ps1](scripts/seed-db.ps1) prepara un superadministrador y datos de ejemplo:

```powershell
# Desde la raíz; sustituye contenedor y credenciales por los de tu entorno.
.\scripts\seed-db.ps1 -DbContainer "soccer-league-postgres" -Email "admin@example.com" -Password "YOUR_DEVELOPMENT_PASSWORD"
```

El script necesita Docker, `psql` dentro del contenedor y permisos para habilitar `pgcrypto`. Utiliza datos y fechas de demostración; consulta sus parámetros antes de ejecutarlo. Si PostgreSQL no está en un contenedor, utiliza el aprovisionamiento administrativo documentado.

### 4. Iniciar la aplicación web

En otra terminal, desde la raíz:

```sh
pnpm --dir Web install
pnpm --dir Web dev
```

Abre **[localhost:3000](http://localhost:3000)** e inicia sesión con la cuenta preparada.

## Documentación

El sitio documental funciona sin API, base de datos ni cuenta de usuario:

```sh
pnpm --dir docs install
pnpm --dir docs dev
```

Abre **[localhost:5173](http://localhost:5173)**. Guardar cambios en Markdown actualiza la página. Para generar y revisar el sitio estático:

```sh
pnpm --dir docs build
pnpm --dir docs preview
```

| Tema | Referencia |
| --- | --- |
| Negocio y procesos | [Alcance](docs/negocio/contexto.md) · [Procesos](docs/negocio/procesos.md) |
| Módulos | [Índice funcional](docs/modulos/index.md) |
| Arquitectura | [Sistema](docs/arquitectura/general.md) · [Frontend](docs/arquitectura/frontend.md) · [Backend](docs/arquitectura/backend.md) |
| Datos | [Modelo](docs/datos/modelo.md) · [Relaciones](docs/database-diagram.md) · [Migraciones](docs/datos/migraciones.md) |
| API | [Contratos](docs/api/contratos.md) · [Endpoints](docs/api/endpoints.md) · [Filtros](docs/api/filtros.md) |
| Reportes | [Fórmulas y criterios](docs/reportes-explicacion.md) |
| Operación | [Desarrollo](docs/operacion/desarrollo.md) · [Verificación](docs/operacion/verificacion.md) · [Diagnóstico](docs/operacion/diagnostico.md) |
| Diseño | [Identidad visual y paleta](docs/identidad-visual.md) |
| Edición | [Cómo documentar](docs/guia/documentar.md) |

La publicación automática y la edición mediante un CMS siguen pendientes. La salida estática del sitio se genera en `docs/.vitepress/dist/`.

## Estructura del repositorio

```text
soccer-league/
├── Api/
│   ├── cmd/api/          # Composición y rutas HTTP
│   ├── internal/         # Handlers, servicios, store, DB y PDF
│   └── sql/              # Esquema, consultas y migraciones
├── Web/
│   └── src/
│       ├── app/          # App Router y proxy de API
│       ├── features/     # Módulos funcionales
│       └── shared/       # UI, sesión y utilidades comunes
├── docs/                 # Sitio y referencias funcionales/técnicas
├── scripts/              # Preparación de datos de desarrollo
└── .env.example          # Plantilla de configuración de la API
```

## Verificación

```sh
# Desde la raíz: frontend y documentación
pnpm --dir Web lint
pnpm --dir Web exec tsc --noEmit --incremental false
pnpm --dir Web build
pnpm --dir docs build

# Desde Api/: backend
go test ./...
go vet ./...
```

Los [escenarios de verificación](docs/operacion/verificacion.md) distinguen los controles automatizados de las comprobaciones funcionales que necesitan una base de prueba.

## Equipo

<table>
  <tr>
    <td align="center"><a href="https://github.com/Br4voCode"><img src="https://avatars.githubusercontent.com/u/196562378?s=128" width="64" height="64" alt="Br4voCode"><br><sub><b>Br4voCode</b></sub></a></td>
    <td align="center"><a href="https://github.com/KITEG21"><img src="https://avatars.githubusercontent.com/u/150097269?s=128" width="64" height="64" alt="KITEG21"><br><sub><b>KITEG21</b></sub></a></td>
    <td align="center"><a href="https://github.com/hasielrb"><img src="https://avatars.githubusercontent.com/u/198116826?s=128" width="64" height="64" alt="hasielrb"><br><sub><b>hasielrb</b></sub></a></td>
    <td align="center"><a href="https://github.com/IsaacAlefGarciaBatista"><img src="https://avatars.githubusercontent.com/u/261979035?s=128" width="64" height="64" alt="IsaacAlefGarciaBatista"><br><sub><b>IsaacAlefGarciaBatista</b></sub></a></td>
  </tr>
</table>

Los perfiles también están disponibles en la página **Equipo** del sitio de documentación.
