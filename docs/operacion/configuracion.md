# Configuración y primer acceso

La [instalación](../guia/instalacion.md) describe los comandos iniciales. Esta referencia explica qué configuración consume cada proceso y cómo preparar una base sin usuarios.

## Backend

| Variable | Valor por defecto / prioridad | Uso real |
| --- | --- | --- |
| `DATABASE_URL` | Si está presente, tiene prioridad | DSN completo de PostgreSQL |
| `DB_HOST` | `localhost` | Host si no hay DATABASE_URL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de conexión |
| `DB_PASSWORD` | Sin valor predeterminado | Contraseña de conexión |
| `DB_NAME` | `football` | Base de datos |
| `DB_SSLMODE` | `disable` | SSL de PostgreSQL |
| `PORT` | `8080` | Puerto HTTP de Go |
| `JWT_SECRET` | Obligatoria | Firma y verificación HS256 |

El cargador de `main.go` prueba archivos `.env` candidatos y carga el primero encontrado. Los valores de ese archivo se asignan con `os.Setenv`, incluso si ya había una variable del proceso. Las líneas vacías y comentarios se omiten; se interpretan pares `clave=valor`. No es un parser completo de shell o dotenv.

`APP_ENV` y `LOG_LEVEL` no controlan actualmente el comportamiento del servidor aunque aparezcan como ejemplo o comentario. Los valores de `API_TARGET` y URLs de frontend pertenecen a Web, no son utilizados por Go.

## Frontend

| Variable | Uso |
| --- | --- |
| `API_TARGET` | `local` selecciona API_URL_LOCAL; cualquier otro valor selecciona remoto |
| `API_URL_LOCAL` | Destino local del proxy y acciones de sesión |
| `API_URL_REMOTE` | Destino remoto |
| `JWT_SECRET` | Debe coincidir con la clave de Go para verificar JWT |
| `NODE_ENV` | Determina cookies Secure en producción; lo gestiona el entorno Next.js |

Las URLs son de servidor y no requieren prefijo `NEXT_PUBLIC_`. Una URL ausente produce un error de configuración. `getApiUrl()` elimina barras finales del destino.

Los archivos `.env.example` son plantillas. Los `.env` efectivos no deben formar parte de la documentación ni del repositorio. Tras cambiar la configuración se reinicia el proceso que la consume.

## Base nueva y primera cuenta

Las migraciones crean tablas y restricciones, pero no insertan una cuenta inicial. `POST /users/` exige un superadministrador autenticado; por ello no sirve para arrancar una base sin usuarios.

El primer usuario debe aprovisionarse mediante una operación administrativa de base de datos, con un hash bcrypt compatible con `golang.org/x/crypto/bcrypt`. La contraseña debe tener 8–72 bytes; el servicio utiliza el coste predeterminado de bcrypt.

Ejemplo de la estructura de inserción, sustituyendo el marcador por un hash generado para la contraseña elegida:

```sql
INSERT INTO users (email, password_hash, role)
VALUES ('responsable@example.com', '<HASH_BCRYPT_VALIDO>', 'superadmin');
```

El marcador no es una contraseña válida ni una credencial de ejemplo utilizable. No se guarda texto plano en `password_hash`. Después del primer login, las cuentas adicionales se crean desde `/users`.

No hay un comando de bootstrap, seed ni recuperación de contraseña implementado en el repositorio. Su automatización es trabajo distinto del sitio documental.

## Documentación

VitePress no necesita variables de la liga, PostgreSQL ni JWT. Las rutas, idioma, búsqueda y tema se configuran en `docs/.vitepress/config.mts`. El sitio actual se sirve localmente; publicación automática y editor web permanecen como evolución pendiente en el README documental.

## Componentes necesarios al ejecutar fuera del entorno local

| Componente | Necesidad |
| --- | --- |
| Web | Runtime de Node, dependencias, build Next y configuración de servidor |
| API | Ejecutable Go, variables de conexión/firma y directorio de migraciones |
| PostgreSQL | Base accesible desde Go y permisos suficientes para migraciones |
| Documentación | Contenido de `docs/.vitepress/dist/` después del build; servidor estático |

No se incluye en el repositorio una configuración Docker, pipeline de despliegue ni publicación automática del sitio. Los artefactos de build y dependencias se excluyen de Git.
