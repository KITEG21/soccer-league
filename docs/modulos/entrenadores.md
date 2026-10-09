# Entrenadores

`/coaches` mantiene el personal técnico asociado a los equipos. Un entrenador comparte identidad, dorsal y antigüedad mediante Footballer y añade Coach.

## Datos y operaciones

| Campo | Descripción |
| --- | --- |
| `team_id`, `team_name` | Equipo actual e identificación en listados |
| `name`, `number`, `years_in_team` | Identidad común del futbolista |
| `experience_years` | Años de experiencia profesional |
| `championships_won` | Campeonatos ganados por el entrenador, dato manual |

El módulo admite alta, edición y baja. No existe historial de cambios de equipo ni vinculación a un acta de partido. El reporte de entrenadores consulta estos datos directamente.

## Reglas

- Experiencia mayor o igual que antigüedad en el equipo.
- Dorsal único entre todos los futbolistas del equipo.
- Valores no negativos en el formulario.
- Lectura con `coaches:read`; mantenimiento con `coaches:write`.

La experiencia no se incrementa automáticamente con el tiempo. Los campeonatos ganados tampoco se calculan a partir de temporadas.

## Consulta y reporte

El listado busca nombre o equipo y filtra por equipo, rangos de experiencia, antigüedad y campeonatos. El informe llamado «entrenadores con más experiencia» ordena primero por campeonatos ganados, después por experiencia y después por nombre.

## Código y datos

Frontend: `Web/src/features/coaches/`. Backend: métodos de entrenador en `Api/internal/service/player.go` y `handler/player.go`. Tablas: Footballer y Coach. La ausencia de un paquete Go `coach` es una organización compartida, no un módulo funcional ausente.
