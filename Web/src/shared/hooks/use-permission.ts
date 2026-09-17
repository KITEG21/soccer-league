import type { PermissionRequirement } from "@/shared/auth/permissions";
import { useAuth } from "@/shared/contexts/AuthContext";

export const usePermission = (requirement: PermissionRequirement) => {
  const { can } = useAuth();
  return can(requirement);
};
