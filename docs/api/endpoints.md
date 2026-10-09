# Inventario de endpoints

Las rutas corresponden a `Api/cmd/api/main.go`. `{id}` y `{teamId}` son identificadores numéricos. Todas las rutas deportivas y de usuarios requieren JWT y permisos.

## Sesión y documentación pública

| Método | Ruta | Entrada | Respuesta correcta |
| --- | --- | --- | --- |
| POST | `/auth/login` | `email`, `password` | 200: tokens, correo, rol y permisos |
| POST | `/auth/refresh` | `refresh_token` | 200: nuevo par de tokens y sesión |
| POST | `/auth/logout` | `refresh_token` | 204 |
| GET | `/docs` | Ninguna | 200: interfaz Scalar |
| GET | `/openapi.json` | Ninguna | 200: OpenAPI escrito en el handler |

El par de tokens contiene `access_token`, `refresh_token`, `email`, `role` y `permissions`. No incluye un campo `expires_in`; los plazos están definidos en el servicio.

## Recursos de mantenimiento

Cada fila de la siguiente tabla representa cinco rutas: GET y POST sobre la colección, y GET, PUT y DELETE sobre el detalle.

| Recurso | Colección | Detalle | Permiso de lectura / escritura |
| --- | --- | --- | --- |
| Equipos | `/teams/` | `/teams/{id}` | `teams:read` / `teams:write` |
| Estadios | `/stadiums/` | `/stadiums/{id}` | `stadiums:read` / `stadiums:write` |
| Temporadas | `/seasons/` | `/seasons/{id}` | `seasons:read` / `seasons:write` |
| Jugadores | `/players/` | `/players/{id}` | `players:read` / `players:write` |
| Entrenadores | `/coaches/` | `/coaches/{id}` | `coaches:read` / `coaches:write` |
| Partidos | `/matches/` | `/matches/{id}` | `matches:read` / `matches:write` |
| Estadísticas | `/player-stats/` | `/player-stats/{id}` | `player-stats:read` / `player-stats:write` |
| Usuarios | `/users/` | `/users/{id}` | `users:read` / `users:write` |

### Respuestas de mantenimiento

| Recurso | GET colección | POST | GET detalle | PUT | DELETE |
| --- | --- | --- | --- | --- | --- |
| Equipo | 200: paginado | 201: objeto | 200: objeto | 200: objeto | 204 |
| Estadio | 200: paginado | 201: objeto | 200: objeto | 200: objeto | 204 |
| Temporada | 200: array | 201: objeto | 200: objeto | 200: objeto | 204 |
| Jugador | 200: paginado | 201: `{ "id": 10 }` | 200: objeto | 204 | 204 |
| Entrenador | 200: paginado | 201: `{ "id": 10 }` | 200: objeto | 204 | 204 |
| Partido | 200: paginado | 201: objeto | 200: objeto | 200: objeto | 204 |
| Estadística | 200: array o null | 201: objeto | 200: objeto | 204 | 204 |
| Usuario | 200: paginado | 201: objeto sin hash | 200: objeto sin hash | 200: objeto; solo cambia rol | 204 |

Las estadísticas admiten `match_id` para obtener todas las filas de un encuentro; sin él admiten paginación simple. Otros listados admiten los filtros de la [referencia](./filtros.md).

## Reportes JSON

Todas estas rutas requieren `reports:read` y responden 200 cuando la consulta se resuelve.

| Ruta GET | Parámetros requeridos | Opcionales | Respuesta |
| --- | --- | --- | --- |
| `/reports/standings` | `seasonId` | — | Array de equipos y puntos |
| `/reports/matches-between-teams` | `team1`, `team2` | `seasonId` | Array de encuentros con goles y asistencias |
| `/reports/matches-by-date` | `date` | `stadiumId`; alias `stadium` | Array de encuentros de la fecha |
| `/reports/coaches-by-experience` | Ninguno | — | Array de entrenadores |
| `/reports/stadiums-by-attendance` | `seasonId` | — | Array de estadios y audiencia |
| `/reports/team-status/{teamId}` | `teamId` en ruta, `seasonId` en consulta | — | Objeto de victorias, empates y derrotas |
| `/reports/all-star-team` | `seasonId` | — | Array de jugadores y métricas |

En algunos reportes sin filas, el servicio serializa `null` en lugar de `[]`; véase el contrato de respuestas vacías. Los IDs se parsean como enteros; el parseo por sí mismo no verifica la existencia de la entidad. Una temporada sin coincidencias puede devolver resultados de cero o vacíos según la consulta. El formato deportivo de fecha es `YYYY-MM-DD`.

## Exportación PDF

`GET /reports/pdf/{report}` requiere `reports:read`. Los valores de `{report}` son:

| Valor | Parámetros |
| --- | --- |
| `standings` | `seasonId` |
| `matches-between-teams` | `team1`, `team2`, `seasonId` opcional |
| `matches-by-date` | `date`, `stadiumId` opcional |
| `coaches-by-experience` | Ninguno |
| `stadiums-by-attendance` | `seasonId` |
| `team-status` | `teamId`, `seasonId`, ambos en consulta |
| `all-star-team` | `seasonId` |

Todos admiten `lang=es` o `lang=en`. Un valor explícito desconocido usa español; sin parámetro, Go revisa Accept-Language y finalmente usa español. La UI envía lang explícitamente. Un nombre de reporte desconocido devuelve 404. La respuesta correcta es un PDF inline con 200, no JSON.

## Proxy de Next.js

La aplicación usa `/api/backend/{ruta}` conservando ruta y consulta. Su Route Handler transporta GET, POST, PUT, PATCH y DELETE, reenvía autorización y trata PDF como bytes. Solo están disponibles las operaciones que Go registre efectivamente; PATCH no tiene un endpoint de dominio correspondiente.
