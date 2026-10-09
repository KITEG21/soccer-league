# Introducción

SoccerLeague gestiona información de una liga de fútbol: equipos, plantillas, estadios, temporadas, partidos y rendimiento de jugadores. La aplicación ofrece acceso por roles, consulta con filtros y siete reportes exportables a PDF.

Este sitio documenta el comportamiento actual del repositorio. Los requisitos originales se conservan como fuente y las diferencias se señalan en sus páginas correspondientes.

## Organización del repositorio

| Directorio | Contenido |
| --- | --- |
| `Web/` | Interfaz Next.js/React y servidor web de sesión/proxy |
| `Api/` | Servidor Go, servicios, SQL, migraciones y PDF |
| `docs/` | Sitio VitePress, Markdown e imágenes |

PostgreSQL es un servicio necesario para la liga. La documentación funciona por separado, sin iniciar la aplicación ni disponer de una cuenta.

## Recorridos de lectura

| Perfil | Lectura |
| --- | --- |
| Negocio | [Contexto](../negocio/contexto.md) → [procesos](../negocio/procesos.md) → [reglas](../negocio/reglas.md) |
| Uso funcional | [Módulos](../modulos/index.md) → página de la función → [criterios de reportes](../reportes-explicacion.md) |
| Desarrollo frontend | [Sistema](../arquitectura/general.md) → [frontend](../arquitectura/frontend.md) → [contratos](../api/contratos.md) |
| Desarrollo backend | [Backend](../arquitectura/backend.md) → [datos](../datos/modelo.md) → [migraciones](../datos/migraciones.md) |
| Operación | [Instalación](./instalacion.md) → [configuración](../operacion/configuracion.md) → [diagnóstico](../operacion/diagnostico.md) |

La [referencia de fuentes](../referencia/mapa.md) conecta temas con archivos del código. Los [límites actuales](../referencia/estado.md) evitan confundir funcionalidades deseadas con capacidades existentes.

## Consultar el sitio

```sh
pnpm --dir docs install
pnpm --dir docs dev
```

Desde la raíz del repositorio, abre `http://localhost:5173`. El menú organiza las áreas y la búsqueda local encuentra conceptos, campos y rutas. Los cambios en Markdown se actualizan en el navegador; la guía de [edición](./documentar.md) explica cómo mantener páginas e imágenes.
