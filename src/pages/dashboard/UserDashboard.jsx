import { useMemo } from "react";
import { useAuth } from "../../lib/auth.jsx";
import { useLatestVersion } from "../../lib/latestVersion";
import { cardClass, baseButtonClass } from "../../styles/classes";

export default function UserDashboard() {
  const { session, profile, profileError } = useAuth();
  const { latest, loading } = useLatestVersion({ channel: profile?.channel });

  const email = session?.user?.email || "-";
  const status = profile?.status || "unknown";
  const channel = profile?.channel || "unknown";
  const downloadReady = Boolean(latest?.url);

  const statusLabel = useMemo(() => {
    if (status === "active") return "Activo";
    if (status === "pending") return "Pendiente";
    if (status === "blocked") return "Bloqueado";
    return "Desconocido";
  }, [status]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-200/80">
          Panel de usuario
        </p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          Hola, {email}
        </h1>
        <p className="text-sm text-red-100/70">
          Revisa tu estado y descarga la ultima version disponible.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Estado</p>
          <p className="mt-2 text-lg font-semibold text-white">{statusLabel}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Canal</p>
          <p className="mt-2 text-lg font-semibold text-white">{channel}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Ultima version</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {loading ? "Cargando..." : latest?.version ? `v${latest.version}` : "No disponible"}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Descargar app
            </h2>
            <p className="mt-2 text-sm text-red-100/70">
              Accede a la app con la version alineada a tu canal.
            </p>
          </div>
          <a
            href={downloadReady ? latest.url : "#"}
            className={`${baseButtonClass} ${
              downloadReady
                ? "bg-red-500 text-white hover:bg-red-400"
                : "cursor-not-allowed bg-red-900 text-red-200/70"
            }`}
            aria-disabled={!downloadReady}
          >
            Descargar app
          </a>
        </div>
        {profileError && (
          <p className="mt-4 text-xs text-rose-200">{profileError}</p>
        )}
      </div>
    </div>
  );
}
