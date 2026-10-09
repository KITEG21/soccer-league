# Arquitectura del backend

La API es un servidor HTTP Go con Chi y PostgreSQL. El módulo Go se declara como `github.com/football-api` y requiere Go 1.21 o superior.

## Capas y dependencias

| Capa | Ubicación | Función |
| --- | --- | --- |
| Composición | `Api/cmd/api/main.go` | Cargar entorno, abrir DB, construir servicios/handlers y registrar rutas |
| Transporte HTTP | `Api/internal/handler/` | Middleware, decodificación, parámetros, códigos de estado y respuestas |
| Negocio | `Api/internal/service/` | Casos de uso, permisos, validadores, DTO y transformación de resultados |
| Persistencia | `Api/internal/store/` | Código Go generado por sqlc para ejecutar consultas |
| Infraestructura DB | `Api/internal/db/` | Pool, comprobación de conexión y migraciones |
| SQL mantenido | `Api/sql/` | Esquema para generación, consultas y evolución real del esquema |
| Renderizado | `Api/internal/pdf/` | Documento, tablas y generación PDF sobre go-pdf/fpdf |

La dependencia habitual es **handler → service → store → database/sql → PostgreSQL**. Las instancias se inyectan mediante constructores; no se utiliza un contenedor de inyección ni interfaces de repositorio por módulo.

## Arranque

1. Buscar y cargar el primer `.env` encontrado entre candidatos de directorio.
2. Exigir `JWT_SECRET`.
3. Construir DSN, abrir conexión pgx y comprobar PostgreSQL.
4. Localizar migraciones y aplicar las pendientes.
5. Crear store, servicios y handlers.
6. Registrar middleware, documentación, autenticación y recursos protegidos.
7. Escuchar en `PORT`, con 8080 como valor predeterminado.

El pool admite hasta 25 conexiones abiertas y 25 inactivas, con vida máxima de una hora. El proceso termina si falla conexión o migración.

## HTTP y autorización

Los middleware comunes añaden RequestID, IP real, log y recuperación de panic. El middleware CORS permite cualquier origen con los métodos configurados y responde a OPTIONS con 204.

`RequireAuth` valida el token y recupera el usuario actual. `AuthorizeResource` asigna lectura a GET/HEAD/OPTIONS y escritura a los demás métodos. Las rutas de login/refresh/logout y la documentación de API quedan fuera del grupo protegido.

El router no publica un prefijo `/v1`, una ruta de health check ni rutas PATCH de negocio. El proxy web admite PATCH como transporte, pero eso no crea soporte PATCH en Go.

## Servicios funcionales

Hay servicios de equipos, estadios, temporadas, jugadores/entrenadores, partidos, estadísticas, reportes, autenticación y usuarios. Entrenadores comparte `PlayerService` y `PlayerHandler`, con métodos propios para cada especialización.

Las estructuras de servicio son contratos JSON. Los tipos `sql.Null*` se convierten a valores simples; según el campo, un valor SQL nulo se representa como cero o cadena vacía. Un DTO no permite reconstruir siempre la nulabilidad original.

## SQL y transacciones

`Api/sql/queries.sql` contiene consultas nombradas con anotaciones sqlc. `sqlc generate`, ejecutado desde `Api/`, actualiza `internal/store/`; no se editan manualmente los archivos generados.

La creación de un jugador o entrenador inserta Footballer y su especialización en una sentencia CTE. Sus actualizaciones y bajas combinan varias llamadas sin una transacción explícita en el servicio. No debe asumirse atomicidad de toda operación compuesta.

Los listados principales obtienen filas y aplican `ApplyListQuery` en Go: búsqueda, filtros, orden estable y recorte de página. El coste de cargar y transformar el conjunto completo aumenta con el volumen de datos. Los reportes, en cambio, realizan agregaciones SQL.

## Errores y documentación técnica

El manejo de errores mezcla JSON estructurado y `http.Error` con texto. Algunos validadores se traducen a 400/409 y otros llegan como 500 desde handlers heredados. La [referencia de errores](../api/errores.md) documenta esas diferencias.

`/docs` muestra Scalar y `/openapi.json` entrega un JSON definido en `handler/docs.go`. Ese contrato está escrito manualmente; no se genera automáticamente a partir del router. El script de Scalar se carga desde CDN y requiere acceso a red para la interfaz interactiva.

Consulte [rutas](../api/endpoints.md), [migraciones](../datos/migraciones.md) y [verificación](../operacion/verificacion.md).
