# Guía de arquitectura

La referencia de arquitectura se divide en páginas para separar responsabilidades y facilitar su mantenimiento.

| Página | Contenido |
| --- | --- |
| [Sistema y flujo](../arquitectura/general.md) | Componentes, dependencias y recorrido completo de una petición |
| [Frontend](../arquitectura/frontend.md) | App Router, módulos, contenedores, formularios, caché, UI e idiomas |
| [Backend](../arquitectura/backend.md) | Composición Go, transporte, servicios, sqlc y conexión |
| [Seguridad](../arquitectura/seguridad.md) | Roles, permisos, JWT, cookies y renovación |
| [Modelo de datos](../datos/modelo.md) | Tablas, campos, relaciones y datos derivados |
| [Migraciones](../datos/migraciones.md) | Evolución del esquema y triggers |

El navegador consume el servidor Next.js; este accede a la API Go mediante el proxy del mismo origen. Go autoriza, ejecuta servicios y consultas SQL sobre PostgreSQL. El sitio documental es independiente y se genera como archivos estáticos.

Las rutas del código se encuentran en el [mapa de fuentes](../referencia/mapa.md).
