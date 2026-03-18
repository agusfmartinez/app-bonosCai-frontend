import { Link } from "react-router-dom";
import {
  pageContainerClass,
  pageCardNarrowClass,
  baseButtonClass,
} from "../styles/classes";

export default function Forbidden() {
  return (
    <div className={pageContainerClass}>
      <div className={pageCardNarrowClass}>
        <h2 className="text-xl font-bold text-white mb-4">Acceso denegado</h2>

        <p className="text-sm text-white/90 mb-4">
          Tu cuenta no tiene permisos para acceder al panel admin.
        </p>

        <p className="text-sm text-white/70 mb-6">
          Verificá que tu usuario tenga rol <span className="font-semibold">admin</span>,
          estado <span className="font-semibold">active</span> y whitelist habilitada.
        </p>

        <Link
          to="/login"
          className={`${baseButtonClass} w-full bg-sky-500 text-white hover:bg-sky-400 text-center block`}
        >
          Volver al login
        </Link>
      </div>
    </div>
  );
}