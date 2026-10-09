# Temporadas

`/seasons` administra intervalos temporales para los partidos. Una temporada contiene `id`, `start_date` y `end_date`. El título mostrado se construye desde sus fechas; no hay un campo de nombre persistido.

## Operaciones

| Operación | Condición |
| --- | --- |
| Crear | Fechas válidas en el formulario, inicio ≤ fin y sin solapamiento |
| Editar | Además, todos sus partidos deben permanecer dentro del nuevo intervalo |
| Eliminar | No debe existir ningún partido relacionado |
| Consultar | Permiso `seasons:read` |
| Mantener | Permiso `seasons:write` |

Los límites del intervalo son inclusivos. Si una temporada termina el mismo día en que empieza otra, el servicio considera que se solapan.

## Contrato y filtros

El listado acepta orden por `title` —alias de fecha inicial—, `start_date` y `end_date`, y filtros de límites de fechas. No tiene campos de búsqueda textual; `q` no aporta una búsqueda por nombre.

La respuesta de listado es un array, incluso cuando se aplica `limit` y `offset`. No incluye `total`. El contenedor del listado pide hasta cien filas con sus criterios y pagina ese resultado localmente; los servicios auxiliares también suelen pedir hasta cien temporadas; ese límite no equivale a descargar un histórico ilimitado.

## Integridad y límites

El trigger de partidos comprueba su fecha contra los límites de temporada. La base de datos permite fechas nulas en Season; en el alta directa por API, una fecha malformada puede convertirse a SQL NULL porque la conversión y la validación inicial no rechazan ese caso explícitamente. La UI sí exige fechas. La edición dispone de validación adicional de formato y consistencia.

No hay estado abierta/cerrada, inscripción de equipos por temporada, calendario automático ni proclamación del ganador.

## Código

`Web/src/features/seasons/`, `Api/internal/service/season.go`, `validators.go`, `handler/season.go`; tabla Season y trigger de la migración `000003`.
