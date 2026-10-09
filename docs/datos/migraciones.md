# Evolución del esquema y triggers

Las migraciones numeradas de `Api/sql/migrations/` tienen pares `.up.sql` y `.down.sql`. La API aplica automáticamente las pendientes al iniciar mediante golang-migrate.

## Historial

| Versión | Cambio |
| --- | --- |
| `000001` | Esquema inicial: equipos, estadios, temporadas, Futbolista, posiciones y especializaciones |
| `000002` | Renombra Futbolista a Footballer, adapta referencias y añade nombres únicos de equipos/estadios |
| `000003` | Posición como texto, Match y PlayerStats; validación de fecha de partido; retira Position y agregados antiguos |
| `000004` | Dorsal único por equipo, adaptación de duplicados y retirada de agregados del jugador; incorpora contadores temporales de equipo |
| `000005` | Estado disputado, marcador derivado; triggers de estadísticas y protección de partidos |
| `000006` | Triggers para mantener contadores de plantilla del equipo |
| `000007` | Retira contadores y sus triggers; los servicios calculan las cantidades |
| `000008` | Users, RefreshToken e índice de usuario para renovaciones |

El esquema vigente resulta de toda la secuencia. Las versiones 000004/000006 no describen por sí solas el modelo final.

## Triggers vigentes

| Trigger | Tabla y evento | Regla |
| --- | --- | --- |
| `trigger_validate_match_date` | Match, BEFORE INSERT/UPDATE | Temporada obligatoria y fecha dentro de su intervalo inclusivo |
| `trigger_validate_match_disputed` | PlayerStats, BEFORE INSERT/UPDATE | Partido existente y disputado |
| `trigger_prevent_match_disputed_change` | Match, BEFORE UPDATE OF disputed | No pasar de true a false con estadísticas |
| `trigger_prevent_match_delete_with_stats` | Match, BEFORE DELETE | No borrar si tiene estadísticas |

Las reglas operan también ante escrituras SQL directas. La restricción UNIQUE de dorsales y la de jugador/partido complementan los triggers. La validación de temporadas no solapadas reside en el servicio, no en un trigger de Season.

## Ejecución y archivos necesarios

El arranque busca `sql/migrations` o `Api/sql/migrations` recorriendo directorios candidatos. Ejecutar desde `Api/` mantiene una ubicación predecible. Un despliegue del binario necesita esos archivos; compilar el ejecutable no los incorpora automáticamente.

La conexión comprueba el estado de migración y ejecuta `Up()`. Una base actualizada no cambia. Un fallo de conexión, localización o migración detiene la API.

## Estado dirty

`internal/db/db.go` contiene recuperación automática de migración dirty. Para la versión 2 intenta corregir renombrados e índices; después fuerza la versión previa y vuelve a aplicar pendientes. No es una reparación transaccional genérica de cualquier cambio parcial.

Al investigar un fallo se revisan logs, `schema_migrations`, objetos reales y el SQL de la versión. Antes de reejecutar sobre datos persistentes se necesita conocer qué instrucciones llegaron a aplicarse. No se documenta `force` como solución universal.

## Añadir un cambio

1. Crear la siguiente pareja numerada con nombres descriptivos.
2. Diseñar la transformación de datos existentes y el comportamiento de reversión.
3. Actualizar `schema.sql` cuando cambien tipos, tablas o columnas utilizadas por sqlc.
4. Actualizar `queries.sql` y ejecutar `sqlc generate` desde Api.
5. Adaptar servicios, DTO, handlers, contratos frontend y documentación.
6. Verificar una base nueva y una base con la versión anterior en un entorno de prueba.

No modificar retrospectivamente una migración ya aplicada para sustituir una migración nueva. Una reversión puede perder datos y debe revisarse como operación de base de datos.
