# Arquitectura del frontend

La aplicación usa Next.js con App Router, React y TypeScript. Su estructura combina páginas del framework con módulos funcionales y una biblioteca compartida de UI, autenticación y acceso a datos.

## Capas

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Rutas y composición | `Web/src/app/` | Layouts, páginas, metadatos, errores y Route Handler de la API |
| Entrada y permisos de navegación | `Web/src/proxy.ts` y `shared/auth/` | Verificar sesión, renovar, redirigir o devolver página 403 |
| Casos de uso de interfaz | `features/*/containers/` | Consultas, mutaciones, filtros y coordinación de formularios |
| Presentación funcional | `features/*/components/` | Listados, formularios, tarjetas y detalles |
| Contratos y validación | `features/*/types/`, `schemas/` | Tipos TypeScript y esquemas Zod |
| Acceso a la API | `features/*/services/`, `shared/utils/api-client.ts` | Rutas, payloads, JSON y errores |
| UI común | `shared/components/` y `ui/` | Tablas, diálogos, botones, permisos, carga y marca |
| Estado transversal | `shared/contexts/` y proveedores | Usuario, tema, caché y parámetros de URL |

Los módulos son `auth`, `layout`, `dashboard`, `users`, `teams`, `players`, `coaches`, `stadiums`, `seasons`, `matches` y `reports`. Las estadísticas de jugadores forman parte de `matches` en el frontend.

## Servidor y navegador

El layout raíz obtiene la sesión inicial, el idioma y el tema. Las páginas componen los contenedores; estos usan componentes de cliente para formularios, tablas y React Query. Las acciones de login/logout y el proxy `/api/backend/[...path]` se ejecutan en el servidor.

Los secretos y la URL de destino son variables de servidor. El cliente usa rutas del mismo origen y recibe un resumen de usuario y permisos, no los tokens de acceso y renovación.

## Consultas y mutaciones

React Query mantiene resultados identificados mediante `queryKey`. Los listados incluyen sus parámetros en la clave; las mutaciones invalidan consultas del recurso. La configuración global usa un reintento y desactiva la recarga automática al enfocar la ventana.

No hay un store global de entidades duplicando esa caché. Los formularios mantienen estado local. El contexto de autenticación limpia la caché al cerrar sesión.

La invalidación no es universal entre módulos: las modificaciones de estadísticas invalidan su listado y el detalle del partido, pero no todas las consultas de dashboard o reportes ya cargadas. Una consulta previa puede permanecer en caché hasta su próxima recarga.

## Tablas y URL

`shared/components/data-table/` reúne búsqueda con retardo, columnas, filtros avanzados y paginación. nuqs sincroniza `page`, `pageSize`, `sort`, `order`, `q` y filtros con la URL mediante reemplazo del historial; el adaptador lo traduce a `limit`, `offset`, `sort`, `order`, `q` y filtros del backend. Las tablas ofrecen tamaños 10, 20 y 50.

La paginación visual usa páginas; la API usa desplazamiento: `offset = (page - 1) * limit`. La API de temporadas devuelve un array, por lo que no comparte exactamente el contrato paginado de los otros listados.

## Formularios y errores

React Hook Form y Zod validan campos y relacionan mensajes con controles. Los cambios usan diálogos de edición y confirmación de baja. `ApiError` conserva estado HTTP y errores por campo; `error-translator.ts` adapta mensajes reconocidos al idioma.

Las reglas del servidor siguen siendo necesarias aunque un control o botón esté oculto. `PermissionGuard`, `usePermission`, navegación y proxy coordinan la presentación, sin sustituir la autorización de Go.

## Idiomas, tema y accesibilidad

next-intl utiliza mensajes `Web/messages/es.json` y `en.json`, con español como idioma predeterminado y cookie de selección. El cambio de idioma no añade un prefijo a las rutas.

El tema inicial proviene de la cookie `theme`; sin ella se usa claro. ThemeContext actualiza la clase de la página, el almacenamiento local y una cookie. La paleta vive en `Web/src/app/globals.css`; véase [identidad visual](../identidad-visual.md).

Los componentes basados en Radix proporcionan interacción de diálogos, menús y selectores. Los estados de carga, errores, rutas inexistentes y acceso denegado se presentan mediante componentes y páginas específicos. No hay una auditoría de accesibilidad automatizada registrada como parte de los scripts del proyecto.

## Añadir un módulo

1. Definir tipos y rutas de API; mantener nombres JSON del backend.
2. Crear servicio, esquema de formulario, componentes y contenedor.
3. Añadir página, metadatos y mensajes en ambos idiomas.
4. Registrar navegación y requisitos en `shared/auth/routes.ts` y configuración compartida.
5. Añadir el recurso y los permisos en Go si no existe.
6. Definir claves e invalidaciones de caché, estados vacíos y manejo de errores.
7. Incorporar su documentación y verificar contratos y permisos.
