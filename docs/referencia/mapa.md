# Mapa documental y fuentes

## Lectura por objetivo

| Objetivo | Punto de entrada |
| --- | --- |
| Entender el negocio | [Contexto](../negocio/contexto.md), [procesos](../negocio/procesos.md), [reglas](../negocio/reglas.md) |
| Usar o revisar una función | [Índice de módulos](../modulos/index.md) |
| Entender las capas | [Sistema](../arquitectura/general.md), [frontend](../arquitectura/frontend.md), [backend](../arquitectura/backend.md) |
| Revisar permisos y sesión | [Seguridad](../arquitectura/seguridad.md) |
| Integrarse con la API | [Contratos](../api/contratos.md), [endpoints](../api/endpoints.md), [filtros](../api/filtros.md), [errores](../api/errores.md) |
| Modificar persistencia | [Modelo](../datos/modelo.md), [diagrama](../database-diagram.md), [migraciones](../datos/migraciones.md) |
| Interpretar reportes | [Fórmulas](../reportes-explicacion.md) |
| Preparar o mantener entorno | [Instalación](../guia/instalacion.md), [configuración](../operacion/configuracion.md), [desarrollo](../operacion/desarrollo.md) |
| Verificar o diagnosticar | [Verificación](../operacion/verificacion.md), [diagnóstico](../operacion/diagnostico.md) |
| Mantener diseño y documentación | [Identidad](../identidad-visual.md), [edición](../guia/documentar.md) |

## Fuentes de verdad

| Tema | Fuente del repositorio |
| --- | --- |
| Enunciado inicial | `docs/Project Specifications.md` |
| Rutas y composición Go | `Api/cmd/api/main.go` |
| Estados HTTP | `Api/internal/handler/` |
| Reglas explícitas | `Api/internal/service/` |
| Persistencia ejecutable | `Api/sql/migrations/` |
| Tipos para generación | `Api/sql/schema.sql`, `Api/sqlc.yaml` |
| Cálculos SQL | `Api/sql/queries.sql` |
| Rutas y páginas Web | `Web/src/app/`, `Web/src/proxy.ts` |
| Funciones de UI | `Web/src/features/` |
| Sesión web | `Web/src/shared/auth/`, `features/auth/actions/` |
| Rutas y navegación web | `Web/src/shared/config/`, `shared/auth/routes.ts` |
| Mensajes | `Web/messages/es.json`, `en.json` |
| Paleta y marca | `Web/src/app/globals.css`, `shared/components/SoccerLeagueLogo.tsx`, `Web/public/favicon.svg` |
| Dependencias y comandos | `Api/go.mod`, `Web/package.json`, `docs/package.json` |

Los paths de código se presentan como referencias del repositorio, no como enlaces que el servidor estático pueda abrir fuera de docs.

## Documentos previos

- La especificación se conserva y se incorpora al sitio mediante una página de lectura del [enunciado original](../negocio/especificacion-original.md).
- `database-diagram.md` se actualiza con el modelo vigente, incluidas cuentas y tokens.
- `reportes-explicacion.md` se actualiza con consultas por nombre, criterios actuales y casos límite.
- Las guías iniciales ahora enlazan las secciones completas de negocio, módulos, arquitectura y operación.
- `docs/README.md` mantiene el arranque del sitio y la evolución pendiente de editor/publicación.

## Mantenimiento

Cuando cambia una función se actualiza su módulo y, según alcance, contratos, reglas, modelo, reportes o operación. El enunciado original se conserva como fuente histórica. Los [límites conocidos](./estado.md) se revisan para retirar diferencias que ya se hayan resuelto.
