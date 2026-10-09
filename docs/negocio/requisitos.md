# Trazabilidad de requisitos

La [especificación inicial](./especificacion-original.md) se conserva como documento de origen. Esta matriz relaciona sus necesidades con la implementación actual.

| Necesidad original | Implementación | Observaciones |
| --- | --- | --- |
| Datos de equipos y campeonatos | Módulo equipos y tabla Team | Historial de campeonatos introducido manualmente |
| Futbolistas, dorsal y antigüedad | Footballer con Player o Coach | La exclusión entre especializaciones no está impuesta en SQL |
| Posición principal de jugador | `Player.position` | Texto; las cuatro posiciones de la UI tienen valores en español |
| Partidos, goles y promedio por jugador | PlayerStats por encuentro | No hay campos agregados de partidos y promedio en el DTO del jugador |
| Estadísticas específicas por posición | API y tabla PlayerStats | El diálogo captura seis métricas; faltan controles de bloqueos, paradas y encajados |
| Fecha, sede, equipos y resultado | Módulo partidos | Resultado derivado de goles individuales |
| Puntos 3/1/0 y ganador de liga | Tabla de posiciones | No hay proclamación automática ni cierre de temporada |
| Siete reportes | Módulo reportes y PDF | Cada consulta tiene filtros y reglas particulares |
| Equipo de estrellas con posiciones distintas | Selección 1–4–3–3 | Hasta once jugadores, en lugar de uno por cada posición |
| Trigger de fecha dentro de temporada | Migración `000003` | Validación en PostgreSQL |

## Funciones añadidas

La implementación incorpora temporadas sin solapamiento, gestión de usuarios, roles y permisos, renovación de sesiones, limitación de intentos de login, estado disputado, protección de bajas, filtros de listado, idioma español/inglés, temas claro/oscuro y exportación PDF.

## Diferencias que afectan la interpretación

Los reportes de clasificación y estado consideran los partidos registrados de la temporada sin exigir que estén disputados. La audiencia usa todos los encuentros registrados como denominador. Los cálculos históricos dependen del equipo actual del futbolista. Estos comportamientos están descritos en [cálculos](../reportes-explicacion.md); no deben deducirse únicamente del texto original.

Fuentes: enunciado original, `Api/sql/queries.sql`, `Api/internal/service/reports.go` y módulos `Web/src/features/`.
