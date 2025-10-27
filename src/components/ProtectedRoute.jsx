import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user, token } = useAuthStore();
  const location = useLocation();

  // If not loading and no token, redirect to login immediately
  if (!loading && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading state while authentication is being checked
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin role is required and user doesn't have admin role
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
