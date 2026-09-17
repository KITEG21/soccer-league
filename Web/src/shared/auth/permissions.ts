export const RESOURCES = [
  "users",
  "teams",
  "stadiums",
  "seasons",
  "players",
  "coaches",
  "matches",
  "player-stats",
  "reports",
] as const;

export const ACTIONS = ["read", "write"] as const;

export type Resource = (typeof RESOURCES)[number];
export type PermissionAction = (typeof ACTIONS)[number];
export type Permission = `${Resource}:${PermissionAction}`;
export type PermissionRequirement = Permission | readonly Permission[];

export const permission = (
  resource: Resource,
  action: PermissionAction,
): Permission => `${resource}:${action}`;

const KNOWN_PERMISSIONS = new Set<string>(
  RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => permission(resource, action)),
  ),
);

export const isPermission = (value: unknown): value is Permission =>
  typeof value === "string" && KNOWN_PERMISSIONS.has(value);

export const parsePermissions = (value: unknown): Permission[] =>
  Array.isArray(value) ? value.filter(isPermission) : [];

export const hasPermission = (
  granted: readonly Permission[],
  required: PermissionRequirement,
) => {
  const requiredList = typeof required === "string" ? [required] : required;
  return requiredList.every((item) => granted.includes(item));
};
