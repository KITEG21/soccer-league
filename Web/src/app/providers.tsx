"use client";

import type { ReactNode } from "react";
import { AppProviders, AppLayout } from "@/features/layout";
import type { AuthSession } from "@/shared/contexts/AuthContext";

interface RootProvidersProps {
  readonly children: ReactNode;
  readonly session: AuthSession | null;
}

export const RootProviders = ({ children, session }: RootProvidersProps) => {
  return (
    <AppProviders session={session}>
      <AppLayout>{children}</AppLayout>
    </AppProviders>
  );
};
