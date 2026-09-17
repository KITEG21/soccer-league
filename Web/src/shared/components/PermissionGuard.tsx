"use client";

import type { ReactNode } from "react";
import type { PermissionRequirement } from "@/shared/auth/permissions";
import { usePermission } from "@/shared/hooks/use-permission";
import { AccessDenied } from "./AccessDenied";

interface CanProps {
  readonly permission: PermissionRequirement;
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) =>
  usePermission(permission) ? children : fallback;

interface PermissionGuardProps {
  readonly permission: PermissionRequirement;
  readonly children: ReactNode;
  readonly message?: string;
}

export const PermissionGuard = ({
  permission,
  children,
  message,
}: PermissionGuardProps) => (
  <Can permission={permission} fallback={<AccessDenied message={message} />}>
    {children}
  </Can>
);
