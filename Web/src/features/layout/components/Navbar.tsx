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
import { cn } from "@/shared/utils/utils";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navLinks = [
    { to: "/seasons", label: "Temporadas", icon: Calendar },
    { to: "/teams", label: "Equipos", icon: Users },
    { to: "/players", label: "Jugadores", icon: User },
    { to: "/coaches", label: "Entrenadores", icon: Megaphone },
    { to: "/matches", label: "Partidos", icon: Flag },
    { to: "/stadiums", label: "Estadios", icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Trophy className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300">
              Soccer<span className="text-primary">League</span>
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
