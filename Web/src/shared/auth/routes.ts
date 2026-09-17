import type { PermissionRequirement } from "./permissions";

export const PUBLIC_ROUTES = ["/login"];

export const FORBIDDEN_ROUTE = "/forbidden";

export const ROUTE_PERMISSIONS: ReadonlyArray<{
  readonly path: string;
  readonly permission: PermissionRequirement;
}> = [
  { path: "/users", permission: "users:read" },
  { path: "/teams", permission: "teams:read" },
  { path: "/stadiums", permission: "stadiums:read" },
  { path: "/seasons", permission: "seasons:read" },
  { path: "/players", permission: "players:read" },
  { path: "/coaches", permission: "coaches:read" },
  { path: "/matches", permission: "matches:read" },
  { path: "/reports", permission: "reports:read" },
];

export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.includes(pathname);

const matchesPath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export const getRoutePermission = (
  pathname: string,
): PermissionRequirement | null =>
  ROUTE_PERMISSIONS.find(({ path }) => matchesPath(pathname, path))
    ?.permission ?? null;
