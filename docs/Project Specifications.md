# Liga de Futbol (3 estudiantes)

El Instituto Nacional de Deporte, Educación Física y Recreación (INDER) necesita un sistema que le permita controlar todos los datos asociados a la Liga Nacional de Fútbol para que se realice de manera más eficiente. En la Liga compiten varios equipos, de los cuales se conoce: el nombre, la provincia que representan, la cantidad de campeonatos en los que ha participado, la cantidad de campeonatos ganados, la mascota y el color.

Cada equipo está compuesto por un grupo de futbolistas, de los que se conoce el nombre, número y cantidad de años en el equipo. Los futbolistas se dividen en dos categorías: los entrenadores y los jugadores, que son los que juegan los partidos. De los entrenadores se conoce la cantidad de años de experiencia y de los jugadores se conoce la posición principal en la que puede jugar, la cantidad de partidos jugados, la cantidad de goles marcados, asistencias, y el promedio de goles por partido.

Dependiendo de la posición en la que juegue el jugador, se almacenan estadísticas específicas:

- Para los **delanteros**: tiros a puerta.
- Para los **mediocampistas**: pases completados e intercepciones.
- Para los **defensas**: entradas y bloqueos.
- Para los **porteros**: paradas, goles encajados.

Para cada partido de la Liga, se debe registrar los equipos participantes (equipo visitante y equipo local), la fecha, el estadio y el resultado. Al final de cada partido, el equipo ganador suma 3 puntos, el equipo que empata suma 1 punto, y el equipo que pierde no suma puntos. Al final de la Liga, gana el equipo que más puntos haya acumulado.

Además, el sistema a desarrollar deberá ser capaz de generar los siguientes reportes:

1. **Tabla de posiciones de la liga**: se mostrará el listado de los equipos participantes en la Liga ordenados de acuerdo a la cantidad de puntos obtenidos. El reporte deberá incluir el nombre y la cantidad de puntos de cada equipo.

2. **Partidos por equipos**: se mostrará, dados dos equipos, la información de los partidos que involucran a esos equipos (goles y asistentes por cada equipo).

3. **Partidos jugados por fecha**: se mostrará, dada una fecha y un estadio, la información del partido realizado que cumpla con esos parámetros. Si el estadio no se pasa como parámetro, se mostrará la información correspondiente a todos los partidos realizados en esa fecha.

4. **Entrenadores con más experiencia**: El reporte deberá incluir el nombre, el número y los años de experiencia del entrenador y equipo al que pertenece, y estar ordenado descendentemente por la cantidad de campeonatos ganados por los mismos.

5. **Estadios con mayor audiencia**: se mostrará el listado de los estadios ordenados a partir de su porcentaje de audiencia, es decir, la audiencia total que ha tenido el estadio / la audiencia total que pudo haber tenido * 100.

6. **Estado de un equipo**: se mostrará, dado un equipo, la cantidad de juegos que ganó, empató y perdió (la cantidad total, la cantidad como visitante y la cantidad como local).

7. **Equipo todo estrellas**: se mostrará el listado de jugadores (cada uno perteneciente a una posición distinta) que conformarán el equipo todos estrellas de la Liga. Cada jugador se seleccionará por las mejores estadísticas con respecto a los otros jugadores de esa posición. El reporte deberá incluir la posición, el nombre del jugador, el nombre del equipo al que pertenece y las estadísticas que lo hicieron ser seleccionado para el equipo.

Debe existir un **trigger** que verifique cuando se vaya a registrar la fecha de un partido, que la misma esté comprendida en el rango de fechas establecido por la temporada de la Liga.