# Plan de Reestructuración de Base de Datos para Liga de Fútbol

Este documento detalla los cambios necesarios en la base de datos y la API para cumplir con las especificaciones del proyecto y generar los 7 reportes requeridos.

## Instrucciones para Agentes

**IMPORTANTE:** Este documento contiene tareas con checkboxes para seguimiento del progreso. Al trabajar con este documento:

- **NO BORRAR tareas completadas**: Marcarlas como completadas usando `[x]` en lugar de borrarlas
- **Marcar tareas completadas**: Cuando una tarea se complete, cambiar `[ ]` por `[x]`
- **Solo modificar tareas si es necesario**: Las tareas solo deben modificarse si se determina que no son correctas o quedan descartadas
- **Mantener historial**: Los checkboxes permiten saber qué falta y qué ya se completó
- **Versionado**: Si se modifica una tarea, mantener una nota explicativa del cambio

Este sistema de seguimiento es para asegurar que no se pierda información sobre el progreso y que cualquier agente pueda continuar el trabajo eficientemente.

## Jerarquía y Relaciones de Tablas

El sistema de la liga de fútbol tiene la siguiente jerarquía y relaciones:

```
LIGA (sistema en sí - no requiere tabla)
├── Temporadas (Season)
│   └── Partidos (Match) - cada partido pertenece a una temporada
│       └── Estadísticas de Jugadores (PlayerStats) - por cada partido
├── Equipos (Team)
│   ├── Jugadores (Footballer → Player)
│   ├── Entrenadores (Footballer → Coach)
│   └── Estadios (Stadium) - donde se juegan los partidos
```

**Relaciones clave:**
- **Temporada → Partidos**: Cada partido pertenece a una temporada (Match.season_id)
- **Partido → Estadísticas**: Cada partido tiene estadísticas de cada jugador que participó (PlayerStats.match_id)
- **Equipo → Jugadores/Entrenadores**: Los equipos tienen jugadores y entrenadores (Footballer.team_id)
- **Partido → Equipos**: Cada partido tiene un equipo local y un visitante (Match.home_team_id, Match.away_team_id)
- **Partido → Estadio**: Cada partido se juega en un estadio (Match.stadium_id)

**Importancia de la temporada:**
Casi todos los reportes deben filtrarse por temporada, ya que:
- Los mejores jugadores (All Stars) pueden cambiar entre temporadas
- La audiencia de los estadios varía por temporada
- La tabla de posiciones es específica de cada temporada
- Las estadísticas de equipos y jugadores son acumuladas por temporada

## Resumen de Cambios Necesarios

### Tablas Existentes (Estado Actual)

- **Team** ✓ (completo: name, province, mascot, color, championships_played, championships_won)
- **Stadium** ✓ (parcial: name, capacity - ya tiene capacity, falta rastrear attendance por partido)
- **Season** ✓ (completo: start_date, end_date)
- **Footballer** ✓ (completo: team_id, name, number, years_in_team)
- **Position** ⚠️ (existe actualmente - tiene id y name, pero podría eliminarse ya que las posiciones son fijas y estáticas)
- **Player** ⚠️ (existe actualmente con: footballer_id, position_id, matches_played, goals, assists - goals y assists deberían eliminarse ya que se calculan de PlayerStats, position_id debería cambiarse a TEXT, falta average_goals_per_match)
- **Coach** ✓ (parcial: experience_years - falta championships_won personal)

### Tablas Faltantes

- **Match** (completamente ausente - crítica para la mayoría de reportes)
- **PlayerStats** (tabla general de estadísticas para todos los jugadores)

## CAMBIOS EN LA BASE DE DATOS

### Tablas Nuevas

#### 1. Nueva Tabla: Match

Esta tabla es fundamental para registrar todos los partidos de la liga. Sin ella, no se pueden generar la mayoría de los reportes.

```sql
CREATE TABLE Match (
    id BIGSERIAL PRIMARY KEY,
    home_team_id BIGINT REFERENCES Team(id),
    away_team_id BIGINT REFERENCES Team(id),
    season_id BIGINT REFERENCES Season(id),
    stadium_id BIGINT REFERENCES Stadium(id),
    match_date DATE NOT NULL,
    home_goals INT,
    away_goals INT,
    attendance INT
);
```

**Campos explicados:**
- `home_team_id`: Equipo local
- `away_team_id`: Equipo visitante
- `season_id`: Temporada a la que pertenece el partido
- `stadium_id`: Estadio donde se jugó el partido
- `match_date`: Fecha del partido
- `home_goals`: Goles del equipo local
- `away_goals`: Goles del equipo visitante
- `attendance`: Cantidad de espectadores que asistieron al partido

