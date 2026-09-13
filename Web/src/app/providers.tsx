"use client";

import type { ReactNode } from "react";
import { AppProviders, AppLayout } from "@/features/layout";

interface RootProvidersProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
}

export const RootProviders = ({
  children,
  isAuthenticated,
}: RootProvidersProps) => {
  return (
    <AppProviders isAuthenticated={isAuthenticated}>
      <AppLayout>{children}</AppLayout>
    </AppProviders>
  );
};
