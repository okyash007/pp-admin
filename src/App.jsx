import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PayoutsPage from "./pages/PayoutsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { useAuthStore } from "./stores/authStore";

function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}

function Payouts() {
  return (
    <DashboardLayout>
      <PayoutsPage />
    </DashboardLayout>
  );
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payouts"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Payouts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;