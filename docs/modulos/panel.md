# Panel, navegación y preferencias

## Panel inicial

La ruta `/` resume la liga con cantidades, temporada seleccionada, clasificación y una selección de encuentros pendientes. Combina consultas de equipos, jugadores, partidos, temporadas y reportes; no dispone de un endpoint exclusivo de dashboard.

| Indicador | Origen | Interpretación actual |
| --- | --- | --- |
| Equipos | Total de listado paginado | Cantidad de equipos registrados |
| Jugadores | Total de listado paginado | Cantidad de jugadores registrados |
| Partidos | Array recuperado por el servicio web | Cantidad cargada, sujeta al límite solicitado |
| Temporada seleccionada | Temporada con mayor fecha de fin | No se determina por pertenencia de la fecha actual |
| Próximos partidos | Pendientes, ordenados por fecha, primeros cinco | Puede incluir pendientes con fecha pasada |
| Clasificación | Reporte de la temporada seleccionada | Aplica los criterios SQL del reporte |

La selección de cinco partidos es una muestra. Su longitud no representa necesariamente la cantidad total de pendientes. Las consultas de catálogos que solicitan hasta cien registros tampoco equivalen a un conjunto ilimitado.

## Navegación

El layout ofrece menú lateral, cabecera, enlaces funcionales y adaptación a pantallas pequeñas. La configuración compartida define destinos y requisitos de permisos. Las acciones y enlaces se muestran según la sesión; el proxy verifica el acceso a rutas.

Los equipos y partidos enlazan a sus páginas de detalle. Las rutas desconocidas y los errores cuentan con páginas de presentación propias.

## Preferencias

El selector de idioma alterna español e inglés mediante cookie. El selector de tema alterna claro y oscuro y persiste la elección. Los colores semánticos y el logotipo están descritos en [identidad visual](../identidad-visual.md).

## Código relacionado

`Web/src/features/dashboard/`, `features/layout/`, `shared/config/navigation.ts`, `shared/auth/routes.ts`, `shared/contexts/ThemeContext.tsx` y componentes de idioma/tema. Consulte [frontend](../arquitectura/frontend.md) para proveedores y caché.
