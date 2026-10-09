# Comportamiento actual y límites conocidos

Esta referencia recoge límites observados en el código. No son funciones implementadas ni un listado de cambios ejecutados por la documentación.

## Negocio y datos

| Área | Estado actual | Consecuencia |
| --- | --- | --- |
| Clasificación/estado | No filtran disputed | Un pendiente 0–0 puede computar empate |
| Afiliación histórica | Se utiliza Footballer.team_id actual | Transferencias alteran agrupación de goles antiguos |
| Baja de jugador | Cascada de PlayerStats | Puede alterar resultados históricos |
| Capacidad histórica | Se utiliza Stadium.capacity actual | Cambiarla recalcula porcentajes anteriores |
| Temporadas | Sin inscripción de equipos ni cierre | Todos los equipos aparecen en clasificación; no hay proclamación automática |
| Agregados del jugador | Sin partidos/promedio persistidos o DTO específico | El enunciado inicial no equivale a un perfil estadístico implementado |
| Exclusión jugador/entrenador | Sin restricción de exclusión SQL | Escritura directa puede crear ambas especializaciones |
| Integridad numérica | Sin checks generales no negativos ni asistencia ≤ capacidad | La API directa no reproduce todas las restricciones del formulario |
| Participación | Servicio de estadísticas no verifica equipo del jugador | La selección de UI no protege una petición directa |

## Interfaz y contratos

| Área | Estado actual | Consecuencia |
| --- | --- | --- |
| Captura estadística | Diálogo expone goles, asistencias, tiros, pases, intercepciones y entradas | Bloqueos, paradas y encajados existen en API pero no tienen controles de captura |
| Dashboard | Temporada de mayor end_date; cinco pendientes sin exigir fecha futura | «Actual» y «próximos» tienen ese criterio concreto |
| Catálogos auxiliares | Servicios solicitan hasta cien filas | Selectores o resumen pueden no representar todo el histórico |
| Temporadas | Listado array sin total | No comparte el contrato paginado completo |
| Estadísticas y ciertos reportes | Algunos vacíos se serializan como null | Los defaults de desestructuración del frontend solo cubren undefined; algunos contenedores pueden fallar si reciben null |
| Metadatos de página | Handler devuelve limit/offset sin normalización | Pueden diferir del recorte efectivo |
| Errores | Mezcla JSON/texto; algunas validaciones y duplicados SQL se envían como 500 | No hay contrato uniforme de error de negocio |
| Caché | Invalidación por recurso o detalle | Reportes previamente cargados pueden quedar desactualizados |
| OpenAPI | JSON manual separado del router | Puede divergir si no se actualiza junto al código |
| PDF | Precomprobación fetch y posterior navegación a URL | Puede ejecutar el reporte dos veces y observar un cambio entre peticiones |

## Operación y seguridad

El limitador de login es local al proceso. No hay bootstrap de primera cuenta, recuperación de contraseña, MFA, auditoría de modificaciones, health check ni pipeline de despliegue en el repositorio. Las actualizaciones compuestas de futbolistas no usan una transacción explícita.

El logout revoca renovación y elimina cookies, pero no revoca inmediatamente JWT de acceso mediante una lista de bloqueo. La API sí vuelve a comprobar usuario y rol en la base de datos.

El diálogo de estadísticas y las diferencias de reportes deben revisarse cuando se planifiquen arreglos de UI o negocio. Esta ampliación documental no modifica esas funciones.

## Evolución del sitio

Editor web gratuito, publicación automática al actualizar documentación y reutilización para otros proyectos permanecen pendientes. El sitio local VitePress ya permite editar Markdown y ver cambios en navegador; no implementa edición de contenido desde una pantalla propia.
