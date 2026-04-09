import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function RoleGuard({ children }) {
  const { role, profileLoading, profileError, ready, isAuthenticated } = useAuth();

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (profileLoading || (!profileError && role == null)) return null;
  if (profileError) return children || <Outlet />;
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
