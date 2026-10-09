# Usuarios y roles

Solo `superadmin` dispone de lectura y escritura del recurso `users`. Las cuentas habilitan el acceso al resto de módulos de acuerdo con su rol.

## Pantalla y operaciones

`/users` permite buscar y filtrar cuentas, crear usuarios, cambiar el rol de otros usuarios y eliminarlos. La edición actual modifica únicamente `role`; no cambia correo ni contraseña.

| Campo | Uso |
| --- | --- |
| `id` | Identificador de la cuenta |
| `email` | Correo único, normalizado en minúsculas y sin espacios exteriores |
| `password` | Solo entrada de creación; nunca forma parte del DTO de respuesta |
| `role` | `superadmin`, `admin` o `visitante` |
| `created_at` | Fecha de creación asignada por PostgreSQL |

La búsqueda actúa sobre correo; el filtro de rol permite uno o varios valores. El orden admite correo, rol y fecha de creación.

## Reglas

La API valida correo, contraseña de 8–72 bytes y rol. Un correo duplicado devuelve conflicto. El actor no puede cambiar su propio rol ni eliminarse. La contraseña se transforma en hash bcrypt antes de guardarse.

No hay una regla explícita que conserve siempre una cantidad mínima de superadministradores entre cuentas distintas. No existe un endpoint público para aprovisionar el primer usuario ni un seed dentro de las migraciones. El script `scripts/seed-db.ps1` puede preparar la cuenta inicial en un contenedor PostgreSQL local.

Al eliminar una cuenta se eliminan sus RefreshToken. La API verifica la existencia del usuario incluso si conserva un JWT previamente emitido.

## Código y datos

Frontend: `Web/src/features/users/`. Backend: `Api/internal/service/user.go`, `Api/internal/handler/user.go` y permisos. Persistencia: Users y RefreshToken, migración `000008`.

Contrato HTTP: [endpoints](../api/endpoints.md). Aprovisionamiento inicial: [configuración](../operacion/configuracion.md).
