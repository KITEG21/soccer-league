# Cómo documentar

Las páginas se mantienen en Markdown dentro de `docs/`. VitePress convierte el contenido a un sitio con menú lateral, búsqueda local, imágenes y temas claro/oscuro.

## Revisar cambios

Desde la raíz:

```sh
pnpm --dir docs dev
```

Abre `http://localhost:5173`. Guardar un archivo actualiza el sitio. No es necesario iniciar Web, Go o PostgreSQL.

## Elegir la sección

| Tipo de contenido | Carpeta |
| --- | --- |
| Concepto, actor, regla o proceso | `negocio/` |
| Pantalla, operación y comportamiento funcional | `modulos/` |
| Componente, capa, flujo o seguridad | `arquitectura/` |
| Esquema, relación o evolución SQL | `datos/` |
| Ruta, contrato, filtro o error HTTP | `api/` |
| Configuración, desarrollo y diagnóstico | `operacion/` |
| Fuentes y diferencias conocidas | `referencia/` |

La documentación de identidad permanece en `identidad-visual.md`; los cálculos de reportes y el diagrama conservan sus rutas existentes para no duplicar referencias.

## Crear una página

1. Crear el archivo en su sección, por ejemplo `docs/modulos/nueva-funcion.md`.
2. Escribir un único título principal y subtítulos descriptivos.
3. Añadir una entrada en el grupo correspondiente de `.vitepress/config.mts`.
4. Enlazar desde el índice de módulos o página de referencia pertinente.
5. Compilar y revisar el resultado.

Ejemplo de entrada de menú:

```ts
{ text: "Nueva función", link: "/modulos/nueva-funcion" }
```

La navegación no se genera automáticamente al crear el archivo. Una página fuera del menú puede seguir encontrándose mediante enlaces o búsqueda, pero debe incorporarse al recorrido documental.

## Estructura de un módulo

```md
# Nombre de la función

Propósito de negocio y rutas de pantalla.

## Datos

Campos de entrada y valores calculados.

## Operaciones y proceso

Acciones, precondiciones, estados y efectos.

## Reglas y permisos

Validación de UI, servicio y base de datos por separado.

## Código y dependencias

Archivos fuente y relaciones con otros módulos.
```

Una ampliación puede requerir también actualizar contratos, reglas, diccionario o fórmulas. El [mapa de fuentes](../referencia/mapa.md) identifica qué revisar.

## Imágenes, diagramas y enlaces

Guardar recursos en `docs/assets/` y usar rutas relativas:

```md
![Descripción de la imagen](../assets/captura.png)
[Modelo de datos](../datos/modelo.md)
```

Los SVG de arquitectura y relaciones se renderizan como imágenes sin plugins. Las muestras de color están en `assets/colors/`. Para recursos de ruta fija, como favicon, usar `docs/public/`.

Un archivo Markdown con imágenes enlazadas necesita sus recursos asociados. Compartir solamente el MD no los embebe. El build del sitio copia o incorpora las imágenes que utiliza; para distribuirlo se comparte el directorio estático completo.

Los paths de código fuera de docs se escriben como código, por ejemplo `Api/internal/service/match.go`, porque el sitio no sirve archivos de la aplicación.

## Enunciado y fuentes históricas

`Project Specifications.md` conserva el texto original y se incluye en la página publicada mediante la directiva de inclusión de VitePress. Se modifica la implementación documentada y la matriz de trazabilidad, sin reescribir el enunciado como si hubiera especificado las funciones añadidas.

## Criterios de redacción

- Describir el comportamiento comprobado, usando nombres exactos de campos y rutas.
- Separar una regla de formulario de una validación real de API o PostgreSQL.
- Distinguir lo existente de lo pendiente y evitar afirmaciones de cumplimiento no verificadas.
- Incluir ejemplos con supuestos explícitos, sin credenciales reales.
- Utilizar tablas para campos, permisos y comparaciones; párrafos para explicar efectos.
- Mantener las fuentes por nombre de archivo o consulta, evitando números de línea frágiles.
- No incorporar referencias a conversaciones o aprobaciones.

## Validar y distribuir

```sh
pnpm --dir docs build
pnpm --dir docs preview
```

El build verifica enlaces y genera `docs/.vitepress/dist/`. La revisión de navegador comprueba presentación, búsqueda, tablas e imágenes. La edición desde un CMS y la publicación automática permanecen pendientes; el flujo actual usa archivos Markdown y ejecución local.
