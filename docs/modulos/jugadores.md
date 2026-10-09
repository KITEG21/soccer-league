# Jugadores

## Propósito

`/players` mantiene la plantilla deportiva. Cada jugador tiene un registro Footballer para la identidad compartida y otro Player para su posición. Su ID público es el ID de Footballer.

| Campo | Descripción |
| --- | --- |
| `team_id` | Equipo actual |
| `name` | Nombre del futbolista |
| `number` | Dorsal compartido con jugadores y entrenadores del equipo |
| `years_in_team` | Antigüedad declarada |
| `position` | Posición principal |
| `team_name` | Nombre de equipo enriquecido en respuestas de listado |

La UI usa `Portero`, `Defensa`, `Mediocampo` y `Delantero`. La API almacena posición como texto; los reportes de estrellas comparan esas cadenas exactas en español.

## Operaciones

La alta inserta Footballer y Player. La edición cambia identidad, equipo y posición. La eliminación retira Player y Footballer; PlayerStats se elimina por cascada al borrar Player.

No hay pantalla individual de perfil ni edición de goles acumulados en el formulario del jugador. El rendimiento se registra por partido en [estadísticas](./estadisticas.md).

## Reglas y efectos

El dorsal no puede repetirse dentro del equipo, incluso si pertenece a un entrenador. Al cambiar de equipo se comprueba la disponibilidad en el destino. El formulario valida nombre y valores no negativos.

Una transferencia cambia la afiliación actual y puede afectar el reparto de goles de partidos anteriores. La eliminación elimina la historia estadística del jugador y puede alterar marcadores y reportes. No se guarda una afiliación por temporada ni se da de baja lógica al jugador.

## Consulta y permisos

`players:read` permite el listado; `players:write` habilita mantenimiento. Búsqueda por nombre, posición o equipo. Filtros de equipo, una o varias posiciones, dorsal y rango de antigüedad.

## Código y datos

`Web/src/features/players/`, `Api/internal/service/player.go`, `Api/internal/handler/player.go`; Footballer, Player y PlayerStats. La creación utiliza una CTE SQL; la actualización combina sentencias independientes.
