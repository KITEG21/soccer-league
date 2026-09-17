# Soccer League — Web

Frontend de la Liga de Fútbol: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 y TanStack Query.

## Requisitos

- Node.js 22+
- pnpm

## Configuración

```bash
cp .env.example .env
```

| Variable | Ámbito | Descripción |
| --- | --- | --- |
| `API_TARGET` | Servidor | API a usar: `local` (Docker) o `remote` (desplegada). Por defecto `remote` |
| `API_URL_LOCAL` | Servidor | URL base de la API Go en Docker, p. ej. `http://localhost:8080` |
| `API_URL_REMOTE` | Servidor | URL base de la API Go desplegada |
| `JWT_SECRET` | Servidor | Clave HMAC-SHA256 para verificar los JWT — debe ser idéntica a `JWT_SECRET` en la API Go, que es quien los emite |

Genera `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

```bash
pnpm dev     # desarrollo en http://localhost:3000
pnpm build   # build de producción
pnpm start   # sirve el build de producción
pnpm lint    # ESLint
```

## Estructura

```
src/
  proxy.ts             # gate de sesión, previo al renderizado
  app/                 # rutas del App Router
    layout.tsx         # lee la cookie de sesión y monta los providers
    api/backend/       # reenvía las llamadas a la API de Go
    globals.css        # tema Tailwind (claro/oscuro vía clase .dark)
  features/            # módulos por dominio
  shared/              # UI reutilizable, contextos, utilidades y traducciones
```

## Autenticación

Los usuarios reales (con rol `superadmin`, `admin` o `visitante`) viven en la base de datos de
la API Go, no en este proyecto. El login es una Server Action (`src/features/auth/actions/login.ts`)
que reenvía las credenciales a `POST <API>/auth/login` (la URL resuelta según `API_TARGET`); si son
válidas, Go responde con un access token (JWT, ~15 min) y un refresh token (opaco, ~7 días), y la
acción los guarda en dos cookies `httpOnly`. Next.js rechaza las Server Actions cuyo `Origin` no
coincide con el host, lo que protege el login frente a CSRF, y el formulario funciona sin JavaScript.

`src/shared/auth/session.ts` solo **verifica** el JWT (misma `JWT_SECRET` que Go, nunca lo firma
aquí). `src/proxy.ts` usa esa verificación para redirigir a `/login` las rutas no públicas.
`src/app/api/backend/[...path]/route.ts` reenvía el access token como `Authorization: Bearer`
a la API Go en cada llamada, y si expiró, pide uno nuevo con el refresh token antes de reintentar.
