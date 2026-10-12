import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageToggle } from "@/shared/components/LanguageToggle";
import { buildBreadcrumbs } from "@/shared/config/navigation";
import { useAuth } from "@/shared/contexts/AuthContext";

export const AppHeader = () => {
  const pathname = usePathname();
  const { logout, user, email, role } = useAuth();
  const navigation = useTranslations("Navigation");
  const t = useTranslations("Header");
  const crumbs = buildBreadcrumbs(pathname, navigation);
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const currentRole = user?.role ?? role;

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <LanguageToggle showTooltip />
        <ThemeToggle showTooltip />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("account")}>
              <UserRound className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="break-words">{fullName || email || t("account")}</span>
              {fullName && <span className="break-all text-xs font-normal text-muted-foreground">{email}</span>}
              <span className="text-xs font-normal text-muted-foreground">
                {currentRole === "superadmin" ? t("superadmin") : currentRole === "admin" ? t("admin") : t("visitor")}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="mr-2 size-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </header>
    </TooltipProvider>
  );
};
