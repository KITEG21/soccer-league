import { AppProviders, AppLayout } from "./features/layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home";
import { TeamContainer, TeamDetailsPage } from "./features/teams";
import { SeasonContainer } from "./features/seasons";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<TeamContainer />} />
            <Route path="/teams/:id" element={<TeamDetailsPage />} />
            <Route path="/seasons" element={<SeasonContainer />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
