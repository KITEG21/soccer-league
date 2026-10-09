# Contratos y convenciones de API

## Direcciones y autenticación

La API Go expone recursos en la raíz, por ejemplo `http://localhost:8080/teams/`. El navegador de la aplicación usa `http://localhost:3000/api/backend/teams/`; el servidor Next.js añade el JWT de sus cookies.

Una integración directa debe enviar `Authorization: Bearer <access_token>` a los recursos protegidos y `Content-Type: application/json` en cuerpos JSON. Los endpoints de autenticación reciben sus credenciales en el cuerpo. No hay sesión basada en cookies dentro de Go.

Las rutas de colección están registradas con barra final; esta referencia conserva `/teams/`, `/players/`, etc. No se presupone normalización de barras por el router.

## Formatos

| Elemento | Formato |
| --- | --- |
| Identificadores | Números enteros de 64 bits en Go; números en JSON |
| Campos JSON | `snake_case`, excepto parámetros de reportes como `seasonId` |
| Fechas deportivas | `YYYY-MM-DD`, columnas PostgreSQL DATE |
| Fecha de creación de usuario | Timestamp serializado por Go |
| Escritura | POST para alta, PUT para actualización y DELETE para baja |
| Respuesta sin contenido | 204; no intentar decodificar JSON |

PUT recibe la estructura completa de actualización de cada entidad, excepto usuarios, cuya actualización solo acepta rol. No existe una operación PATCH de dominio. Un campo omitido en una estructura Go simple puede convertirse en cero, falso o cadena vacía; no significa conservar el valor anterior.

## Listados

Equipos, estadios, jugadores, entrenadores, partidos y usuarios devuelven:

```json
{
  "data": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

`total` cuenta los registros después de buscar y filtrar, antes del recorte. Temporadas devuelve un array. Estadísticas devuelve un array —o `null` en algunos vacíos— tanto en listado general como por partido. Los reportes devuelven arrays, salvo estado de equipo, que devuelve un objeto. Clasificación, entrenadores, audiencia y estrellas pueden devolver `null` si no se añadió ninguna fila al slice del servicio.

El servicio normaliza `limit` a 20 si es ≤ 0, lo limita a 100 y convierte offset negativo a cero. Los handlers de respuesta paginada incluyen los valores de consulta anteriores a esa normalización; por ello los metadatos pueden no coincidir con el recorte efectivo cuando se envían valores fuera de rango.

## Payloads de mantenimiento

| Recurso | Campos de POST y PUT | Campos adicionales de lectura |
| --- | --- | --- |
| Equipo | `name`, `province`, `mascot`, `color`, `championships_played`, `championships_won` | `id`, contadores y, en detalle, plantilla |
| Estadio | `name`, `capacity` | `id` |
| Temporada | `start_date`, `end_date` | `id` |
| Jugador | `team_id`, `name`, `number`, `years_in_team`, `position` | `id`, `team_name` en listado |
| Entrenador | `team_id`, `name`, `number`, `years_in_team`, `experience_years`, `championships_won` | `id`, `team_name` en listado |
| Partido | `home_team_id`, `away_team_id`, `season_id`, `stadium_id`, `match_date`, `attendance`, `disputed` | `id`, marcador y nombres según consulta |
| Estadística | `player_id`, `match_id` y nueve métricas | `id` |
| Usuario POST | `email`, `password`, `role` | `id`, `email`, `role`, `created_at` |
| Usuario PUT | `role` | Usuario actualizado |

Los nombres, provincia, mascota, color, posición, correo y contraseña son cadenas. Identificadores, antigüedad, experiencia, contadores, asistencia y métricas son enteros. `disputed` es booleano.

Los campos con `omitempty` pueden no aparecer si son cero o vacíos. Los servicios convierten varios nulos SQL a valores simples; no se garantiza que el JSON preserve un valor `null` de origen. No enviar campos calculados para intentar actualizar marcador o contadores de plantilla.

## Ejemplo de partido

Los IDs del ejemplo deben existir y la fecha debe pertenecer a la temporada:

```json
{
  "home_team_id": 1,
  "away_team_id": 2,
  "season_id": 1,
  "stadium_id": 1,
  "match_date": "2026-10-08",
  "attendance": 1200,
  "disputed": false
}
```

## Ejemplo de estadística

Debe existir el jugador y el partido debe estar disputado:

```json
{
  "player_id": 10,
  "match_id": 42,
  "goals_scored": 2,
  "assists": 1,
  "shots_on_goal": 4,
  "passes_completed": 0,
  "interceptions": 0,
  "tackles": 0,
  "blocks": 0,
  "saves": 0,
  "goals_conceded": 0
}
```

Consulte [endpoints](./endpoints.md), [filtros](./filtros.md) y [errores](./errores.md). La referencia interactiva de Go se sirve en `/docs` con su esquema manual en `/openapi.json`; debe contrastarse con router y handlers al cambiar contratos.
