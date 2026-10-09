# Documentación de SoccerLeague

Sitio VitePress para documentación funcional y técnica. El contenido se mantiene en Markdown con imágenes locales, búsqueda y temas claro/oscuro. No depende de la API ni de la base de datos.

## Inicio

Desde la raíz del repositorio:

```sh
pnpm --dir docs install
pnpm --dir docs dev
```

Abre `http://localhost:5173`. Guardar cambios actualiza la vista. Para generar y revisar el sitio estático:

```sh
pnpm --dir docs build
pnpm --dir docs preview
```

La salida es `docs/.vitepress/dist/` y no se guarda en Git.

## Organización

| Ubicación | Contenido |
| --- | --- |
| `guia/` | Introducción, instalación, recorrido de arquitectura y edición |
| `negocio/` | Alcance, procesos, reglas, requisitos y enunciado original |
| `modulos/` | Acceso, panel, usuarios, catálogos, partidos, estadísticas y reportes |
| `arquitectura/` | Sistema, frontend, backend y seguridad |
| `datos/` | Diccionario y migraciones |
| `api/` | Contratos, rutas, filtros y errores |
| `operacion/` | Configuración, desarrollo, verificación y diagnóstico |
| `referencia/` | Fuentes y límites actuales |
| `database-diagram.md` | Relaciones del modelo vigente |
| `reportes-explicacion.md` | Cálculos y criterios de los siete reportes |
| `identidad-visual.md` | Marca y paleta con muestras de color |
| `assets/`, `public/` | Imágenes, diagramas, muestras y favicon |
| `.vitepress/` | Navegación, búsqueda y estilos |

`Project Specifications.md` se conserva como fuente histórica y se incluye en la página de especificación original. Los documentos de modelo y reportes forman parte de la navegación actual. Los paths del código se documentan como referencias del repositorio, sin enlaces fuera del sitio.

## Mantenimiento

La guía `guia/documentar.md` explica cómo crear páginas, incluir recursos y añadirlas al menú. Cada cambio funcional debe revisar su módulo y los contratos, reglas, datos o fórmulas afectados. El build comprueba los enlaces internos; la revisión visual se hace desde el navegador.

## Evolución pendiente

- Evaluar un editor web completamente gratuito: Pages CMS como panel externo o Decap CMS integrado en `/admin`.
- Configurar publicación automática al actualizar la documentación en la rama destinada a publicación.
- Comparar GitHub Pages y Cloudflare Pages según visibilidad del repositorio y límites de sus planes gratuitos.
- Automatizar navegación para crear páginas desde el editor sin editar TypeScript manualmente.
- Preparar una base reutilizable para otros proyectos.

Estas integraciones permanecen pendientes. El sitio actual se utiliza en local y la edición se realiza sobre Markdown.
