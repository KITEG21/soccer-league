# Reportes y exportación PDF

Todos los roles de la liga pueden consultar y exportar informes mediante `reports:read`. Las agregaciones están en SQL y sus resultados se transforman en ReportsService.

## Pantallas y filtros

| Pantalla | Reporte | Filtros |
| --- | --- | --- |
| `/reports/standings` | Clasificación | Temporada |
| `/reports/head-to-head` | Enfrentamientos | Dos equipos; temporada opcional |
| `/reports/schedule` | Partidos por fecha | Fecha; estadio opcional |
| `/reports/coach-experience` | Entrenadores | Ninguno |
| `/reports/attendance` | Audiencia | Temporada |
| `/reports/team-status` | Estado del equipo | Equipo y temporada |
| `/reports/all-star` | Equipo de estrellas | Temporada |

Los filtros determinan la clave de consulta y los parámetros de exportación. No hay almacenamiento de informes generados ni tareas programadas de envío.

## Interpretación

- Clasificación: equipo y puntos, por puntos descendentes y nombre como desempate.
- Enfrentamientos: fecha, equipos, sede, goles y asistencias; admite ambos sentidos local/visitante.
- Partidos por fecha: encuentro y asistencia de la fecha elegida, con sede opcional.
- Entrenadores: identidad, equipo, experiencia y campeonatos; prioridad por campeonatos ganados.
- Audiencia: capacidad, asistencia total, número de encuentros y porcentaje de ocupación.
- Estado: victorias, empates y derrotas, como local, visitante y total.
- Estrellas: hasta once jugadores en formación 1–4–3–3, con métricas por posición.

Las [fórmulas y casos límite](../reportes-explicacion.md) detallan cada consulta. Los pendientes afectan actualmente algunos resultados y la afiliación actual del jugador afecta el histórico.

## PDF

`ReportPdfButton` añade idioma y comprueba la respuesta mediante fetch. Si recibe PDF, abre su URL por el proxy en otra pestaña. La navegación puede volver a ejecutar el reporte; no se abre el cuerpo de la precomprobación como blob.

El endpoint es `GET /reports/pdf/{report}` con filtros y `lang=es` o `lang=en`. El estado de equipo recibe `teamId` como query en PDF; su versión JSON utiliza el ID en la ruta.

La respuesta incluye `Content-Type: application/pdf`, `Content-Disposition: inline`, tamaño y `Cache-Control: no-store`. El nombre incorpora la fecha de generación.

`Api/internal/pdf/report.go` implementa una capa sobre `github.com/go-pdf/fpdf`: A4 vertical, Helvetica, cabecera, filtros, tablas y paginación. `handler/reports_pdf_i18n.go` traduce etiquetas. El idioma se elige mediante parámetro.

## Fuentes

`Web/src/features/reports/` contiene contenedores, tipos, servicio y botón PDF. El backend utiliza `service/reports.go`, `reports_labels.go`, `handler/reports.go`, `reports_pdf.go` y consultas en `Api/sql/queries.sql`.
