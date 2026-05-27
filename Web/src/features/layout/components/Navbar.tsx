import { Trophy } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 shadow-sm bg-card transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary transition-colors duration-300" />
          <h1 className="text-2xl font-bold text-foreground transition-colors duration-300">
            LigaPro
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
