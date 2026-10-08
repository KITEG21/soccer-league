# Introducción

SoccerLeague es una aplicación para administrar una liga de fútbol. Centraliza los equipos, los integrantes, las temporadas y los partidos, y permite consultar reportes sobre la competición.

## Funcionalidades

| Área | Información gestionada |
| --- | --- |
| Temporadas | Fechas de la competición y organización por temporada |
| Equipos | Datos del equipo y sus integrantes |
| Jugadores | Posición y estadísticas deportivas |
| Entrenadores | Información y experiencia |
| Estadios | Datos y capacidad |
| Partidos | Equipos participantes, fecha, estadio y estadísticas |
| Usuarios | Acceso y roles de la aplicación |

## Reportes

La aplicación incluye tabla de posiciones, enfrentamientos entre equipos, calendario de partidos, audiencia por estadio, estado de un equipo, experiencia de entrenadores y equipo todo estrellas.

## Componentes del proyecto

| Componente | Tecnología | Carpeta |
| --- | --- | --- |
| Aplicación web | Next.js, React, TypeScript y Tailwind CSS | `Web/` |
| API | Go y Chi | `Api/` |
| Base de datos | PostgreSQL; consultas generadas con sqlc | `Api/sql/` |
| Documentación | Markdown y VitePress | `docs/` |

## Acceso y presentación

La aplicación dispone de autenticación, control de permisos, temas claro y oscuro e interfaz en español e inglés. Los roles definidos en el sistema son `superadmin`, `admin` y `visitante`.

## Siguientes pasos

- [Preparar el entorno de desarrollo](./instalacion.md).
- [Consultar la arquitectura](./arquitectura.md).
- [Revisar la identidad visual](../identidad-visual.md).
