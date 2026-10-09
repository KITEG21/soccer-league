# Estadios

`/stadiums` mantiene las sedes de los encuentros. Cada estadio contiene `id`, `name` y `capacity`.

## Operaciones y reglas

El mantenimiento admite alta, edición y baja con `stadiums:write`; la consulta requiere `stadiums:read`. El formulario exige nombre y limita capacidad a un entero no negativo cuando se introduce.

PostgreSQL aplica UNIQUE al nombre dentro de Stadium. Además, el servicio compara con equipos eliminando espacios exteriores y convirtiendo a minúsculas; esa comparación cruzada no es una restricción SQL.

La baja está bloqueada cuando el estadio está utilizado en algún partido. La FK de Match también aplica RESTRICT.

## Consulta y audiencia

El listado busca por nombre, filtra capacidad mínima/máxima y ordena por nombre o capacidad. El módulo de partidos usa la sede para programar encuentros; el reporte de audiencia combina capacidad con asistencia y cantidad de partidos de una temporada.

Una capacidad nula o cero produce porcentaje cero en el reporte. No hay una restricción que limite asistencia a capacidad. Modificar la capacidad cambia el cálculo de audiencia de las temporadas anteriores, porque no se almacena la capacidad histórica del encuentro.

## Código y datos

`Web/src/features/stadiums/`, `Api/internal/service/stadium.go`, `handler/stadium.go`, tabla Stadium. Fórmula de ocupación en [reportes](../reportes-explicacion.md).