#### 2. Nueva Tabla: PlayerStats (Estadísticas por Partido)

Tabla unificada de estadísticas por partido para todos los jugadores. Cada registro representa las estadísticas de un jugador en un partido específico. Puede haber múltiples registros por jugador (uno por cada partido en el que participó). Cualquier jugador puede tener cualquier estadística (ej: un portero puede marcar goles, un defensa puede tener asistencias, etc.).

```sql
CREATE TABLE PlayerStats (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT REFERENCES Player(footballer_id),
    match_id BIGINT REFERENCES Match(id),
    shots_on_goal INT DEFAULT 0,
    passes_completed INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    tackles INT DEFAULT 0,
    blocks INT DEFAULT 0,
    saves INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    UNIQUE(player_id, match_id)
);
```

**Campos explicados:**
- `player_id`: Referencia al jugador
- `match_id`: Referencia al partido
- `shots_on_goal`: Tiros a puerta en ese partido (principalmente delanteros)
- `passes_completed`: Pases completados en ese partido (principalmente mediocampistas)
- `interceptions`: Intercepciones en ese partido (principalmente mediocampistas y defensas)
- `tackles`: Entradas en ese partido (principalmente defensas)
- `blocks`: Bloqueos en ese partido (principalmente defensas)
- `saves`: Paradas en ese partido (principalmente porteros)
- `goals_conceded`: Goles encajados en ese partido (principalmente porteros)

**Nota:** Cada registro es una estadística de un jugador en un partido específico. No se acumulan. Para obtener estadísticas totales de un jugador, se deben sumar/agrupar todos sus registros. La restricción UNIQUE(player_id, match_id) asegura que solo haya un registro por jugador por partido.

**Ventajas de este diseño:**
- Permite rastrear estadísticas detalladas por partido
- Historial completo del desempeño de cada jugador
- Facilita análisis temporales y tendencias
- Más flexible para consultas específicas por partido

### Modificaciones a Tablas Existentes

#### 3. Modificar Tabla: Coach

**Estado actual:** Tiene footballer_id y experience_years.

**Cambios requeridos:** Agregar campo de campeonatos ganados personalmente. Esto es necesario porque un entrenador puede haber ganado campeonatos en diferentes equipos a lo largo de su carrera, y no necesariamente los campeonatos del equipo actual.

```sql
ALTER TABLE Coach ADD COLUMN championships_won INT DEFAULT 0;
```

#### 4. Modificar Tabla: Player

**Estado actual:** Tiene footballer_id, position_id (referencia a Position), matches_played, goals, assists.

**Cambios requeridos:**
- Eliminar position_id y agregar position como TEXT
- Agregar average_goals_per_match
- Eliminar goals y assists (se calculan de PlayerStats)

```sql
ALTER TABLE Player DROP COLUMN position_id;
ALTER TABLE Player ADD COLUMN position TEXT;
ALTER TABLE Player ADD COLUMN average_goals_per_match DECIMAL(5,2);
ALTER TABLE Player DROP COLUMN goals;
ALTER TABLE Player DROP COLUMN assists;
```

**Nota:** La posición se almacena como texto (ej: 'Delantero', 'Mediocampista', 'Defensa', 'Portero') en lugar de usar una tabla separada, ya que las posiciones son fijas y estáticas. Los campos goals y assists se eliminan para evitar desfasamiento, ya que los totales se calculan sumando los registros de PlayerStats.

### Triggers

#### 5. Trigger para Validación de Fechas

Validar que la fecha del partido esté dentro del rango de la temporada.

```sql
CREATE OR REPLACE FUNCTION validate_match_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Season 
        WHERE start_date <= NEW.match_date AND end_date >= NEW.match_date
    ) THEN
        RAISE EXCEPTION 'La fecha del partido debe estar dentro del rango de la temporada';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_match_date
BEFORE INSERT OR UPDATE ON Match
FOR EACH ROW EXECUTE FUNCTION validate_match_date();
```

### Queries de Reportes (por Temporada)

**Nota:** Todos los reportes a continuación requieren un parámetro de season_id para filtrar por temporada específica, ya que las estadísticas, posiciones y mejores jugadores pueden cambiar entre temporadas.

### Reporte 1: Tabla de Posiciones de la Liga

