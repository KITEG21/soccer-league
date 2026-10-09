# Diagnóstico de problemas

## Arranque y conexión

| Síntoma | Comprobación |
| --- | --- |
| Go termina indicando JWT_SECRET requerido | Archivo .env localizado y variable no vacía |
| Fallo de ping a DB | PostgreSQL activo, base creada, DSN, credenciales y SSL |
| No encuentra migraciones | Directorio de ejecución y archivos sql/migrations distribuidos |
| Error de migración o estado dirty | Logs, schema_migrations y objetos aplicados; consultar migraciones |
| Puerto ocupado | Proceso que usa 3000, 8080 o 5173; PORT solo modifica Go |
| Proxy con error de configuración | API_TARGET y URL del destino seleccionado en Web |
| Error 502 desde Web | Accesibilidad de Go desde el proceso Next.js |

El ejemplo usa DATABASE_URL; si está definido, modificar solo DB_HOST u otros parámetros no cambia la conexión. El cargador Go puede sobrescribir variables de proceso con valores de su .env encontrado.

## Sesión y permisos

| Síntoma | Comprobación |
| --- | --- |
| Credenciales no funcionan en base nueva | Existencia de primera cuenta y hash bcrypt válido |
| Login correcto pero vuelta a login | Mismo JWT_SECRET en Web y Go, cookies y entorno de ejecución |
| Login devuelve 429 | Retry-After y fallos acumulados por cuenta/IP |
| Página o API devuelve 403 | Rol actual y permiso requerido; navegación no concede autorización |
| Cambio de rol no se ve en botones | Renovación de sesión; la UI usa permisos del JWT |
| Refresh deja de funcionar | Caducidad, revocación o reutilización de token rotado |

No cambiar la clave JWT para resolver un error de credenciales: firma y contraseña son mecanismos distintos. Al cambiar deliberadamente la clave, los JWT anteriores dejan de verificar.

## Datos y reportes

| Síntoma | Explicación que revisar |
| --- | --- |
| No se puede borrar equipo/temporada/estadio | Referencias que protegen su baja |
| No se puede marcar pendiente un partido | Existencia de estadísticas y trigger |
| Marcador 0–0 sin haberse disputado | Resultado calculado sin filas; revisar disputed |
| Puntos de un pendiente | Clasificación actual no filtra disputed |
| Historial cambia tras transferencia | Los goles se agrupan por equipo actual del jugador |
| Falta una opción en un selector | Listado solicitado hasta cien registros, no ilimitado |
| Estrellas incompleto | Faltan estadísticas/candidatos con posición exacta de esa temporada |
| Porteros o defensas sin métricas esperadas | Campos no expuestos por el diálogo estadístico actual |
| Datos antiguos después de guardar | Claves de caché e invalidaciones entre módulos |
| PDF falla | Permiso reports:read, filtros requeridos, Content-Type y error del servidor |

## Sitio documental

Si una imagen no aparece en Markdown, comprobar ruta relativa y que se comparte la carpeta assets junto al archivo. El sitio compilado incorpora los recursos; descargar solamente un MD no convierte sus imágenes enlazadas en contenido embebido.

Un enlace a código fuera de `docs/` puede fallar en el build. Los documentos usan rutas de fuente como código y enlaces navegables para páginas internas. Después de crear una página se añade al sidebar y se ejecuta `pnpm --dir docs build`.

El servidor de documentación usa puerto estricto 5173: si ya está ocupado, se detiene el proceso existente o se arranca con otra configuración explícita.
