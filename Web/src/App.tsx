import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamList } from "./features/teams/components/TeamList";
import { ThemeProvider } from "./shared/contexts/ThemeContext";
import { ThemeToggle } from "./shared/components/ThemeToggle";
import { Icon } from "lucide-react";
import { soccerBall, soccerPitch } from "@lucide/lab";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="shadow-sm bg-card transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon
              iconNode={soccerBall}
              className="w-8 h-8 text-foreground transition-colors duration-300"
            />
            <h1 className="text-2xl font-bold text-foreground transition-colors duration-300">
              Gestor de Liga de Fútbol
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>
        <TeamList />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
