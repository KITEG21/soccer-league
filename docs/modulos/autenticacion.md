# Acceso y sesión

## Propósito y pantallas

`/login` solicita correo y contraseña. Una sesión válida permite entrar en la aplicación; acceder a login ya autenticado redirige al inicio. Las páginas protegidas sin sesión redirigen a login. Un usuario autenticado sin permisos recibe la vista `/forbidden` con estado 403 desde el proxy.

## Operaciones

| Operación | Implementación | Resultado |
| --- | --- | --- |
| Iniciar sesión | Server Action → `POST /auth/login` | Cookies de acceso y renovación; redirección a `/` |
| Renovar | Proxy de página o API → `POST /auth/refresh` | Rotación del refresh token y nuevas cookies |
| Cerrar sesión | Server Action → `POST /auth/logout` | Revocación intentada, cookies borradas y vuelta a login |

El formulario presenta errores de credenciales y limita envíos durante la petición. El contexto del cliente recibe ID, rol y permisos para decidir qué acciones mostrar. No almacena la contraseña ni expone tokens.

## Reglas y dependencias

El correo se normaliza en la API. Una contraseña correcta se comprueba con bcrypt. Los intentos fallidos se limitan por cuenta e IP. Los permisos se aplican de nuevo en el backend y pueden cambiar cuando se modifica el rol del usuario.

No hay registro público, recuperación de contraseña ni edición del correo o contraseña desde el módulo de usuarios actual.

## Código relacionado

- Frontend: `Web/src/features/auth/`, `Web/src/shared/auth/`, `Web/src/shared/contexts/AuthContext.tsx`, `Web/src/proxy.ts`.
- Backend: `Api/internal/service/auth.go`, `login_limiter.go`, `permission.go`; handlers de autenticación.
- Datos: Users y RefreshToken.

Véase [arquitectura de seguridad](../arquitectura/seguridad.md) para duración de sesión, cookies y límites de revocación.
