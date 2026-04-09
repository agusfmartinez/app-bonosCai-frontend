import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import { baseButtonClass, loginButtonClass, stopButtonClass } from "../../styles/classes";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-red-800/80 bg-red-900 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
          Bot Bonos CAI
        </Link>

        {!isAuthenticated ? (
          <nav className="flex flex-wrap items-center gap-4 text-sm text-red-100/80">
            {isLanding ? (
              <>
                <a href="#hero" className="hover:text-white">Inicio</a>
                <a href="#beneficios" className="hover:text-white">Beneficios</a>
                <a href="#contacto" className="hover:text-white">Contacto</a>
              </>
            ) : (
              <Link to="/" className="hover:text-white">Inicio</Link>
            )}
            <Link to="/login" className={loginButtonClass}>
              Iniciar sesion
            </Link>
          </nav>
        ) : (
          <nav className="flex flex-wrap items-center gap-3 text-sm text-red-100/80">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${baseButtonClass} ${
                  isActive ? "bg-red-800 text-white" : "border border-red-700 text-white hover:border-red-500"
                }`
              }
            >
              Dashboard
            </NavLink>
            {role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${baseButtonClass} ${
                    isActive ? "bg-red-800 text-white" : "border border-red-700 text-white hover:border-red-500"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className={stopButtonClass}
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
