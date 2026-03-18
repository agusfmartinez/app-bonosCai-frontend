import { Link } from "react-router-dom";
import { pageContainerClass, pageCardNarrowClass, baseButtonClass } from "../styles/classes";

export default function Forbidden() {
  return (
    <div className={pageContainerClass}>
      <div className={`${pageCardNarrowClass} text-white`}>
        <h2 className="text-xl font-bold mb-2">Acceso denegado</h2>
        <p className="text-sm opacity-80">
          Tu usuario no tiene permisos para acceder al panel admin.
        </p>
        <ul className="mt-3 text-sm opacity-80 list-disc pl-5">
          <li>Verifica que tu rol sea admin.</li>
          <li>Verifica que el status este en active.</li>
          <li>Verifica que tu whitelist este aprobada.</li>
        </ul>
        <Link
          to="/login"
          className={`${baseButtonClass} mt-5 inline-flex w-full justify-center bg-sky-500 text-white hover:bg-sky-400`}
        >
          Volver a login
        </Link>
      </div>
    </div>
  );
}
