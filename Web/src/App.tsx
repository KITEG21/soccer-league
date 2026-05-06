import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamList } from "./features/teams/components/TeamList";
import { ThemeProvider, useTheme } from "./shared/contexts/ThemeContext";
import { ThemeToggle } from "./shared/components/ThemeToggle";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="shadow-sm bg-card transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground transition-colors duration-300">
            Soccer League Manager
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-secondary text-foreground text-sm">
              {theme === "dark" ? "DARK" : "LIGHT"}
            </div>
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
