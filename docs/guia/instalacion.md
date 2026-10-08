# Instalación y configuración

La documentación, la aplicación web y la API se ejecutan por separado. Para consultar este sitio solo se necesita el entorno de Node.js.

## Requisitos

| Herramienta | Uso |
| --- | --- |
| Node.js 22 o superior | Aplicación web y documentación |
| pnpm | Instalación de paquetes y ejecución de scripts |
| Go 1.21 o superior | API; versión declarada en `Api/go.mod` |
| PostgreSQL | Almacenamiento de datos de la aplicación |

## Sitio de documentación

Desde la raíz del repositorio:

```sh
pnpm --dir docs install
pnpm --dir docs dev
```

Abre `http://localhost:5173`. Los cambios guardados en Markdown se actualizan en el navegador. La API y la base de datos no son necesarias para consultar el sitio.

Para generar y comprobar una versión estática:

```sh
pnpm --dir docs build
pnpm --dir docs preview
```

La salida se guarda en `docs/.vitepress/dist/`.

## Base de datos y API

Prepara una instancia de PostgreSQL y crea la base de datos que utilizará la aplicación. Copia el archivo de configuración de ejemplo de la raíz del repositorio:

```powershell
Copy-Item .env.example .env
```

Configura los valores de conexión y `JWT_SECRET` en `.env`.

| Variable | Función |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión completa; tiene prioridad sobre los parámetros individuales |
| `DB_HOST`, `DB_PORT` | Dirección y puerto de PostgreSQL |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Credenciales y base de datos |
| `DB_SSLMODE` | Modo SSL de la conexión |
| `PORT` | Puerto de la API; el ejemplo utiliza `8080` |
| `JWT_SECRET` | Clave utilizada para la autenticación |

Desde `Api/`:

```sh
go mod download
go run ./cmd/api
```

La API busca el archivo `.env` en su directorio y en los directorios superiores. Al iniciar, comprueba la conexión a PostgreSQL y aplica las migraciones pendientes de `Api/sql/migrations/`.

## Aplicación web

Desde `Web/`, copia la configuración de ejemplo:

```powershell
Copy-Item .env.example .env
```

| Variable | Configuración local |
| --- | --- |
| `API_TARGET` | `local` |
| `API_URL_LOCAL` | `http://localhost:8080` |
| `API_URL_REMOTE` | URL de la API remota para el modo `remote` |
| `JWT_SECRET` | El mismo valor configurado en la API |

Instala las dependencias e inicia el servidor:

```sh
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. Para iniciar sesión se necesita un usuario registrado en la base de datos de la API.

## Comprobaciones de la aplicación web

Desde `Web/`:

```sh
pnpm lint
pnpm exec tsc --noEmit --incremental false
pnpm build
```
