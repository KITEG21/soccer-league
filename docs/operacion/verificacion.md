# Verificación y escenarios de prueba

Esta página distingue los comandos existentes de los escenarios que deben comprobarse. Que un escenario esté documentado no significa que exista un test automatizado para él.

## Comandos

| Área | Directorio | Comando | Qué verifica |
| --- | --- | --- | --- |
| API | `Api/` | `go test ./...` | Compilación de paquetes y tests Go existentes |
| API | `Api/` | `go vet ./...` | Problemas detectables mediante análisis estático |
| Web | `Web/` | `pnpm lint` | Reglas ESLint |
| Web | `Web/` | `pnpm exec tsc --noEmit --incremental false` | Tipos TypeScript |
| Web | `Web/` | `pnpm build` | Build de producción Next.js |
| Documentación | Raíz | `pnpm --dir docs build` | Compilación estática y enlaces internos |
| Documentación | Raíz | `pnpm --dir docs preview` | Revisión del artefacto generado |

Los scripts Web no incluyen un runner de tests unitarios o de navegador. Los tests Go incluyen `internal/pdf/report_test.go` para estructura de PDF, tablas largas y paginación, conjunto vacío y rechazo de documento sin columnas, y `internal/service/player_history_test.go` para integración del historial con PostgreSQL. La prueba de historial se activa con la configuración descrita a continuación; los escenarios de sesión requieren sus propias comprobaciones funcionales.

## Prueba de integración del historial

Desde `Api/`, con una base PostgreSQL de prueba y todas las migraciones aplicadas:

```sh
$env:HISTORY_TEST_DATABASE_URL = "postgres://usuario:clave@localhost:5432/base_de_prueba?sslmode=disable"
go test ./... -count=1
go vet ./...
```

`Api/internal/service/player_history_test.go` comprueba conservación de marcadores y reportes después de transferir un jugador al rival o a un tercer equipo, corrección de métricas, persistencia de bloqueos/paradas/encajados, equipo de nuevas participaciones y protección de bajas y cambios de participantes. También verifica que se puede eliminar un jugador sin estadísticas. Para ejecutarlo por separado, define `HISTORY_TEST_DATABASE_URL` con una base aislada que tenga todas las migraciones; el test revierte sus datos al terminar. Sin esa variable, la prueba de integración se omite.

`Api/internal/service/user_test.go` comprueba validación de nombres, caracteres Unicode, creación, búsqueda, edición, cuentas existentes sin nombres y conservación de los permisos al editar la cuenta propia. La prueba de integración utiliza la misma variable de conexión y revierte sus datos al terminar.

## Escenarios funcionales

| Área | Escenario | Resultado a contrastar |
| --- | --- | --- |
| Sesión | Credenciales válidas/incorrectas, expiración, refresh y logout | Cookies, redirecciones y estado HTTP coherentes |
| Permisos | Cada rol accede directamente a páginas y endpoints | Visitante no escribe; admin no gestiona usuarios |
| Usuarios | Crear correo duplicado, cambiar propio rol y eliminarse | Conflicto o prohibición según contrato |
| Temporadas | Rangos solapados, límites coincidentes, edición con partidos | Rechazo de conflictos y de rango inconsistente |
| Plantillas | Dorsal repetido entre jugador y entrenador | Rechazo dentro del mismo equipo |
| Entrenadores | Experiencia menor que antigüedad | Rechazo por regla de negocio |
| Partidos | Equipos iguales y fecha fuera de temporada | Rechazo en formulario/base de datos |
| Estadísticas | Partido pendiente, jugador duplicado, corrección de goles | Rechazo o actualización del marcador |
| Bajas | Equipo/estadio/temporada en uso y partido con estadísticas | Protección de referencias |
| Reportes | Temporada vacía, empate, victoria, sede sin capacidad | Fórmulas y casos cero documentados |
| PDF | Siete reportes, es/en, resultados vacíos y muchas filas | Archivo legible, columnas y paginación correctas |
| UI | Tema claro/oscuro, es/en y pantalla estrecha | Texto, navegación, diálogos y contraste utilizables |

Las pruebas que necesitan persistencia se realizan con una base de prueba y las migraciones aplicadas. No se utilizan bajas, transferencias ni correcciones de resultados sobre datos reales para verificar un escenario.

## Revisión documental

- Enlaces de portada, navegación y referencias cruzadas.
- Imágenes y diagramas, incluida paleta clara y oscura.
- Búsqueda de términos de negocio, recursos API y tablas.
- Tablas largas en pantallas pequeñas.
- Diferencia entre requisitos originales, comportamiento presente y trabajo pendiente.

Un build correcto comprueba generación y enlaces, pero no certifica interacción visual ni exactitud funcional. Las páginas deben contrastarse con las fuentes indicadas al cambiar código.
