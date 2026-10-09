# Búsqueda, filtros y paginación

## Parámetros comunes

| Parámetro | Significado | Comportamiento |
| --- | --- | --- |
| `limit` | Tamaño de página | Predeterminado 20; máximo efectivo 100 |
| `offset` | Registros que saltar | Predeterminado 0; negativo se normaliza a 0 |
| `sort` | Campo de ordenación | Debe pertenecer al recurso |
| `order` | `asc` o `desc` | Ascendente cuando no se especifica dirección |
| `q` | Búsqueda textual | Subcadena, sin distinción de mayúsculas ni acentos |

Los filtros se combinan con AND. La búsqueda actúa con OR sobre los campos de texto de ese recurso. Los rangos mínimo/máximo y desde/hasta son inclusivos. Los filtros vacíos se omiten si son conocidos.

Un parámetro distinto de los cinco comunes se considera filtro. Un filtro desconocido, orden inválido o valor malformado devuelve 400 con errores por campo. No enviar parámetros de seguimiento o filtros inventados en estas rutas.

## Campos por recurso

| Recurso | Búsqueda `q` | Campos `sort` |
| --- | --- | --- |
| Equipos | Nombre, provincia, mascota | `name`, `province`, `mascot`, `championships_played`, `championships_won`, `players_count`, `coaches_count` |
| Estadios | Nombre | `name`, `capacity` |
| Temporadas | Sin búsqueda textual | `title`, `start_date`, `end_date` |
| Jugadores | Nombre, posición, equipo | `name`, `number`, `years_in_team`, `position`, `team_name` |
| Entrenadores | Nombre, equipo | `name`, `number`, `years_in_team`, `experience_years`, `championships_won`, `team_name` |
| Partidos | Nombres de local, visitante y estadio | `match_date`, `attendance`, `home_goals`, `away_goals`, `disputed`, `home_team_name`, `away_team_name`, `stadium_name`, `result` |
| Usuarios | Correo | `email`, `role`, `created_at` |

`title` de temporada compara la fecha inicial. `result` compara diferencia de goles y después goles del local; no es un filtro semántico de ganado/empatado/perdido. Sin campo sort, se conserva el orden de la consulta de origen.

## Filtros disponibles

| Recurso | Parámetros |
| --- | --- |
| Equipos | `province`, `championships_played_min`, `championships_played_max`, `championships_won_min`, `championships_won_max` |
| Estadios | `capacity_min`, `capacity_max` |
| Temporadas | `start_date_from`, `start_date_to`, `end_date_from`, `end_date_to` |
| Jugadores | `team_id`, `position`, `number`, `years_in_team_min`, `years_in_team_max` |
| Entrenadores | `team_id`, `experience_years_min`, `experience_years_max`, `championships_won_min`, `championships_won_max`, `years_in_team_min`, `years_in_team_max` |
| Partidos | `season_id`, `team_id`, `home_team_id`, `away_team_id`, `stadium_id`, `disputed`, `date_from`, `date_to`, `attendance_min`, `attendance_max` |
| Usuarios | `role` |

`province` busca una subcadena normalizada. `team_id` en partidos coincide con local o visitante. `position` y `role` admiten valores separados por comas; el criterio es pertenecer a cualquiera de los valores normalizados. Las fechas usan `YYYY-MM-DD`.

## Ejemplos

```text
/players/?limit=20&offset=0&sort=name&order=asc&team_id=1&position=Defensa,Portero
/matches/?season_id=1&disputed=false&date_from=2026-01-01&date_to=2026-12-31
/teams/?q=habana&championships_won_min=1&sort=players_count&order=desc
/users/?role=admin,visitante&sort=created_at&order=desc
```

En una URL real se deben codificar los valores con un constructor de parámetros, especialmente espacios y acentos.

## Implementación y alcance

`handler/pagination.go` interpreta la consulta; `service/list_specs.go` define criterios por recurso; `service/list_query.go` busca, filtra y ordena; `helpers.go` recorta la página. Las consultas principales cargan el conjunto y realizan estas operaciones en memoria.

Estadísticas no usa esta especificación: admite `match_id` o limit/offset. Los reportes tienen parámetros propios y no heredan `q`, `sort` o estos filtros. Temporadas usa la especificación pero devuelve array sin total.
