# Arquitectura

SoccerLeague se organiza en una aplicación web, una API y una base de datos. El sitio de documentación es independiente de estos componentes.

## Flujo de una petición

1. El navegador carga una página de la aplicación Next.js.
2. Next.js comprueba la sesión y los permisos de la ruta.
3. Las peticiones de datos se envían a la API Go a través de la aplicación web.
4. La API valida el acceso y ejecuta la lógica del servicio.
5. El servicio utiliza las consultas generadas con sqlc para acceder a PostgreSQL.

## Aplicación web

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| `Web/src/app/` | Rutas y páginas de Next.js |
| `Web/src/app/api/backend/` | Reenvío de peticiones hacia la API |
| `Web/src/features/` | Funcionalidades organizadas por dominio |
| `Web/src/shared/` | Componentes, utilidades, autenticación y configuración compartidos |
| `Web/src/i18n/` | Configuración de idiomas |
| `Web/src/proxy.ts` | Comprobación de sesión y autorización antes de acceder a las páginas |
| `Web/src/app/globals.css` | Tokens de color y estilos globales |

## API

| Carpeta | Responsabilidad |
| --- | --- |
| `Api/cmd/api/` | Inicio del servidor y registro de rutas |
| `Api/internal/handler/` | Entrada HTTP y respuestas |
| `Api/internal/service/` | Reglas de negocio y validaciones |
| `Api/internal/store/` | Acceso a datos generado con sqlc |
| `Api/internal/db/` | Conexión y migraciones |
| `Api/sql/` | Esquema, consultas y migraciones SQL |

## Autenticación

La API emite los tokens de acceso y renovación. La aplicación web conserva la sesión en cookies `httpOnly` y verifica los tokens de acceso con el mismo `JWT_SECRET` utilizado por la API.

Las llamadas a la API incluyen el token de acceso. Cuando es necesario, la aplicación web utiliza el token de renovación para intentar recuperar la sesión.

## Documentación

Las páginas se almacenan en `docs/`. VitePress transforma el Markdown en un sitio estático con navegación, búsqueda local y temas claro y oscuro. La configuración y los estilos del sitio están en `docs/.vitepress/`.
