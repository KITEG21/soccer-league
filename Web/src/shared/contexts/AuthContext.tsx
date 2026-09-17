"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Role } from "@/shared/auth/session";
import {
  hasPermission,
  type Permission,
  type PermissionRequirement,
} from "@/shared/auth/permissions";
import { logoutAction } from "@/features/auth/actions/logout";

export interface AuthSession {
  readonly userId: number | null;
  readonly role: Role;
  readonly permissions: readonly Permission[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role | null;
  userId: number | null;
  permissions: readonly Permission[];
  can: (requirement: PermissionRequirement) => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly session: AuthSession | null;
}

export const AuthProvider = ({ children, session }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    queryClient.clear();
    await logoutAction();
  }, [queryClient]);

  const can = useCallback(
    (requirement: PermissionRequirement) =>
      hasPermission(session?.permissions ?? [], requirement),
    [session],
  );

  const value = useMemo(
    () => ({
      isAuthenticated: session !== null,
      role: session?.role ?? null,
      userId: session?.userId ?? null,
      permissions: session?.permissions ?? [],
      can,
      logout,
    }),
    [session, can, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
