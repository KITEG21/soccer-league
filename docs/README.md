# Documentación de SoccerLeague

Sitio local de documentación construido con VitePress. El contenido se mantiene en Markdown y puede consultarse con navegación lateral, búsqueda y temas claro y oscuro.

## Inicio rápido

Desde la raíz del repositorio:

```sh
pnpm --dir docs install
pnpm --dir docs dev
```

Abre http://localhost:5173.

## Comandos

| Comando | Función |
| --- | --- |
| `pnpm --dir docs dev` | Desarrollo con actualización automática |
| `pnpm --dir docs build` | Generación estática y comprobación de enlaces |
| `pnpm --dir docs preview` | Consulta del sitio generado |

## Contenido

- `index.md`: portada.
- `guia/`: introducción, instalación, arquitectura y guía de edición.
- `identidad-visual.md`: logotipo y paleta.
- `assets/`: imágenes y muestras de color.
- `.vitepress/config.mts`: navegación, búsqueda y configuración.
- `.vitepress/theme/`: estilos del sitio.

Los documentos históricos `Project Specifications.md`, `database-diagram.md` y `reportes-explicacion.md` se conservan en el repositorio y quedan fuera de esta primera navegación.

El sitio funciona de manera independiente de la aplicación, la API y la base de datos. No requiere variables de entorno ni servicios externos para buscar contenido.

## Evolución pendiente

- Evaluar un editor web gratuito para mantener la documentación en Git: Pages CMS como panel externo o Decap CMS integrado en `/admin`.
- Configurar la publicación automática cuando se actualice la documentación en la rama de publicación.
- Comparar GitHub Pages y Cloudflare Pages según la visibilidad del repositorio y los límites de sus planes gratuitos.
- Automatizar la navegación para crear páginas desde el editor sin modificar manualmente la configuración TypeScript.
- Preparar una base reutilizable para la documentación de otros proyectos.

Estas integraciones quedan pendientes; el sitio actual se utiliza en local.
