import { AppProviders, AppLayout } from "./features/layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./features/home";
import { TeamContainer, TeamDetailsPage } from "./features/teams";
import { SeasonContainer } from "./features/seasons";
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
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
