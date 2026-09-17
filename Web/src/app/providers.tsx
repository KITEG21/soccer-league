"use client";

import type { ReactNode } from "react";
import { AppProviders, AppLayout } from "@/features/layout";
import type { Role } from "@/shared/auth/session";

interface RootProvidersProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly role: Role | null;
  readonly userId: number | null;
}

export const RootProviders = ({
  children,
  isAuthenticated,
  role,
  userId,
}: RootProvidersProps) => {
  return (
    <AppProviders isAuthenticated={isAuthenticated} role={role} userId={userId}>
      <AppLayout>{children}</AppLayout>
    </AppProviders>
  );
};