**Descripción:** Muestra el listado de equipos ordenados por puntos acumulados en una temporada específica.

**Lógica de puntos:**
- Victoria: 3 puntos
- Empate: 1 punto
- Derrota: 0 puntos

**Query SQL:**

```sql
SELECT
    t.name,
    t.id,
    COALESCE(SUM(
        CASE
            WHEN m.home_team_id = t.id AND m.home_goals > m.away_goals THEN 3
            WHEN m.away_team_id = t.id AND m.away_goals > m.home_goals THEN 3
            WHEN m.home_goals = m.away_goals THEN 1
            ELSE 0
        END
    ), 0) as points
FROM Team t
LEFT JOIN Match m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.season_id = $1
GROUP BY t.id, t.name
ORDER BY points DESC, t.name;
```

**Explicación:**
- $1 es el ID de la temporada a consultar
- Se une la tabla Team con Match (LEFT JOIN para incluir equipos sin partidos)
- Se filtra por season_id para obtener solo partidos de esa temporada
- Se usa un CASE para calcular puntos según el resultado
- Si el equipo es local y ganó: 3 puntos
- Si el equipo es visitante y ganó: 3 puntos
- Si hubo empate: 1 punto para ambos
- Se agrupa por equipo y se suma los puntos
- Se ordena descendentemente por puntos

---

### Reporte 2: Partidos por Equipos

**Descripción:** Dados dos equipos, muestra los partidos que involucran a esos equipos con goles y asistentes. Opcionalmente puede filtrarse por temporada.

**Query SQL:**

```sql
SELECT
    m.match_date,
    s.name as stadium,
    ht.name as home_team,
    m.home_goals,
    at.name as away_team,
    m.away_goals
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
WHERE (m.home_team_id = $1 OR m.away_team_id = $1)
  AND (m.home_team_id = $2 OR m.away_team_id = $2)
  AND ($3 IS NULL OR m.season_id = $3)
ORDER BY m.match_date;
```

**Explicación:**
- $1 y $2 son los IDs de los dos equipos a buscar
- $3 es el ID de la temporada (opcional)
- La condición WHERE busca partidos donde cualquiera de los dos equipos participe (como local o visitante)
- Si $3 es NULL, muestra partidos de todas las temporadas
- Si $3 tiene valor, filtra solo por esa temporada específica
- Se une con Team y Stadium para mostrar nombres completos
- Se ordena por fecha

**Nota sobre goleadores y asistentes:** Los campos goals y assists se eliminaron de Player para evitar desfasamiento. Para obtener goles y asistencias totales de un jugador, se deben sumar los registros de PlayerStats. Para obtener goles y asistencias por partido específico, se consulta directamente PlayerStats filtrando por match_id.

---

### Reporte 3: Partidos Jugados por Fecha

**Descripción:** Dada una fecha y opcionalmente un estadio, muestra los partidos realizados.

**Query SQL:**

```sql
SELECT 
    m.match_date,
    s.name as stadium,
    ht.name as home_team,
    m.home_goals,
    at.name as away_team,
    m.away_goals
FROM Match m
JOIN Team ht ON m.home_team_id = ht.id
JOIN Team at ON m.away_team_id = at.id
JOIN Stadium s ON m.stadium_id = s.id
WHERE m.match_date = $1
  AND ($2 IS NULL OR m.stadium_id = $2);
```

**Explicación:**
- $1 es la fecha a buscar
- $2 es el ID del estadio (opcional)
- Si $2 es NULL, muestra todos los partidos de esa fecha
- Si $2 tiene valor, filtra solo por ese estadio específico

---

### Reporte 4: Entrenadores con Más Experiencia

**Descripción:** Lista entrenadores ordenados por campeonatos ganados, incluyendo nombre, número, años de experiencia y equipo.

**Query SQL:**

```sql
SELECT
    f.name,
    f.number,
    c.experience_years,
    t.name as team_name,
    c.championships_won
FROM Footballer f
JOIN Coach c ON f.id = c.footballer_id
JOIN Team t ON f.team_id = t.id
ORDER BY c.championships_won DESC, c.experience_years DESC;
```

**Explicación:**
- Se une Footballer con Coach para obtener datos del entrenador
- Se une con Team para obtener el equipo actual
- Se ordena primero por campeonatos ganados (descendente)
- Si hay empate en campeonatos, se ordena por años de experiencia

**Importante:** Se usa `c.championships_won` (campeonatos del entrenador) en lugar de `t.championships_won` (campeonatos del equipo), ya que un entrenador puede haber ganado campeonatos en diferentes equipos a lo largo de su carrera.

