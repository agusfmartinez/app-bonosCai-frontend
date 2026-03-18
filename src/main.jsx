import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./styles/index.css";
import { supabase } from "./lib/supabase";
import { storeToken, clearSession } from "./lib/session";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import Forbidden from "./pages/Forbidden.jsx";

const PUBLIC_ROUTES = ["/login", "/signup", "/forbidden"];

function useAuthGate() {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        clearSession();
        setAllowed(false);
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
        return;
      }

      storeToken(session.access_token);
      setAllowed(true);
      if (location.pathname === "/login" || location.pathname === "/signup") {
        navigate("/admin", { replace: true });
      }
    });

    (async () => {
      try {
        const { data: initial } = await supabase.auth.getSession();
        if (!initial.session) {
          clearSession();
          setAllowed(false);
        } else {
          storeToken(initial.session.access_token);
          setAllowed(true);
        }
      } finally {
        setReady(true);
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { ready, allowed };
}

function Root() {
  const { ready, allowed } = useAuthGate();
  if (!ready) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          allowed ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/admin"
        element={allowed ? <Admin /> : <Navigate to="/login" replace />}
      />
      <Route path="/forbidden" element={<Forbidden />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>
);
