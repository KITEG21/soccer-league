import {
  Award,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export interface NavGroup {
  readonly label: string;
  readonly items: readonly NavItem[];
}

export const navGroups: readonly NavGroup[] = [
  {
    label: "General",
    items: [{ href: "/", label: "Resumen", icon: LayoutDashboard }],
  },
  {
    label: "Gestión",
    items: [
      { href: "/seasons", label: "Temporadas", icon: Calendar },
      { href: "/teams", label: "Equipos", icon: Users },
      { href: "/players", label: "Jugadores", icon: User },
      { href: "/coaches", label: "Entrenadores", icon: Megaphone },
      { href: "/matches", label: "Partidos", icon: Flag },
      { href: "/stadiums", label: "Estadios", icon: Landmark },
    ],
  },
  {
    label: "Reportes",
    items: [
      { href: "/reports/standings", label: "Posiciones", icon: Trophy },
      { href: "/reports/head-to-head", label: "Cara a cara", icon: Flag },
      { href: "/reports/schedule", label: "Calendario", icon: CalendarDays },
      { href: "/reports/attendance", label: "Asistencia", icon: TrendingUp },
      { href: "/reports/team-status", label: "Estado del equipo", icon: ClipboardCheck },
      { href: "/reports/coach-experience", label: "Experiencia", icon: Award },
      { href: "/reports/all-star", label: "Equipo ideal", icon: Star },
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

export const buildBreadcrumbs = (pathname: string): Crumb[] => {
  if (pathname === "/") return [{ href: "/", label: "Resumen" }];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const item = findNavItem(href);

    if (item) {
      crumbs.push({ href, label: item.label });
      return;
    }

    if (segment === "reports") {
      crumbs.push({ href, label: "Reportes" });
      return;
    }

    crumbs.push({ href, label: "Detalle" });
  });

  return crumbs;
};
