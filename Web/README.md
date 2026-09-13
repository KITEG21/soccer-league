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
| `API_URL` | Servidor | URL base de la API (Go) |
| `ADMIN_USER` | Servidor | Usuario del portal |
| `ADMIN_PASS` | Servidor | Contraseña del portal |
| `AUTH_SECRET` | Servidor | Clave HMAC-SHA256 para firmar la cookie de sesión |

Genera `AUTH_SECRET` con:

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
    api/auth/          # login y logout
    api/backend/       # reenvía las llamadas a la API de Go
    globals.css        # tema Tailwind (claro/oscuro vía clase .dark)
  features/            # módulos por dominio
  shared/              # UI reutilizable, contextos, utilidades y traducciones
```

## Autenticación

Las credenciales se validan en `src/app/api/auth/login`, que responde con una cookie `httpOnly`
firmada con `AUTH_SECRET`. `src/proxy.ts` verifica la firma y redirige a `/login` las rutas no públicas.
