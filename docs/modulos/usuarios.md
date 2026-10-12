# Usuarios y roles

Solo `superadmin` dispone de lectura y escritura del recurso `users`. Las cuentas habilitan el acceso al resto de módulos de acuerdo con su rol.

## Pantalla y operaciones

`/users` permite buscar y filtrar cuentas, crear usuarios y editar nombres, apellidos y el rol de otros usuarios. El superadministrador puede completar sus propios nombres y apellidos; su rol y su baja están protegidos. La edición no cambia correo ni contraseña.

| Campo | Uso |
| --- | --- |
| `id` | Identificador de la cuenta |
| `first_name` | Nombres, hasta 100 caracteres |
| `last_name` | Apellidos, hasta 100 caracteres |
| `email` | Correo único, normalizado en minúsculas y sin espacios exteriores |
| `password` | Solo entrada de creación; nunca forma parte del DTO de respuesta |
| `role` | `superadmin`, `admin` o `visitante` |
| `created_at` | Fecha de creación asignada por PostgreSQL |

La búsqueda actúa sobre nombres, apellidos y correo; el filtro de rol permite uno o varios valores. El orden admite nombres, apellidos, correo, rol y fecha de creación.

## Reglas

La API valida nombres y apellidos obligatorios al crear, con un máximo de 100 caracteres y eliminación de espacios exteriores, además de correo, contraseña de 8–72 bytes y rol. Un correo duplicado devuelve conflicto. El actor no puede cambiar su propio rol ni eliminarse. La contraseña se transforma en hash bcrypt antes de guardarse.

La migración `000010` incorpora los campos sin inventar datos personales: las cuentas existentes conservan nombres vacíos hasta que se completen al editar. El menú de sesión consulta `GET /auth/me` y muestra el nombre completo, correo y rol real. Para cuentas todavía sin nombre muestra el correo.

No hay una regla explícita que conserve siempre una cantidad mínima de superadministradores entre cuentas distintas. No existe un endpoint público para aprovisionar el primer usuario ni un seed dentro de las migraciones. El script `scripts/seed-db.ps1` puede preparar la cuenta inicial en un contenedor PostgreSQL local.

Al eliminar una cuenta se eliminan sus RefreshToken. La API verifica la existencia del usuario incluso si conserva un JWT previamente emitido.

## Código y datos

Frontend: `Web/src/features/users/`. Backend: `Api/internal/service/user.go`, `Api/internal/handler/user.go` y permisos. Persistencia: Users y RefreshToken, migraciones `000008` y `000010`.

Contrato HTTP: [endpoints](../api/endpoints.md). Aprovisionamiento inicial: [configuración](../operacion/configuracion.md).
