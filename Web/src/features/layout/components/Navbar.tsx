import {
  Trophy,
  LogOut,
  Calendar,
  Users,
  Flag,
  Landmark,
  User,
  Megaphone,
} from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { t } from "@/shared/translations";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navLinks = [
    { to: "/seasons", label: t.nav.seasons, icon: Calendar },
    { to: "/teams", label: t.nav.teams, icon: Users },
    { to: "/players", label: t.nav.players, icon: User },
    { to: "/coaches", label: t.nav.coaches, icon: Megaphone },
    { to: "/matches", label: t.nav.matches, icon: Flag },
    { to: "/stadiums", label: t.nav.stadiums, icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Trophy className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300">
              Soccer<span className="text-primary">League</span>
            </h1>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative group flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors shrink-0",
                  "lg:px-3",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden lg:inline">{link.label}</span>
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 lg:hidden bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title={t.nav.logout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
