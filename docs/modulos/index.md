# Módulos funcionales

Cada módulo se documenta mediante su propósito, pantallas, datos, operaciones, reglas y ubicación en el código. Los permisos efectivos se detallan en [seguridad](../arquitectura/seguridad.md).

| Módulo | Pantallas | Recurso API | Dependencias de negocio |
| --- | --- | --- | --- |
| [Acceso](./autenticacion.md) | `/login`, `/forbidden` | `/auth` | Usuarios |
| [Panel y navegación](./panel.md) | `/` y layout común | Varios | Catálogos, temporadas, partidos y reportes |
| [Usuarios](./usuarios.md) | `/users` | `/users/` | Autenticación y roles |
| [Equipos](./equipos.md) | `/teams`, `/teams/{id}` | `/teams/` | Jugadores, entrenadores y partidos |
| [Jugadores](./jugadores.md) | `/players` | `/players/` | Equipos y estadísticas |
| [Entrenadores](./entrenadores.md) | `/coaches` | `/coaches/` | Equipos |
| [Estadios](./estadios.md) | `/stadiums` | `/stadiums/` | Partidos y audiencia |
| [Temporadas](./temporadas.md) | `/seasons` | `/seasons/` | Partidos y reportes |
| [Partidos](./partidos.md) | `/matches`, `/matches/{id}` | `/matches/` | Equipos, estadios y temporadas |
| [Estadísticas](./estadisticas.md) | Detalle de partido | `/player-stats/` | Jugadores y partido disputado |
| [Reportes](./reportes.md) | `/reports/*` | `/reports/*` | Todas las entidades deportivas |

## Patrón de mantenimiento

Los módulos de catálogo reúnen listado, filtros, alta, edición y confirmación de baja. Un usuario de consulta conserva listados y detalles pero no ve las acciones de escritura. El contenedor coordina las consultas y mutaciones; el formulario valida; el servicio de frontend traduce la operación a HTTP.

Los listados principales soportan búsqueda, ordenación y filtros definidos por recurso. Temporadas y estadísticas presentan contratos de listado diferentes, descritos en [API](../api/contratos.md).

## Dependencias compartidas

La selección de equipos aparece en jugadores, entrenadores, partidos y reportes. La selección de temporadas aparece en partidos y reportes. Los identificadores son globales por entidad; las rutas de detalle usan ID numérico.

No existen pantallas independientes de detalle para jugador, entrenador, estadio o temporada: su mantenimiento se realiza en los listados. El detalle de equipo agrupa su plantilla; el de partido agrupa marcador y estadísticas.
