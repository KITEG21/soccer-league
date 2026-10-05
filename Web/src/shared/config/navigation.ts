import {
  Award,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  readonly href: string;
  readonly labelKey: string;
  readonly icon: LucideIcon;
}

export interface NavGroup {
  readonly labelKey: string;
  readonly items: readonly NavItem[];
}

export const navGroups: readonly NavGroup[] = [
  {
    labelKey: "general",
    items: [
      { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/users", labelKey: "users", icon: Shield },
    ],
  },
  {
    labelKey: "management",
    items: [
      { href: "/seasons", labelKey: "seasons", icon: Calendar },
      { href: "/teams", labelKey: "teams", icon: Users },
      { href: "/players", labelKey: "players", icon: User },
      { href: "/coaches", labelKey: "coaches", icon: Megaphone },
      { href: "/matches", labelKey: "matches", icon: Flag },
      { href: "/stadiums", labelKey: "stadiums", icon: Landmark },
    ],
  },
  {
    labelKey: "reports",
    items: [
      { href: "/reports/standings", labelKey: "standings", icon: Trophy },
      { href: "/reports/head-to-head", labelKey: "headToHead", icon: Flag },
      { href: "/reports/schedule", labelKey: "schedule", icon: CalendarDays },
      { href: "/reports/attendance", labelKey: "attendance", icon: TrendingUp },
      { href: "/reports/team-status", labelKey: "teamStatus", icon: ClipboardCheck },
      { href: "/reports/coach-experience", labelKey: "coachExperience", icon: Award },
      { href: "/reports/all-star", labelKey: "allStar", icon: Star },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

export const findNavItem = (href: string) =>
  navItems.find((item) => item.href === href);

export interface Crumb {
  readonly href: string;
  readonly label: string;
}

export const buildBreadcrumbs = (
  pathname: string,
  translate: (key: string) => string,
): Crumb[] => {
  if (pathname === "/") return [{ href: "/", label: translate("dashboard") }];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const item = findNavItem(href);

    if (item) {
      crumbs.push({ href, label: translate(item.labelKey) });
      return;
    }

    if (segment === "reports") {
      crumbs.push({ href, label: translate("reports") });
      return;
    }

    crumbs.push({ href, label: translate("detail") });
  });

  return crumbs;
};
