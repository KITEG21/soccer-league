import { AppProviders, AppLayout } from "./features/layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/home";
import { TeamContainer, TeamDetailsPage } from "./features/teams";
import { SeasonContainer } from "./features/seasons";
import { StadiumContainer } from "./features/stadiums";
import { MatchContainer, MatchDetailContainer } from "./features/matches";
import { PlayerGlobalList } from "./features/players/components/PlayerGlobalList";
import { CoachGlobalList } from "./features/coaches/components/CoachGlobalList";
import { useAuth } from "./shared/contexts/AuthContext";
import { LoginPage } from "./features/auth/LoginPage";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <PrivateRoute>
                  <TeamContainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/teams/:id"
              element={
                <PrivateRoute>
                  <TeamDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/seasons"
              element={
                <PrivateRoute>
                  <SeasonContainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/stadiums"
              element={
                <PrivateRoute>
                  <StadiumContainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <PrivateRoute>
                  <MatchContainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/matches/:id"
              element={
                <PrivateRoute>
                  <MatchDetailContainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/players"
              element={
                <PrivateRoute>
                  <div className="container mx-auto py-8">
                    <PlayerGlobalList />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/coaches"
              element={
                <PrivateRoute>
                  <div className="container mx-auto py-8">
                    <CoachGlobalList />
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

