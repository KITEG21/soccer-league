"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { navGroups } from "@/shared/config/navigation";
import { useAuth } from "@/shared/contexts/AuthContext";
import { getRoutePermission } from "@/shared/auth/routes";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { can } = useAuth();

  const closeOnNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const required = getRoutePermission(item.href);
        return !required || can(required);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border p-0 px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 group-data-[collapsible=icon]:!p-1"
            >
              <Link href="/" onClick={closeOnNavigate}>
                <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Trophy className="size-3.5" />
                </div>
                <span className="truncate text-base font-semibold">
                  SoccerLeague
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:overflow-y-auto">
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href} onClick={closeOnNavigate}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
};