---

### Reporte 5: Estadios con Mayor Audiencia

**Descripción:** Lista estadios ordenados por porcentaje de audiencia en una temporada específica.

**Fórmula del porcentaje:**
```
porcentaje = (audiencia_total_real / (cantidad_partidos × capacidad_máxima)) × 100
```

**Query SQL:**

```sql
SELECT
    s.name,
    s.capacity,
    COALESCE(SUM(m.attendance), 0) as total_attendance,
    COUNT(m.id) as total_matches,
    CASE
        WHEN s.capacity > 0 AND COUNT(m.id) > 0
        THEN ROUND((COALESCE(SUM(m.attendance), 0)::DECIMAL / (COUNT(m.id) * s.capacity)::DECIMAL) * 100, 2)
        ELSE 0
    END as attendance_percentage
FROM Stadium s
LEFT JOIN Match m ON s.id = m.stadium_id AND m.season_id = $1
GROUP BY s.id, s.name, s.capacity
ORDER BY attendance_percentage DESC;
```

**Explicación:**
- $1 es el ID de la temporada a consultar
- `total_attendance`: Suma de todos los espectadores que asistieron a partidos en ese estadio durante esa temporada
- `total_matches`: Cantidad de partidos jugados en ese estadio durante esa temporada
- `attendance_percentage`: Porcentaje calculado con la fórmula especificada
- Se filtra por season_id para obtener solo partidos de esa temporada
- Se usa LEFT JOIN para incluir estadios sin partidos
- Se usa COALESCE para manejar valores NULL
- Se ordena por porcentaje descendente

---

### Reporte 6: Estado de un Equipo

**Descripción:** Dado un equipo, muestra cantidad de juegos ganados, empatados y perdidos (total, como local, como visitante) en una temporada específica.

**Query SQL:**

```sql
SELECT
    t.name,
    COUNT(CASE WHEN m.home_team_id = t.id AND m.home_goals > m.away_goals THEN 1 END) as home_wins,
    COUNT(CASE WHEN m.home_team_id = t.id AND m.home_goals = m.away_goals THEN 1 END) as home_draws,
    COUNT(CASE WHEN m.home_team_id = t.id AND m.home_goals < m.away_goals THEN 1 END) as home_losses,
    COUNT(CASE WHEN m.away_team_id = t.id AND m.away_goals > m.home_goals THEN 1 END) as away_wins,
    COUNT(CASE WHEN m.away_team_id = t.id AND m.away_goals = m.home_goals THEN 1 END) as away_draws,
    COUNT(CASE WHEN m.away_team_id = t.id AND m.away_goals < m.home_goals THEN 1 END) as away_losses,
    COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_goals > m.away_goals) OR (m.away_team_id = t.id AND m.away_goals > m.home_goals) THEN 1 END) as total_wins,
    COUNT(CASE WHEN m.home_goals = m.away_goals AND (m.home_team_id = t.id OR m.away_team_id = t.id) THEN 1 END) as total_draws,
    COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_goals < m.away_goals) OR (m.away_team_id = t.id AND m.away_goals < m.home_goals) THEN 1 END) as total_losses
FROM Team t
LEFT JOIN Match m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.season_id = $2
WHERE t.id = $1
GROUP BY t.id, t.name;
```

**Explicación:**
- $1 es el ID del equipo a consultar
- $2 es el ID de la temporada a consultar
- `home_wins/draws/losses`: Estadísticas como local
- `away_wins/draws/losses`: Estadísticas como visitante
- `total_wins/draws/losses`: Estadísticas totales (local + visitante)
- Se filtra por season_id para obtener solo partidos de esa temporada
- Se usan COUNT con CASE para contar cada condición específica
- LEFT JOIN para incluir equipos sin partidos

---

### Reporte 7: Equipo Todo Estrellas

**Descripción:** Muestra el mejor jugador de cada posición según sus estadísticas específicas sumadas de todos los partidos en una temporada específica.

**Lógica de selección:**
- **Delantero:** Mejor por suma de tiros a puerta (estadística prioritaria). Otras estadísticas se usan solo para desempate.
- **Mediocampista:** Mejor por suma de (pases completados + intercepciones) (estadística prioritaria). Otras estadísticas se usan solo para desempate.
- **Defensa:** Mejor por suma de (entradas + bloqueos) (estadística prioritaria). Otras estadísticas se usan solo para desempate.
- **Portero:** Mejor por suma de (paradas - goles encajados) (estadística prioritaria). Otras estadísticas se usan solo para desempate.

