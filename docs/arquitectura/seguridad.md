# Autenticación y autorización

## Roles y permisos

Los permisos se expresan como `recurso:read` y `recurso:write`. Go mantiene la asignación autoritativa en `Api/internal/service/permission.go`.

| Área | superadmin | admin | visitante |
| --- | --- | --- | --- |
| Equipos, estadios, temporadas | Leer y escribir | Leer y escribir | Leer |
| Jugadores y entrenadores | Leer y escribir | Leer y escribir | Leer |
| Partidos y estadísticas | Leer y escribir | Leer y escribir | Leer |
| Reportes y PDF | Leer | Leer | Leer |
| Usuarios y roles | Leer y escribir | Sin acceso | Sin acceso |

Dashboard y detalles combinan permisos de los recursos que consultan. La interfaz conoce los permisos presentes en la sesión; la API vuelve a consultar al usuario y aplica su rol actual.

## Sesión

| Elemento | Implementación |
| --- | --- |
| Contraseña | Hash bcrypt, coste predeterminado de la biblioteca |
| Token de acceso | JWT HS256, duración 15 minutos |
| Claims | `sub`, correo, rol, permisos, emisión y expiración |
| Token de renovación | 32 bytes aleatorios, codificados como base64url; duración 7 días |
| Persistencia de renovación | SHA-256 del token en RefreshToken; no el token original |
| Cookies web | `access_token` y `refresh_token`, HttpOnly, SameSite=Lax, Path=/ |
| Cookies Secure | Activadas en entorno Node de producción |

El backend devuelve tokens a Next.js. Las acciones de servidor y el Route Handler guardan cookies; AuthContext expone información de sesión, sin credenciales.

## Renovación y revocación

El endpoint refresh marca el token previo como rotado mediante una actualización SQL condicional y emite otro par. Reutilizar un token rotado que aún no está revocado ni caducado provoca la revocación de los tokens de renovación del usuario.

El proxy de páginas puede renovar antes de navegar. El proxy de API puede renovar tras un 401 y reintentar una vez. El cierre de sesión intenta revocar el refresh token, elimina las cookies y limpia la caché de consultas incluso si la API no está disponible.

El cierre de sesión no mantiene una lista de JWT de acceso revocados. Un JWT ya emitido puede seguir siendo válido hasta expirar, aunque Go rechaza usuarios eliminados y usa el rol actual de la base de datos. La interfaz puede conservar permisos antiguos hasta renovar la sesión.

## Limitación de intentos

El login normaliza el correo y limita fallos por cuenta e IP: cinco por cuenta y veinte por IP en una ventana de quince minutos. El rechazo devuelve 429 con `Retry-After`. Se compara un hash ficticio si la cuenta no existe.

El contador reside en memoria del proceso: se pierde al reiniciar y no se comparte entre réplicas. Un login correcto reinicia el contador de cuenta, pero no elimina el contador acumulado de IP.

## Fronteras de confianza

- La API es accesible directamente; ocultar acciones en React no protege endpoints.
- Next.js y Go deben usar el mismo `JWT_SECRET` para que la verificación web sea coherente.
- Los encabezados de IP reenviada solo deben representar clientes reales cuando los proxies de despliegue se configuran correctamente.
- La API usa CORS `*`; la sesión del navegador con la aplicación se realiza en el mismo origen a través de Next.js.
- No hay registro público, recuperación de contraseña, MFA ni auditoría persistente de acciones de usuarios en el código actual.

Fuentes: `Api/internal/service/auth.go`, `login_limiter.go`, `user.go`; `Api/internal/handler/auth_middleware.go`; `Web/src/shared/auth/`, `features/auth/` y `src/proxy.ts`.
