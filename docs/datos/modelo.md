# Modelo de datos

PostgreSQL almacena diez tablas de dominio y seguridad. El [diagrama de relaciones](../database-diagram.md) representa las referencias; el diccionario siguiente enumera los campos mantenidos en el esquema.

## Equipos, sedes y temporadas

| Tabla | Campos | Restricciones y valores |
| --- | --- | --- |
| Team | `id BIGSERIAL`, `name TEXT`, `province TEXT`, `mascot TEXT`, `color TEXT`, `championships_played INT`, `championships_won INT` | PK id; name NOT NULL y UNIQUE; resto nullable |
| Stadium | `id BIGSERIAL`, `name TEXT`, `capacity INT` | PK id; name NOT NULL y UNIQUE; capacity nullable |
| Season | `id BIGSERIAL`, `start_date DATE`, `end_date DATE` | PK id; fechas nullable en SQL |

No hay tabla de inscripción de equipos en temporadas ni estado de cierre. La clasificación consulta todos los equipos y enlaza sus encuentros de la temporada.

## Futbolistas y especializaciones

| Tabla | Campos | Restricciones |
| --- | --- | --- |
| Footballer | `id BIGSERIAL`, `team_id BIGINT`, `name TEXT`, `number INT`, `years_in_team INT` | PK id; FK a Team con SET NULL; name NOT NULL; UNIQUE equipo/dorsal |
| Player | `footballer_id BIGINT`, `position TEXT` | ID es PK y FK a Footballer con CASCADE; position NOT NULL |
| Coach | `footballer_id BIGINT`, `experience_years INT`, `championships_won INT` | ID es PK y FK a Footballer con CASCADE; campeonatos DEFAULT 0 |

Player y Coach reutilizan el identificador de Footballer. No hay tabla Position en el esquema vigente ni una restricción SQL que excluya ambas especializaciones.

## Partidos y rendimiento

| Tabla | Campos | Restricciones |
| --- | --- | --- |
| Match | `id BIGSERIAL`, `home_team_id BIGINT`, `away_team_id BIGINT`, `season_id BIGINT`, `stadium_id BIGINT`, `match_date DATE`, `attendance INT`, `disputed BOOLEAN` | PK id; cuatro FK con RESTRICT; fecha NOT NULL; asistencia DEFAULT 0; disputed NOT NULL DEFAULT false |
| PlayerStats | `id BIGSERIAL`, `player_id BIGINT`, `match_id BIGINT`, nueve métricas INT | PK id; FK a Player y Match con CASCADE; UNIQUE jugador/partido; métricas DEFAULT 0 |

Las métricas son `goals_scored`, `assists`, `shots_on_goal`, `passes_completed`, `interceptions`, `tackles`, `blocks`, `saves` y `goals_conceded`.

Las FK deportivas admiten SQL NULL salvo restricciones adicionales del trigger. El servicio suele insertar valores explícitos, por lo que omitir un ID en JSON no equivale a insertar NULL. Match tiene un CHECK de equipos distintos en las migraciones y triggers de fechas, estado y baja.

## Seguridad

| Tabla | Campos | Restricciones |
| --- | --- | --- |
| Users | `id BIGSERIAL`, `email TEXT`, `password_hash TEXT`, `role TEXT`, `created_at TIMESTAMPTZ` | PK; correo UNIQUE; datos NOT NULL; role CHECK; creación DEFAULT now() |
| RefreshToken | `id BIGSERIAL`, `user_id BIGINT`, `token_hash TEXT`, `expires_at TIMESTAMPTZ`, `rotated_at TIMESTAMPTZ`, `revoked_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ` | PK; FK usuario NOT NULL CASCADE; hash UNIQUE; expiración NOT NULL; fechas de rotación/revocación nullable |

La migración de seguridad añade un índice de `RefreshToken.user_id`. Los hashes de contraseña y renovación no se exponen en los DTO de usuarios.

## Datos derivados

No se almacenan `home_goals` ni `away_goals` en Match. Tampoco se mantienen contadores persistidos de jugadores/entrenadores en Team ni agregados de partidos/promedio en Player. Se calculan resultados al consultar o se agregan estadísticas en reportes.

Los nombres de entidades no se duplican en Match; se enriquecen al construir respuestas. Los cambios de nombre, capacidad, equipo o estadísticas afectan consultas históricas porque no hay instantáneas de esos valores.

## Esquema y migraciones

`Api/sql/schema.sql` describe tipos para sqlc. No contiene todas las reglas ejecutables presentes en las migraciones. Para preparar una base nueva se utiliza el arranque y las [migraciones](./migraciones.md), no solo ejecutar ese archivo.

Los nombres no entrecomillados en PostgreSQL se normalizan a minúsculas: `PlayerStats` se consulta como `playerstats`, `RefreshToken` como `refreshtoken`.