**Nota:** La estadística prioritaria define la selección del jugador. Las demás estadísticas en PlayerStats se usarían únicamente como criterio de desempate si dos jugadores tienen el mismo valor en la estadística prioritaria. Como las estadísticas son por partido, se deben sumar/agrupar por jugador para obtener el total. Los mejores jugadores pueden cambiar entre temporadas, por lo que este reporte debe filtrarse por temporada.

**Query SQL:**

```sql
-- Delantero (mejor por suma de tiros a puerta)
SELECT 'Delantero' as position, f.name, t.name as team, SUM(ps.shots_on_goal) as stat_value
FROM Footballer f
JOIN Player p ON f.id = p.footballer_id
JOIN PlayerStats ps ON p.footballer_id = ps.player_id
JOIN Match m ON ps.match_id = m.id
JOIN Team t ON f.team_id = t.id
WHERE p.position = 'Delantero' AND m.season_id = $1
GROUP BY f.id, f.name, t.id, t.name
ORDER BY SUM(ps.shots_on_goal) DESC
LIMIT 1

UNION ALL

-- Mediocampista (mejor por suma de pases completados + intercepciones)
SELECT 'Mediocampista', f.name, t.name, SUM(ps.passes_completed + ps.interceptions)
FROM Footballer f
JOIN Player p ON f.id = p.footballer_id
JOIN PlayerStats ps ON p.footballer_id = ps.player_id
JOIN Match m ON ps.match_id = m.id
JOIN Team t ON f.team_id = t.id
WHERE p.position = 'Mediocampista' AND m.season_id = $1
GROUP BY f.id, f.name, t.id, t.name
ORDER BY SUM(ps.passes_completed + ps.interceptions) DESC
LIMIT 1

UNION ALL

-- Defensa (mejor por suma de entradas + bloqueos)
SELECT 'Defensa', f.name, t.name, SUM(ps.tackles + ps.blocks)
FROM Footballer f
JOIN Player p ON f.id = p.footballer_id
JOIN PlayerStats ps ON p.footballer_id = ps.player_id
JOIN Match m ON ps.match_id = m.id
JOIN Team t ON f.team_id = t.id
WHERE p.position = 'Defensa' AND m.season_id = $1
GROUP BY f.id, f.name, t.id, t.name
ORDER BY SUM(ps.tackles + ps.blocks) DESC
LIMIT 1

UNION ALL

-- Portero (mejor por suma de paradas - goles encajados)
SELECT 'Portero', f.name, t.name, SUM(ps.saves - ps.goals_conceded)
FROM Footballer f
JOIN Player p ON f.id = p.footballer_id
JOIN PlayerStats ps ON p.footballer_id = ps.player_id
JOIN Match m ON ps.match_id = m.id
JOIN Team t ON f.team_id = t.id
WHERE p.position = 'Portero' AND m.season_id = $1
GROUP BY f.id, f.name, t.id, t.name
ORDER BY SUM(ps.saves - ps.goals_conceded) DESC
LIMIT 1;
```

**Explicación:**
- $1 es el ID de la temporada a consultar
- Se usa UNION ALL para combinar los resultados de las 4 consultas
- Cada consulta selecciona el mejor jugador de una posición específica
- Se une con Match para filtrar por season_id
- Se usa GROUP BY para sumar las estadísticas de todos los partidos del jugador en esa temporada
- Se filtra por el campo `position` (texto) en lugar de usar la tabla Position
- Se ordena por la suma de la métrica relevante y se toma solo el primero (LIMIT 1)
- El resultado incluye: posición, nombre del jugador, equipo y valor total de la estadística

## CAMBIOS EN LA API

### Nuevos Endpoints Requeridos

**CRUD de Match:**
- `POST /api/matches` - Crear partido
- `GET /api/matches` - Listar partidos
- `GET /api/matches/:id` - Obtener partido
- `PUT /api/matches/:id` - Actualizar partido
- `DELETE /api/matches/:id` - Eliminar partido

**Reportes (todos requieren parámetro season_id):**
- `GET /api/reports/standings?seasonId=X` - Tabla de posiciones por temporada
- `GET /api/reports/matches-between-teams?team1=X&team2=Y&seasonId=Z` - Partidos entre equipos (seasonId opcional)
- `GET /api/reports/matches-by-date?date=X&stadium=Y` - Partidos por fecha
- `GET /api/reports/coaches-by-experience` - Entrenadores por experiencia (no filtra por temporada)
- `GET /api/reports/stadiums-by-attendance?seasonId=X` - Estadios por audiencia por temporada
- `GET /api/reports/team-status/:teamId?seasonId=Y` - Estado del equipo por temporada
- `GET /api/reports/all-star-team?seasonId=X` - Equipo todo estrellas por temporada

