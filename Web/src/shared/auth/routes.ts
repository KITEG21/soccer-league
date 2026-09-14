export const PUBLIC_ROUTES = ["/login"];

export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.includes(pathname);
