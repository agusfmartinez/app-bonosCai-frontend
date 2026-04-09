import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Login";
import { useAuth } from "../../lib/auth.jsx";

export default function LoginPage() {
  const { ready, isAuthenticated, role, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !isAuthenticated || profileLoading) return;
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [ready, isAuthenticated, role, profileLoading, navigate]);

  return <Login />;
}
