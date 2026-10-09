# Desarrollo y mantenimiento

## Procesos locales

La API, Web y documentación se ejecutan en terminales separadas. Solo consultar o editar documentación no requiere iniciar la liga.

```sh
# Desde Api/
go run ./cmd/api

# Desde Web/
pnpm dev

# Desde la raíz
pnpm --dir docs dev
```

Direcciones habituales: web `http://localhost:3000`, API `http://localhost:8080`, referencia interactiva `http://localhost:8080/docs` y sitio documental `http://localhost:5173`.

## Responsabilidad de archivos

| Cambio | Archivos que revisar |
| --- | --- |
| Campo persistido | Migración, schema.sql, queries.sql y store generado |
| Contrato de API | DTO Go, handler, OpenAPI manual, tipos y servicios web |
| Regla de negocio | Servicio/validator y restricción SQL cuando corresponda |
| Pantalla o formulario | Contenedor, componentes, esquema, mensajes es/en y permisos |
| Recurso protegido | Permisos Go, router, permisos/rutas/navegación web |
| Diseño | Tokens CSS, componentes y documentación de identidad |
| Reporte | SQL, ReportsService, contenedor, DTO y exportación PDF |
| Documentación | Página de su sección y navegación VitePress |

## Generación sqlc

Desde `Api/`, con sqlc instalado:

```sh
sqlc generate
```

El archivo `Api/sqlc.yaml` indica esquema, consultas y salida. `internal/store/models.go`, `db.go` y `queries.sql.go` son generados; los cambios se realizan en los SQL mantenidos y después se regenera.

## Añadir o modificar un reporte

1. Definir filtros, fórmula, participantes y reglas de desempate.
2. Escribir la consulta nombrada y regenerar sqlc.
3. Añadir transformación a DTO en ReportsService.
4. Registrar handler/ruta y actualizar OpenAPI.
5. Implementar tipo, servicio y contenedor web, con claves de consulta dependientes de filtros.
6. Añadir caso PDF, columnas y traducciones es/en.
7. Documentar fórmula, ejemplos, resultados vacíos y limitaciones.

El reporte no debe inferir el estado disputado, afiliación histórica o normalización por participación si el SQL no los implementa.

## Dependencias

Web y docs tienen manifiestos y lockfiles propios. Go usa `go.mod` y `go.sum`. Las instalaciones se ejecutan en el directorio correspondiente; un cambio de dependencia del sitio no altera los paquetes del frontend.

Web declara pnpm 10.28.0 en `packageManager`. Para reproducir versiones se respetan los lockfiles. `docs/pnpm-workspace.yaml` autoriza la compilación de esbuild en instalaciones de pnpm que controlan scripts de dependencias.

## Cambios y revisión

Una entrega debe describir comportamiento, contratos afectados, reglas y validación realizada. Los cambios de documentación no requieren modificar la aplicación. Los commits pueden seguir Conventional Commits en inglés: `docs: describe match lifecycle`, `fix(matches): ...`, `feat(reports): ...`.

Consulte [verificación](./verificacion.md), [migraciones](../datos/migraciones.md) y [cómo documentar](../guia/documentar.md).
