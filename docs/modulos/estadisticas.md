# Estadísticas por partido

Las estadísticas viven en el detalle del partido. La API tiene un recurso independiente `/player-stats/`, mientras que el frontend lo organiza dentro de `features/matches/`.

## Métricas

| Campo JSON | Significado | Referencia deportiva / captura actual |
| --- | --- | --- |
| `goals_scored` | Goles marcados | Todas |
| `assists` | Asistencias de gol | Todas |
| `shots_on_goal` | Tiros a puerta | Delantero; control visible para cualquier jugador |
| `passes_completed` | Pases completados | Mediocampo; control visible para cualquier jugador |
| `interceptions` | Intercepciones | Mediocampo; control visible para cualquier jugador |
| `tackles` | Entradas | Defensa; control visible para cualquier jugador |
| `blocks` | Bloqueos | Defensa; sin control de captura en UI |
| `saves` | Paradas | Portero; sin control de captura en UI |
| `goals_conceded` | Goles encajados | Portero; sin control de captura en UI |

La fila incluye `id`, `player_id` y `match_id`. Todas las métricas están disponibles en el contrato y la tabla. El diálogo actual expone seis de las nueve, sin adaptar los controles a la posición. Las otras tres se conservan en el estado de edición, pero no pueden introducirse mediante un control visible.

## Captura y corrección

1. Abrir un partido disputado.
2. Elegir un jugador de los equipos participantes actuales.
3. Introducir los valores y guardar.
4. Editar la misma fila para corregirla o confirmar su eliminación.

Solo puede haber una fila por jugador y partido. La captura requiere `player-stats:write`; la lectura requiere `player-stats:read`. El backend y un trigger comprueban que el partido esté disputado.

## Efecto en otros módulos

El marcador, los enfrentamientos, la clasificación y el equipo de estrellas se basan en estas filas. Modificar o borrar goles altera resultados derivados. El detalle invalida sus consultas de estadísticas y partido tras una mutación.

El servicio no valida que el jugador pertenezca a los equipos del encuentro, ni aplica una comprobación general de métricas no negativas. La restricción visual de selección no sustituye esa validación en una petición directa.

## Contrato de listado

`GET /player-stats/?match_id=42` devuelve las filas del partido sin paginación. Sin `match_id`, admite `limit` y `offset` y devuelve un array, sin `total`. Algunas consultas vacías pueden producir `null` porque el servicio usa un slice no inicializado; no se garantiza uniformemente `[]`.

## Código y datos

`Web/src/features/matches/services/playerStatsApi.ts`, `types/playerStats.ts`, `containers/MatchDetailContainer.tsx`; `Api/internal/service/player_stats.go`, `handler/player_stats.go`, tabla PlayerStats y migraciones `000003` y `000005`.
