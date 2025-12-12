import { Navigate } from "react-router-dom";
import { authService } from "../services";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route component that checks authentication before rendering
 * Prevents race conditions by checking auth state before any rendering
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = authService.isAuthenticated();
  const isTokenValid = authService.isTokenValid();

  if (!isAuthenticated || !isTokenValid) {
    // Clear invalid token if present
    if (!isTokenValid) {
      authService.removeToken();
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