**Modificaciones a Endpoints Existentes:**
- `POST /api/players` - Incluir campo de posición (texto) y estadísticas generales
- `PUT /api/players/:id` - Actualizar campo de posición y estadísticas generales

### Mejoras a Endpoints CRUD Existentes (Filtrado Opcional)

Se recomienda agregar parámetros opcionales de filtrado y paginación a los endpoints de listado existentes para mejorar la experiencia de uso:

**Endpoints de Listado con Parámetros Opcionales:**

- `GET /api/teams?province=X&championships_won_min=Y&limit=Z&offset=W`
  - `province`: Filtrar por provincia (opcional)
  - `championships_won_min`: Filtrar por campeonatos ganados mínimos (opcional)
  - `limit`: Límite de resultados para paginación (opcional, default: 50)
  - `offset`: Desplazamiento para paginación (opcional, default: 0)
  - `order_by`: Campo de ordenamiento (opcional, default: id)
  - `sort`: Dirección de ordenamiento (asc/desc, opcional, default: asc)

- `GET /api/stadiums?capacity_min=X&capacity_max=Y&limit=Z&offset=W`
  - `capacity_min`: Capacidad mínima (opcional)
  - `capacity_max`: Capacidad máxima (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

- `GET /api/seasons?start_date_after=X&end_date_before=Y&limit=Z&offset=W`
  - `start_date_after`: Temporadas que comienzan después de esta fecha (opcional)
  - `end_date_before`: Temporadas que terminan antes de esta fecha (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

- `GET /api/players?team_id=X&position=Y&limit=Z&offset=W`
  - `team_id`: Filtrar por equipo (opcional)
  - `position`: Filtrar por posición (Delantero, Mediocampista, Defensa, Portero) (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

- `GET /api/coaches?team_id=X&experience_years_min=Y&championships_won_min=Z&limit=A&offset=B`
  - `team_id`: Filtrar por equipo (opcional)
  - `experience_years_min`: Años de experiencia mínimos (opcional)
  - `championships_won_min`: Campeonatos ganados mínimos (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

- `GET /api/matches?season_id=X&team_id=Y&stadium_id=Z&date_from=A&date_to=B&limit=C&offset=D`
  - `season_id`: Filtrar por temporada (opcional)
  - `team_id`: Filtrar por equipo (partidos donde participa como local o visitante) (opcional)
  - `stadium_id`: Filtrar por estadio (opcional)
  - `date_from`: Partidos desde esta fecha (opcional)
  - `date_to`: Partidos hasta esta fecha (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

- `GET /api/player-stats?player_id=X&match_id=Y&season_id=Z&limit=A&offset=B`
  - `player_id`: Filtrar por jugador (opcional)
  - `match_id`: Filtrar por partido (opcional)
  - `season_id`: Filtrar por temporada (a través de Match) (opcional)
  - `limit`, `offset`, `order_by`, `sort`: Igual que arriba

**Nota:** Todos estos parámetros son opcionales. Si no se proporcionan, el endpoint retorna todos los resultados (con paginación default). Esto permite flexibilidad para diferentes casos de uso sin necesidad de crear múltiples endpoints específicos.

## Orden de Implementación Sugerido

- [ ] Crear migration para nueva tabla Match (requerida por PlayerStats)
- [ ] Crear migration para modificar Coach (agregar championships_won)
- [ ] Crear migration para modificar Player (agregar position como texto, average_goals_per_match, y eliminar goals y assists)
- [ ] Crear migration para tabla PlayerStats (estadísticas por partido con match_id)
- [ ] Crear trigger de validación de fechas
- [ ] Actualizar queries.sql con los 7 reportes (con filtros por temporada)
- [ ] Regenerar código Go con sqlc
- [ ] Crear handlers y services para Match
- [ ] Crear handlers y services para PlayerStats
- [ ] Crear handlers y services para los reportes
- [ ] Actualizar handlers de Player para incluir posición y estadísticas generales
- [ ] Implementar parámetros de filtrado opcionales en endpoints CRUD existentes
- [ ] Actualizar frontend para consumir nuevos endpoints
