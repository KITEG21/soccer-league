import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("is_auth") === "true";
  });

  const login = (user: string, pass: string) => {
    const adminUser = import.meta.env.VITE_ADMIN_USER;
    const adminPass = import.meta.env.VITE_ADMIN_PASS;

    if (user === adminUser && pass === adminPass) {
      setIsAuthenticated(true);
      localStorage.setItem("is_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("is_auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
