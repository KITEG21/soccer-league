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
import { WEB_API_ROUTES } from "@/shared/config/routes";

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role | null;
  userId: number | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly role: Role | null;
  readonly userId: number | null;
}

export const AuthProvider = ({
  children,
  isAuthenticated: initialAuthenticated,
  role: initialRole,
  userId,
}: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [role, setRole] = useState<Role | null>(initialRole);
  const router = useRouter();

  const login = useCallback(
    async (user: string, pass: string) => {
      const response = await fetch(WEB_API_ROUTES.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as { role: Role };
      setIsAuthenticated(true);
      setRole(data.role);
      router.refresh();
      return true;
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch(WEB_API_ROUTES.logout, { method: "POST" });
    setIsAuthenticated(false);
    setRole(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ isAuthenticated, role, userId, login, logout }),
    [isAuthenticated, role, userId, login, logout],
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
