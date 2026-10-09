# Equipos y plantillas

## Propósito y pantallas

`/teams` mantiene los equipos de la liga. `/teams/{id}` presenta información del equipo y sus jugadores y entrenadores. El color se utiliza como identificador visual en distintas vistas.

## Datos

| Campo | Descripción |
| --- | --- |
| `name` | Nombre del equipo |
| `province` | Provincia representada |
| `mascot` | Mascota |
| `color` | Color hexadecimal de seis dígitos en el formulario |
| `championships_played` | Campeonatos en los que participó, dato manual |
| `championships_won` | Campeonatos ganados, dato manual |
| `players_count`, `coaches_count` | Cantidades calculadas por el servicio |
| `players`, `coaches` | Plantilla incluida cuando el servicio construye el detalle |

Los contadores no son columnas mantenidas por triggers: las migraciones retiraron ese mecanismo. La API los obtiene de las relaciones actuales.

## Operaciones y reglas

Se permiten alta, edición y baja con `teams:write`; la consulta requiere `teams:read`. El formulario valida nombre, datos opcionales, color y contadores no negativos. No hay actualización automática de campeonatos desde la tabla de posiciones ni validación general de ganados ≤ jugados.

La restricción UNIQUE evita repetir exactamente un nombre dentro de Team. Además, el servicio compara el nombre con los estadios normalizando espacios exteriores y mayúsculas. No hay una restricción SQL compartida entre ambos catálogos; la comprobación cruzada reside en Go.

La baja se bloquea si hay futbolistas o partidos relacionados. Aunque la FK de Footballer admite SET NULL al borrar directamente Team, la operación de aplicación aplica una regla más restrictiva.

## Consulta

Búsqueda por nombre, provincia o mascota; filtro de provincia y rangos de campeonatos. Orden por esos datos y por número de jugadores o entrenadores. Las reglas completas aparecen en [filtros](../api/filtros.md).

## Código y relaciones

`Web/src/features/teams/`, `Api/internal/service/team.go`, `Api/internal/handler/team.go`, tabla Team. Jugadores y entrenadores se relacionan mediante Footballer; los partidos referencian Team como local o visitante.
