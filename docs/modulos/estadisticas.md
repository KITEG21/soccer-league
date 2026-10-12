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
| `blocks` | Bloqueos | Defensa; control visible |
| `saves` | Paradas | Portero; control visible |
| `goals_conceded` | Goles encajados | Portero; control visible |

La fila incluye `id`, `player_id`, `match_id` y `team_id`. El equipo se asigna al registrar la participación y se conserva en las correcciones. El diálogo y la tabla muestran las nueve métricas, con etiquetas en español e inglés.

## Captura y corrección

1. Abrir un partido disputado.
2. Elegir un jugador de los equipos participantes actuales.
3. Introducir los valores y guardar.
4. Editar la misma fila para corregirla o confirmar su eliminación.

Solo puede haber una fila por jugador y partido. La captura requiere `player-stats:write`; la lectura requiere `player-stats:read`. El backend y un trigger comprueban que el partido esté disputado.

## Efecto en otros módulos

El marcador, los enfrentamientos, la clasificación y el equipo de estrellas se basan en estas filas. Modificar o borrar goles altera resultados derivados. El detalle invalida sus consultas de estadísticas y partido tras una mutación.

El trigger comprueba que el jugador pertenezca a uno de los equipos del encuentro al registrar una participación. Las correcciones conservan el jugador, el partido y el equipo original, incluso después de una transferencia. La tabla utiliza el equipo registrado para mostrar su afiliación histórica. El formulario utiliza controles numéricos con mínimo cero.

## Contrato de listado

`GET /player-stats/?match_id=42` devuelve las filas del partido sin paginación. Sin `match_id`, admite `limit` y `offset` y devuelve un array, sin `total`. Las consultas vacías de estadísticas devuelven un array vacío.

## Código y datos

`Web/src/features/matches/services/playerStatsApi.ts`, `types/playerStats.ts`, `containers/MatchDetailContainer.tsx`; `Api/internal/service/player_stats.go`, `handler/player_stats.go`, tabla PlayerStats y migraciones `000003`, `000005` y `000009`.
