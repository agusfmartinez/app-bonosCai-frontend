import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function AuthGuard({ children }) {
  const { ready, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!ready) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}
