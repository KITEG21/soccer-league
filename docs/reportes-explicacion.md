# Cálculos y criterios de reportes

Las consultas nombradas de `Api/sql/queries.sql` definen los cálculos. `ReportsService` convierte sus resultados a DTO; el JSON y el PDF utilizan esos mismos métodos. Las referencias siguientes usan nombres de consulta para evitar números de línea que cambian con cada edición.

## Marcador común

Para un encuentro se suman los goles de PlayerStats al unir Player y Footballer y comparar el equipo actual con local o visitante:

```text
goles_local = SUM(goals_scored de jugadores con team_id = home_team_id)
goles_visitante = SUM(goals_scored de jugadores con team_id = away_team_id)
```

`COALESCE` convierte una suma sin filas en cero. No se guarda marcador en Match. Los goles encajados del portero son una métrica de rendimiento; no son la fuente del marcador del rival.

::: warning Histórico y estado
La afiliación utilizada es la actual de Footballer. Una transferencia puede cambiar el reparto histórico. Las consultas de clasificación, estado, agenda, enfrentamientos y audiencia no exigen `disputed = true`; un encuentro pendiente sin estadísticas puede representar un 0–0 en los reportes.
:::

## Clasificación

Consulta `ListStandings`; requiere `seasonId`.

```text
puntos = 3 × victorias + 1 × empates
```

La consulta parte de todos los equipos y enlaza partidos de la temporada. Un equipo sin encuentros aparece con cero puntos. El orden es puntos descendentes y nombre ascendente; no hay desempate por diferencia de goles ni enfrentamiento directo.

Ejemplo: una victoria, un empate y una derrota suman cuatro puntos. En el SQL actual, un partido pendiente 0–0 también suma un punto a cada participante.

Respuesta: `team_id`, `name`, `points`. No hay asignación automática de campeonatos ganados ni cierre de liga.

## Enfrentamientos entre equipos

Consultas `ListMatchesBetweenTeams` y `ListMatchesBetweenTeamsAllSeasons`. Aceptan ambos sentidos local/visitante entre `team1` y `team2`; una temporada limita el conjunto y su ausencia consulta todas.

El marcador usa la suma común; las asistencias se agregan con el mismo criterio de equipo actual. Orden por fecha y después ID.

Respuesta: `id`, `match_date`, IDs de equipos/estadio, nombres correspondientes, `home_goals`, `away_goals`, `home_assists`, `away_assists`.

## Partidos por fecha

Consultas `ListMatchesForDate` y `ListMatchesForDateAndStadium`. La igualdad se aplica a una fecha DATE; opcionalmente filtra sede. Orden por ID.

Respuesta: identificación y nombres del encuentro, goles y `attendance`. No es una búsqueda por intervalo ni por hora. Aunque el enunciado habla de partidos jugados, el SQL no filtra el estado disputado.

## Entrenadores

Consulta `ListCoachesByExperience`. No recibe filtros y ordena por:

1. Campeonatos ganados, descendente.
2. Experiencia, descendente.
3. Nombre, ascendente.

El título del reporte no implica que experiencia sea el primer criterio. Respuesta: `id`, `team_id`, `name`, `number`, `experience_years`, `championships_won`, `team_name`.

## Audiencia de estadios

Consulta `ListStadiumsByAttendance`, por temporada:

```text
audiencia_total = SUM(attendance)
capacidad_total = COUNT(partidos de la temporada en el estadio) × capacity
porcentaje = ROUND(audiencia_total / capacidad_total × 100, 2)
```

Si capacidad o cantidad de encuentros es cero, el porcentaje es cero. Todos los estadios aparecen; el orden es porcentaje descendente y nombre ascendente.

Ejemplo: capacidad 1 000, dos partidos y asistencia total 1 500 → 75 %. Los partidos pendientes cuentan en el denominador. El cálculo usa la capacidad actual y no limita el porcentaje a 100 %.

Respuesta: `id`, `name`, `capacity`, `total_attendance`, `total_matches`, `attendance_percentage`.

## Estado de un equipo

Consulta `GetTeamStatus`, por equipo y temporada. Una CTE calcula marcadores y después cuenta comparaciones como local y visitante.

| Métrica | Criterio |
| --- | --- |
| Victoria local | Goles local > goles visitante |
| Empate local | Goles iguales siendo local |
| Derrota local | Goles local < goles visitante |
| Victoria visitante | Goles visitante > goles local |
| Empate visitante | Goles iguales siendo visitante |
| Derrota visitante | Goles visitante < goles local |
| Totales | Suma lógica de ambos roles por resultado |

Respuesta: `team_id`, `name`, seis contadores `home_*`/`away_*` y tres `total_*`, con sufijos `wins`, `draws`, `losses`. Un equipo existente sin encuentros tiene contadores cero; uno inexistente no produce una fila de equipo.

## Equipo de estrellas

Las consultas `GetBestGoalkeeper`, `GetBestDefender`, `GetBestMidfielder` y `GetBestForward` agregan estadísticas de jugadores con filas en partidos de la temporada. Comparan la posición principal por su cadena exacta en español.

| Posición | Cantidad máxima | Métrica principal | Desempates |
| --- | --- | --- | --- |
| Portero | 1 | Paradas − goles encajados | Paradas DESC, encajados ASC, nombre ASC |
| Defensa | 4 | Entradas + bloqueos | Entradas DESC, bloqueos DESC, nombre ASC |
| Mediocampo | 3 | Pases completados + intercepciones | Pases DESC, intercepciones DESC, nombre ASC |
| Delantero | 3 | Tiros a puerta | Goles DESC, asistencias DESC, nombre ASC |

Si no hay candidatos, el servicio actual devuelve `null`, no necesariamente un array vacío. Se devuelve hasta once jugadores; si faltan candidatos de una posición, el resultado es menor y no se rellena con otra posición. Los jugadores sin estadísticas en esa temporada no participan. Los totales de métricas pueden favorecer a quien acumula más encuentros: no se normalizan por partido.

Respuesta: posición, `player_id`, `team_id`, nombres, `metric_name`, `metric_value` y las nueve métricas agregadas. Para portero, `metric_name` es `saves_minus_goals_conceded`; las demás posiciones tienen su identificador de métrica definido en SQL.

## Exportación y consistencia

El PDF vuelve a ejecutar el servicio con los filtros recibidos. Un cambio de datos entre consulta y exportación puede generar valores distintos. Las etiquetas se traducen para español/inglés, pero fórmulas y selección son las mismas.

Consulte [pantallas y PDF](./modulos/reportes.md), [endpoints](./api/endpoints.md) y [límites conocidos](./referencia/estado.md).
