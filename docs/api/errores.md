# Errores y estados HTTP

## Formatos existentes

Los handlers actuales mezclan JSON estructurado y respuestas de texto plano. Un cliente debe comprobar el Content-Type y admitir ambos formatos.

```json
{
  "error": "validation error",
  "errors": { "role": "invalid role" },
  "code": 400
}
```

El campo `errors` es opcional. Los conflictos de fechas añaden errores en `date_range`; una baja bloqueada puede añadir un mensaje en `delete`. Los handlers que usan `http.Error` responden texto terminado en salto de línea.

## Códigos

| Estado | Situaciones observadas |
| --- | --- |
| 400 | JSON o ID malformado, parámetro de reporte ausente, filtro inválido, validación estructurada |
| 401 | Credenciales incorrectas, JWT inválido, token de renovación inválido o expirado |
| 403 | Permiso insuficiente; restricciones sobre la propia cuenta en usuarios |
| 404 | Detalle no encontrado; reporte PDF desconocido |
| 409 | Conflicto cruzado entre nombre de equipo/estadio, correo duplicado, solapamiento y baja de entidad en uso cuando el handler lo traduce |
| 429 | Límite de login; incluye `Retry-After` |
| 500 | Fallo interno y ciertos errores de negocio que el handler no traduce |
| 502 | Proxy web no puede comunicarse con Go |

El proxy web también puede devolver 500 si falta la URL de destino. La página `/forbidden` y las redirecciones de login pertenecen al servidor web, no al formato JSON de la API.

## Diferencias por módulo

Temporadas traduce validaciones y solapamientos a respuestas 400/409. Equipos y estadios traducen ErrNameConflict de la comprobación cruzada y bajas bloqueadas. Un nombre repetido dentro de su propia tabla produce una violación UNIQUE que esos servicios no convierten a ErrNameConflict, por lo que puede devolverse como 500. Usuarios tiene traducción explícita de validación, conflicto, propia cuenta y recurso inexistente.

Los handlers de jugadores/entrenadores, creación y actualización de partido y estadísticas usan `http.Error(..., 500)` para varios errores de servicio. Un dorsal duplicado, partido pendiente o rechazo del trigger puede aparecer como 500 aunque la causa sea una regla de negocio. La baja de partido sí dispone de traducción de entidad en uso.

Las consultas de detalle de varios catálogos convierten cualquier error de consulta a 404; no todos los fallos distinguen ausencia de un problema de base de datos. Los reportes JSON pueden exponer texto de error interno; el PDF usa mensajes de error más genéricos.

## Manejo en frontend

`shared/utils/api-client.ts` crea `ApiError` con estado, mensaje y errores por campo. `error-translator.ts` traduce mensajes conocidos. El formulario presenta los errores específicos cuando su flujo los asigna a campos; el resto se muestra como error de operación.

Una respuesta 204 no se decodifica. Una respuesta PDF se transporta como bytes en el Route Handler, conservando tipo y Content-Disposition. La renovación automática tras 401 solo reintenta una vez.

Fuentes: `Api/internal/handler/respond.go`, `docs.go`, handlers de recurso y `Web/src/app/api/backend/[...path]/route.ts`.
