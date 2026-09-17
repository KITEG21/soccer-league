"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/shared/auth/session";
import {
  hasPermission,
  type Permission,
  type PermissionRequirement,
} from "@/shared/auth/permissions";
import { WEB_API_ROUTES } from "@/shared/config/routes";

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
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly session: AuthSession | null;
}

const sessionKey = (session: AuthSession | null) =>
  session
    ? `${session.userId}|${session.role}|${session.permissions.join(",")}`
    : "";

export const AuthProvider = ({ children, session: serverSession }: AuthProviderProps) => {
  const [session, setSession] = useState<AuthSession | null>(serverSession);
  const [syncedKey, setSyncedKey] = useState(sessionKey(serverSession));
  const router = useRouter();

  const serverKey = sessionKey(serverSession);
  if (serverKey !== syncedKey) {
    setSyncedKey(serverKey);
    setSession(serverSession);
  }

  const login = useCallback(
    async (user: string, pass: string) => {
      const response = await fetch(WEB_API_ROUTES.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        role: Role;
        permissions: Permission[];
      };
      setSession({ userId: null, role: data.role, permissions: data.permissions });
      router.refresh();
      return true;
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch(WEB_API_ROUTES.logout, { method: "POST" });
    setSession(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

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
      login,
      logout,
    }),
    [session, can, login, logout],
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
