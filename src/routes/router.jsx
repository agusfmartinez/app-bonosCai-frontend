import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import PrivateLayout from "../components/layout/PrivateLayout";
import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import UserDashboard from "../pages/dashboard/UserDashboard";
import AdminPanel from "../pages/admin/AdminPanel";
import AuthGuard from "../guards/AuthGuard";
import RoleGuard from "../guards/RoleGuard";
import Signup from "../pages/Signup";
import Forbidden from "../pages/Forbidden";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<AuthGuard><PrivateLayout /></AuthGuard>}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route element={<RoleGuard />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
