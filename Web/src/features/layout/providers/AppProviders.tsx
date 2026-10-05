import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider, type Theme } from "@/shared/contexts/ThemeContext";
import { AuthProvider, type AuthSession } from "@/shared/contexts/AuthContext";

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
  readonly session: AuthSession | null;
  readonly initialTheme: Theme;
}

export const AppProviders = ({ children, initialTheme, session }: AppProvidersProps) => {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialTheme={initialTheme}>
          <AuthProvider session={session}>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
};
