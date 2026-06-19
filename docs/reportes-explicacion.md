# Explicación de los reportes (`queries.sql`)

Este documento explica, acción por acción, las consultas SQL de los 7 reportes definidos en [queries.sql](queries.sql) (líneas 373-736).

## Patrón común: cálculo de goles por equipo en un partido

Casi todos los reportes usan este bloque:

```sql
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ps.goals_scored), 0) AS total
    FROM PlayerStats ps
    JOIN Player p ON p.footballer_id = ps.player_id
    JOIN Footballer f ON f.id = p.footballer_id
    WHERE ps.match_id = m.id AND f.team_id = m.home_team_id
) hg ON true
```

**Por qué existe:** la tabla `Match` no guarda el marcador. Los goles se calculan sumando `goals_scored` de la tabla `PlayerStats` de **todos los jugadores de ese equipo en ese partido**. Por eso hay que pasar por `PlayerStats → Player → Footballer` para saber a qué equipo pertenece cada gol.

**Por qué `LATERAL`:** porque la subconsulta necesita referenciar `m.id` y `m.home_team_id` de la fila externa (el partido actual). Un JOIN normal no permite eso.

**`hg` (home goals) y `ag` (away goals):** son dos subconsultas idénticas, una filtrando por equipo local y otra por visitante.

**`COALESCE(..., 0)`:** si el partido no tiene estadísticas registradas todavía, el resultado es 0 en lugar de NULL (partido sin jugar = 0-0 por defecto).

---

## Reporte 1: `ListStandings` (tabla de posiciones)

```sql
FROM Team t
LEFT JOIN Match m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.season_id = $1
LEFT JOIN LATERAL (...) hg ON true
LEFT JOIN LATERAL (...) ag ON true
GROUP BY t.id, t.name
ORDER BY points DESC, t.name
```

1. Parte de `Team` (no de `Match`) con `LEFT JOIN`, para que aparezcan **todos los equipos**, incluso los que no jugaron ningún partido en la temporada `$1`.
2. Se traen todos los partidos de ese equipo en esa temporada (como local o visitante).
3. Por cada partido se calculan `hg`/`ag` (goles propios y rivales) con el patrón ya explicado.
4. El `CASE` dentro del `SUM`:
   - 3 puntos si el equipo ganó (sea local o visitante).
   - 1 punto si empató (`hg = ag`), pero sólo si `m.id IS NOT NULL` (para no sumar punto de empate fantasma cuando un equipo no tiene partidos —ahí `hg` y `ag` serían NULL/0=0 falsos positivos).
   - 0 en cualquier otro caso (incluye derrota o "no hay partido").
5. `GROUP BY` agrupa por equipo y `SUM` acumula los puntos de todos sus partidos.
6. Orden final: más puntos primero, y en caso de empate, alfabético.

---

## Reporte 2: `ListMatchesBetweenTeams` / `ListMatchesBetweenTeamsAllSeasons` (historial entre dos equipos)

```sql
WHERE ((m.home_team_id = $1 AND m.away_team_id = $2) OR (m.home_team_id = $2 AND m.away_team_id = $1))
  AND m.season_id = $3
```

1. Hace `JOIN` (no LEFT JOIN, porque siempre debe existir) con `Team` dos veces —una con alias `ht` (home team) y otra `at` (away team)— para traer el **nombre** del equipo, no solo el id. Igual con `Stadium` para el nombre del estadio.
2. El `WHERE` busca partidos donde el par de equipos coincide **en cualquier orden** (A vs B o B vs A), porque el enfrentamiento es el mismo sin importar quién jugó de local.
3. Filtra además por `season_id` (la versión `AllSeasons` omite ese filtro para traer el historial completo).
4. Además de `hg`/`ag` (goles), agrega dos subconsultas escalares (no lateral, sino `SELECT` dentro del `SELECT`) que suman las **asistencias** (`assists`) de cada equipo en ese partido — mismo patrón de pasar por `Player`/`Footballer` para saber de qué equipo es cada jugador.
5. Ordena cronológicamente.

---

## Reporte 3: `ListMatchesForDate` / `ListMatchesForDateAndStadium` (partidos por fecha)

1. Igual estructura de JOINs que el anterior (trae nombres de equipos y estadio), pero el filtro es por `match_date = $1` (y opcionalmente `stadium_id = $2`).
2. Incluye `m.attendance` (asistencia de público), dato relevante para este reporte.
3. No filtra por temporada porque la fecha ya es suficientemente específica.

---

## Reporte 4: `ListCoachesByExperience` (entrenadores por experiencia)

```sql
FROM Footballer f
JOIN Coach c ON c.footballer_id = f.id
LEFT JOIN Team t ON t.id = f.team_id
ORDER BY c.championships_won DESC, c.experience_years DESC, f.name
```

