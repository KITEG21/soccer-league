# Reglas e integridad

La aplicación distribuye la validación entre formularios del frontend, servicios Go y restricciones de PostgreSQL. Una regla de formulario no implica que la API la aplique de la misma manera.

## Reglas implementadas

| Regla | Capa que la aplica | Efecto |
| --- | --- | --- |
| Nombres de equipo y estadio únicos | Servicio y restricción `UNIQUE` | Conflicto al repetir un nombre |
| Dorsal único dentro del equipo | Servicio y `UNIQUE(team_id, number)` en Footballer | Jugadores y entrenadores comparten numeración |
| Experiencia del entrenador ≥ años en el equipo | Servicio | Rechazo de una relación incoherente |
| Inicio de temporada ≤ fin | Formulario y validación del servicio | Impide el intervalo invertido en el flujo normal |
| Temporadas sin solapamiento | Servicio | Las fechas límite también cuentan como solapamiento |
| Cambiar temporada conserva sus partidos dentro del rango | Servicio | Rechazo si un partido queda fuera |
| Fecha del partido dentro de su temporada | Trigger PostgreSQL | Se aplica al insertar o actualizar un partido |
| Local y visitante diferentes | Formulario y restricción de base de datos | Impide jugar contra el mismo equipo |
| Estadísticas solo en partido disputado | Servicio y trigger | No admite captura en un partido pendiente |
| Una estadística por jugador y partido | `UNIQUE(player_id, match_id)` | Evita participaciones duplicadas |
| Partido con estadísticas no vuelve a pendiente | Trigger | Protege el estado del encuentro |
| Bajas de entidades referenciadas | Servicio y, según entidad, FK o trigger | Conflicto de eliminación |
| Correo de usuario único y rol conocido | Servicio y PostgreSQL | Cuenta válida y no duplicada |
| Actor no modifica su propio rol ni elimina su cuenta | Servicio de usuarios | Protege la sesión administrativa actual |

## Validación de interfaz

Los esquemas de `Web/src/features/*/schemas/` limitan nombres, números no negativos, formato de color y campos obligatorios. Los formularios usan React Hook Form y Zod; el diálogo estadístico mantiene su propio estado y controles numéricos HTML.

Los nombres de equipo y estadio se limitan a 100 caracteres. Los esquemas de jugador y entrenador exigen nombre, pero no definen ese máximo. El color del equipo admite un hexadecimal de seis dígitos. Las contraseñas de usuario se limitan a 8–72 en el formulario y a 8–72 bytes en el backend.

## Límites de aplicación

- PostgreSQL no impone un máximo de asistencia igual a la capacidad del estadio. El porcentaje de audiencia puede superar el 100 %.
- No existe una restricción general que haga todos los contadores y métricas no negativos en la API y en la base de datos.
- La selección de jugadores participantes se limita en la UI; el servicio estadístico comprueba el estado del partido, pero no que el jugador pertenezca a uno de los equipos.
- Player y Coach comparten Footballer, pero no hay una restricción de exclusión que impida ambas especializaciones para el mismo ID mediante escrituras directas.
- El backend no aplica automáticamente todas las anotaciones `validate:"required"` de las estructuras Go. Debe comprobarse la validación explícita de cada servicio.
- Algunas validaciones consultan otros registros antes de escribir. No todas están protegidas frente a concurrencia por una transacción o una restricción SQL equivalente.

## Reglas de cálculo

Los goles se calculan a partir de PlayerStats, no se editan como columnas de Match. La victoria suma tres puntos, el empate uno y la derrota cero. La clasificación y el estado de equipo actuales no filtran `disputed`; un partido pendiente sin goles puede computar como empate. Consulte [reportes](../reportes-explicacion.md) y [límites conocidos](../referencia/estado.md).

Fuentes: `Api/internal/service/validators.go`, `errors.go`, servicios de dominio, `Api/sql/schema.sql` y migraciones `000003` a `000008`.
