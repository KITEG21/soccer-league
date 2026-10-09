# Negocio y alcance

SoccerLeague centraliza la gestión de una liga de fútbol: organiza equipos y plantillas, delimita temporadas, registra partidos y estadísticas individuales y obtiene informes deportivos. El enunciado original sitúa el sistema en la Liga Nacional de Fútbol y en las necesidades del INDER. Esta documentación describe la aplicación implementada en el repositorio.

## Objetivos

- Mantener un catálogo consistente de equipos, jugadores, entrenadores y estadios.
- Programar encuentros dentro de una temporada y distinguir partidos pendientes de disputados.
- Registrar el rendimiento de cada jugador en cada partido y calcular el marcador a partir de sus goles.
- Consultar clasificación, enfrentamientos, calendario, entrenadores, audiencia, resultados de un equipo y selección de estrellas.
- Controlar las operaciones mediante usuarios, roles y permisos.

## Actores

| Actor | Responsabilidad | Rol de la aplicación |
| --- | --- | --- |
| Responsable del sistema | Crear cuentas, asignar roles y administrar la liga | `superadmin` |
| Gestor de la liga | Mantener catálogos, temporadas, encuentros y estadísticas | `admin` |
| Consultante | Consultar datos y reportes, incluida la exportación PDF | `visitante` |

El rol visitante sigue necesitando iniciar sesión. Las pantallas de consulta de la liga no constituyen un portal público.

## Conceptos del dominio

| Concepto | Descripción |
| --- | --- |
| Temporada | Intervalo de fechas al que pertenecen los partidos; no tiene nombre almacenado |
| Equipo | Club o selección con provincia, mascota, color e historial declarado de campeonatos |
| Futbolista | Identidad común de un jugador o entrenador: equipo, nombre, dorsal y antigüedad |
| Jugador | Futbolista con una posición principal |
| Entrenador | Futbolista con experiencia y campeonatos ganados |
| Estadio | Sede con capacidad utilizada en el cálculo de audiencia |
| Partido | Encuentro entre dos equipos, con temporada, fecha, estadio, asistencia y estado |
| Estadística | Rendimiento de un jugador en un partido; una fila por esa pareja |
| Resultado | Marcador derivado de la suma de goles individuales por equipo |

## Alcance funcional

La aplicación incluye mantenimiento de datos, consulta con filtros, autenticación, permisos, reportes y PDF. No hay módulos implementados de inscripción a torneos, arbitraje, sanciones, pagos, venta de entradas, notificaciones o generación automática de jornadas. No se almacena una afiliación histórica a equipos por temporada.

Los campeonatos jugados y ganados de equipos y entrenadores son valores introducidos por el gestor. La clasificación no actualiza esos campos ni proclama automáticamente un campeón.

## Relación con el enunciado

Consulta la [especificación original](./especificacion-original.md), la [trazabilidad de requisitos](./requisitos.md) y las [reglas vigentes](./reglas.md). Las diferencias entre objetivos iniciales y comportamiento actual se documentan expresamente para evitar interpretar una intención como una función existente.
