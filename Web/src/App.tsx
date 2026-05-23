import { AppProviders, AppLayout } from "./features/layout";
import { TeamContainer } from "./features/teams";

function App() {
  return (
    <AppProviders>
      <AppLayout>
        <TeamContainer />
      </AppLayout>
    </AppProviders>
  );
}

export default App;
