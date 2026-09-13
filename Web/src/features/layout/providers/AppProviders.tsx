import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import { AuthProvider } from "@/shared/contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
}

export const AppProviders = ({
  children,
  isAuthenticated,
}: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider isAuthenticated={isAuthenticated}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
