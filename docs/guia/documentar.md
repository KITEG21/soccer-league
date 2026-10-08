# Cómo documentar

El contenido se escribe en Markdown dentro de `docs/`. El sitio permite revisar las páginas y sus imágenes desde el navegador mientras se editan.

## Consultar los cambios

Desde la raíz del repositorio:

```sh
pnpm --dir docs dev
```

Abre `http://localhost:5173` y guarda los cambios en el editor para actualizar la vista.

## Crear una página

1. Crea un archivo, por ejemplo `docs/guia/partidos.md`.
2. Escribe un título principal y organiza el contenido con subtítulos.
3. Añade la página al menú lateral de `docs/.vitepress/config.mts`.

```md
# Gestión de partidos

Descripción de la funcionalidad.

## Registrar un partido

Pasos y condiciones para registrar el partido.

## Validaciones

Reglas que debe cumplir la información.
```

Entrada de ejemplo para el menú lateral:

```ts
{ text: "Gestión de partidos", link: "/guia/partidos" }
```

## Imágenes y enlaces

Guarda las imágenes del contenido en `docs/assets/` y utiliza rutas relativas al documento:

```md
![Descripción de la imagen](../assets/captura-partidos.png)
```

Para enlazar otra página desde `docs/guia/`:

```md
[Arquitectura](./arquitectura.md)
```

Las imágenes de la identidad visual y las muestras cromáticas están disponibles en esta misma carpeta de recursos.

## Criterios de redacción

- Documentar el comportamiento actual y las reglas concretas de cada funcionalidad.
- Usar títulos descriptivos y párrafos breves.
- Reservar las tablas para comparaciones, campos y referencias.
- Incluir ejemplos verificables y pasos de reproducción cuando sean necesarios.
- Evitar referencias a conversaciones o al proceso de aprobación.

## Verificar el sitio

```sh
pnpm --dir docs build
```

El comando genera el sitio estático y comprueba los enlaces entre páginas. Para revisar el resultado:

```sh
pnpm --dir docs preview
```