1. `Footballer` es la tabla base de personas (jugadores y entrenadores comparten datos comunes: nombre, número, años en el equipo). `Coach` extiende esa fila con `experience_years` y `championships_won`.
2. `JOIN` (no LEFT) con `Coach` porque solo interesan los registros que sí son entrenadores.
3. `LEFT JOIN Team`: por si un entrenador quedó sin equipo asignado (free agent), igual debe aparecer en el listado, con `team_name` nulo.
4. Orden: primero por campeonatos ganados (lo más relevante), luego por experiencia, luego alfabético como criterio de desempate estable.

---

## Reporte 5: `ListStadiumsByAttendance` (ocupación de estadios)

```sql
FROM Stadium s
LEFT JOIN Match m ON s.id = m.stadium_id AND m.season_id = $1
GROUP BY s.id, s.name, s.capacity
```

1. Parte de `Stadium` con LEFT JOIN para incluir estadios que no tuvieron partidos en esa temporada (con 0 asistencia).
2. `SUM(m.attendance)`: total de público que pasó por el estadio en la temporada.
3. `COUNT(m.id)`: cuántos partidos se jugaron ahí.
4. El `CASE` calcula el **porcentaje de ocupación promedio**:
   - Denominador: `cantidad_partidos * capacidad` → la capacidad teórica máxima acumulada.
   - Numerador: la asistencia real acumulada.
   - Se protege contra división por cero (`capacity = 0` o `0 partidos`) devolviendo `0.0` en ese caso.
   - `ROUND(..., 2)` redondea a 2 decimales y el `CAST` final asegura que el driver de la BD lo entregue como `float8` consistente.
5. Orden: estadios más "llenos" primero.

---

## Reporte 6: `GetTeamStatus` (ficha de un equipo: V/E/D local y visitante)

```sql
WITH match_scores AS ( ... WHERE m.season_id = $2 )
SELECT ... FROM Team t
LEFT JOIN match_scores ms ON ms.home_team_id = t.id OR ms.away_team_id = t.id
WHERE t.id = $1
GROUP BY t.id, t.name
```

1. Usa un **CTE** (`WITH match_scores AS (...)`) para precalcular, una sola vez, el marcador (`home_goals`/`away_goals`) de todos los partidos de la temporada `$2`. Esto evita repetir el patrón LATERAL siete veces en el `SELECT` final.
2. Luego, para el equipo `$1`, cuenta con `COUNT(CASE WHEN ... THEN 1 END)`:
   - Victorias/empates/derrotas **jugando de local** (`home_wins`, `home_draws`, `home_losses`).
   - Lo mismo **jugando de visitante** (`away_*`).
   - Y los **totales combinados** (`total_wins`, `total_draws`, `total_losses`), que cubren ambos casos sin importar si fue local o visitante.
3. Es una técnica clásica de "pivotear" condicionalmente: en vez de hacer 9 consultas separadas, se hace 1 sola pasada por los datos y cada `COUNT(CASE...)` cuenta una categoría distinta.

---

## Reporte 7: equipo ideal / "All-Star" (`GetBestForward`, `GetBestMidfielder`, `GetBestDefender`, `GetBestGoalkeeper`)

Cuatro queries, una por posición, que en conjunto forman el 11 ideal (1 portero + 4 defensas + 3 mediocampistas + 3 delanteros):

```sql
FROM Footballer f
JOIN Player p ON p.footballer_id = f.id
JOIN PlayerStats ps ON ps.player_id = p.footballer_id
JOIN Match m ON m.id = ps.match_id
LEFT JOIN Team t ON t.id = f.team_id
WHERE p.position = 'Delantero' AND m.season_id = $1
GROUP BY f.id, f.name, t.name
ORDER BY metric_value DESC, ...
LIMIT N
```

1. Cada query filtra por `position` (`Delantero`, `Mediocampo`, `Defensa`, `Portero`) y por temporada `$1`.
2. Cada posición tiene una **métrica distinta** que define quién es "el mejor" en ese rol — esto es la parte conceptualmente más importante para explicar:
   - **Delantero**: `SUM(shots_on_goal)` — quién dispara más a puerta.
   - **Mediocampista**: `SUM(passes_completed + interceptions)` — combina creación de juego y recuperación.
   - **Defensa**: `SUM(tackles + blocks)` — acciones defensivas.
   - **Portero**: `SUM(saves - goals_conceded)` — atajadas menos goles recibidos (rendimiento neto).
3. Además de la métrica principal, cada query trae **todas** las estadísticas agregadas (goles, asistencias, tiros, pases, etc.) como columnas extra — útil para mostrar el detalle completo del jugador en el reporte, no solo el número que lo hizo ganar.
4. `ORDER BY metric_value DESC, <criterio_secundario> DESC, f.name`: ordena por la métrica principal, y en caso de empate usa un criterio secundario relevante a la posición, y por último el nombre como desempate final (determinismo).
5. `LIMIT`: 3 delanteros, 3 mediocampistas, 4 defensas, 1 portero (`:many` para los primeros tres, `:one` para el portero porque solo se necesita uno).
6. `LEFT JOIN Team`: igual que en el reporte 4, por si el jugador no tiene equipo asignado.
