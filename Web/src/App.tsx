import { AppProviders, AppLayout } from "./features/layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home";
import { TeamContainer } from "./features/teams";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<TeamContainer />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
