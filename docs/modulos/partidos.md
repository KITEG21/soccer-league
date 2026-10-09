# Partidos

`/matches` lista y mantiene encuentros; `/matches/{id}` muestra marcador, estado y estadísticas de jugadores.

## Datos

| Campo | Uso |
| --- | --- |
| `home_team_id`, `away_team_id` | Equipos participantes, diferentes entre sí |
| `season_id` | Temporada que contiene el encuentro |
| `stadium_id` | Sede |
| `match_date` | Fecha de calendario en formato `YYYY-MM-DD` |
| `attendance` | Asistencia registrada |
| `disputed` | `false`: pendiente; `true`: disputado |
| `home_goals`, `away_goals` | Valores calculados al consultar; no se envían para guardar marcador |
| Nombres de equipos y estadio | Datos enriquecidos en las consultas correspondientes |

PostgreSQL utiliza DATE, no una fecha/hora con zona. Una hora mostrada por un control o una presentación no constituye un horario persistido.

## Operaciones y estados

La programación selecciona equipos, temporada, estadio y fecha. El formulario evita que local y visitante coincidan. La base de datos valida la fecha dentro de temporada y la diferencia de equipos.

Un partido pendiente no admite estadísticas. Para capturar rendimiento debe marcarse como disputado. Si tiene estadísticas, el trigger bloquea volver a pendiente y el servicio/trigger bloquea la eliminación. No existe un estado adicional de suspendido, cancelado o acta cerrada.

## Marcador

Las consultas suman `goals_scored` de las estadísticas cuyos jugadores pertenecen actualmente al local o visitante. No hay edición manual de `home_goals` o `away_goals`, ni ajuste separado por autogoles.

Un partido sin estadísticas tiene marcador calculado 0–0. Ese marcador no demuestra que haya sido disputado: debe interpretarse junto con `disputed`. Los reportes actuales no filtran siempre ese estado.

## Listado y permisos

La búsqueda combina nombres de local, visitante y estadio. Hay filtros por temporada, equipo en cualquier lado, local, visitante, estadio, estado, rango de fechas y asistencia. `matches:read` permite consulta; `matches:write` permite mantenimiento. La edición de estadísticas requiere un permiso separado `player-stats:write`.

## Código y datos

`Web/src/features/matches/`, `Api/internal/service/match.go`, `handler/match.go`, tabla Match. La captura individual se describe en [estadísticas](./estadisticas.md), y sus restricciones en [reglas](../negocio/reglas.md).
