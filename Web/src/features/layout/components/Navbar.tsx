import { Trophy } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Trophy className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300">
            Soccer<span className="text-primary">League</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
