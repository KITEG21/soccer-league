"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { isPublicRoute } from "@/shared/auth/routes";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { LanguageToggle } from "@/shared/components/LanguageToggle";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return (
      <div className="animate-page-in min-h-screen bg-background">
        <div className="absolute right-4 top-4">
          <LanguageToggle />
        </div>
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div
          key={pathname}
          className="animate-page-in flex flex-1 flex-col gap-6 p-4 md:p-6"
        >
          {children}
        </div>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
};
