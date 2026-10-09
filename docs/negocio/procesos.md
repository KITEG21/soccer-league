# Procesos de la liga

## Preparar una temporada

1. Disponer de una cuenta con permisos de escritura sobre la liga.
2. Registrar equipos y estadios.
3. Incorporar jugadores y entrenadores, evitando dorsales repetidos dentro del equipo.
4. Crear una temporada con fechas válidas, sin solapamiento con otra.
5. Registrar partidos seleccionando temporada, local, visitante, estadio y fecha.

La dependencia funcional es **catálogos → temporada y plantillas → partidos → estadísticas → reportes**. Los catálogos y plantillas necesarios deben existir al programar o completar un encuentro.

## Programar y completar un partido

| Paso | Acción | Resultado |
| --- | --- | --- |
| Programación | Crear con `disputed: false` | Encuentro pendiente; no admite estadísticas |
| Celebración | Marcar como disputado | Habilita captura estadística |
| Captura | Abrir `/matches/{id}` y registrar cada jugador | Recalcula el marcador desde goles individuales |
| Revisión | Corregir estadísticas y asistencia | Los reportes consultan los datos actuales |
| Consulta | Seleccionar filtros de un informe | Presentación en pantalla o PDF |

No existe un cierre irreversible del acta. Un disputado puede recibir correcciones. Si tiene estadísticas, no puede volver a pendiente ni eliminarse; primero deben retirarse las filas correspondientes.

## Registrar rendimiento

El detalle ofrece jugadores de los dos equipos actuales y excluye de la selección a los ya registrados. Al editar una fila no permite cambiar el jugador mediante el selector.

El diálogo actual captura goles, asistencias, tiros a puerta, pases completados, intercepciones y entradas para cualquier posición. El contrato y la base también contemplan bloqueos, paradas y goles encajados, pero esos campos no tienen controles de captura en la UI.

La pareja `player_id` y `match_id` es única. Una corrección modifica esa fila; no crea otra participación. Al guardar o eliminar, el frontend invalida consultas de estadísticas y del detalle del partido.

::: warning Integridad histórica
El equipo de cada gol se obtiene mediante la afiliación actual del jugador. Una transferencia o eliminación del jugador puede modificar resultados anteriores. La aplicación no conserva una plantilla del encuentro como instantánea.
:::

## Gestionar cambios y bajas

| Entidad | Condición de baja |
| --- | --- |
| Equipo | Sin futbolistas ni partidos relacionados |
| Estadio | Sin partidos relacionados |
| Temporada | Sin partidos relacionados |
| Partido | Sin estadísticas |
| Jugador | Su eliminación elimina también estadísticas por cascada |
| Entrenador | Se elimina especialización y registro de futbolista |
| Usuario | No puede eliminarse el actor actual; los refresh tokens de la cuenta se eliminan por cascada |

La transferencia se realiza editando el equipo del futbolista y comprobando el dorsal en destino. No existe un proceso separado ni una fecha efectiva almacenada.

## Consultar y exportar

React Query obtiene JSON a través de Next.js. El botón PDF comprueba la respuesta con fetch y después abre la URL del documento, lo que puede generar una segunda petición. La API ejecuta el informe con sus filtros e idioma.

No hay informes guardados ni actas versionadas. El PDF refleja los datos consultados al generarlo. Consulte [fórmulas y criterios](../reportes-explicacion.md) antes de interpretar puntos o audiencia.

## Administrar accesos

Un superadministrador crea cuentas con correo, contraseña y rol. Puede cambiar el rol de otras cuentas o eliminarlas. El login emite JWT y refresh token, guardados por Next.js en cookies HttpOnly. La renovación rota el token y el logout intenta revocarlo y elimina cookies.

No existe alta pública ni recuperación de contraseña. La primera cuenta requiere [aprovisionamiento administrativo](../operacion/configuracion.md).
