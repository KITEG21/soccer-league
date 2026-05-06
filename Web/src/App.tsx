import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamList } from "./features/teams/components/TeamList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <header className="shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Soccer League Manager
            </h1>
          </div>
        </header>
        <main>
          <TeamList />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
