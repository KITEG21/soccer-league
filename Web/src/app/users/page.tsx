"use client";

import { UserContainer } from "@/features/users";
import { PermissionGuard } from "@/shared/components/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard
      permission="users:read"
      message="No tienes permisos para gestionar usuarios."
    >
      <UserContainer />
    </PermissionGuard>
  );
}
