"use client";

import type { ReactNode } from "react";
import { AppProviders, AppLayout } from "@/features/layout";
import type { AuthSession } from "@/shared/contexts/AuthContext";
import type { Theme } from "@/shared/contexts/ThemeContext";

interface RootProvidersProps {
  readonly children: ReactNode;
  readonly session: AuthSession | null;
  readonly initialTheme: Theme;
}

export const RootProviders = ({ children, initialTheme, session }: RootProvidersProps) => {
  return (
    <AppProviders initialTheme={initialTheme} session={session}>
      <AppLayout>{children}</AppLayout>
    </AppProviders>
  );
};
