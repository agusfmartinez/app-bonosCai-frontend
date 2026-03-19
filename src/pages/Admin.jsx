import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, parseApiResponse } from "../lib/api";
import { cardClass, baseButtonClass } from "../styles/classes";
import { forceLogout } from "../lib/session";

const badgeBase =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide";

const actionButtonClass = `${baseButtonClass} px-3 py-1 text-xs`;

function pickSessionDate(session) {
  if (!session) return null;
  return (
    session.updated_at ||
    session.last_signed_in ||
    session.lastSignedIn ||
    session.created_at ||
    null
  );
}

function formatDate(value) {
  if (!value) return "Sin sesión";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString("es-AR");
}

function buildSessionsMap(sessions = []) {
  const map = new Map();
  sessions.forEach((session) => {
    const userId = session?.user_id || session?.userId || session?.id;
    if (!userId) return;
    const dateValue = pickSessionDate(session);
    if (!dateValue) return;
    const ts = new Date(dateValue).getTime();
    if (Number.isNaN(ts)) return;
    const current = map.get(userId);
    if (!current || ts > current.ts) {
      map.set(userId, { session, ts, dateValue });
    }
  });
  return map;
}

function mergeUsersWithSessions(users = [], sessions = []) {
  const sessionMap = buildSessionsMap(sessions);
  return users.map((user) => {
    const userId = user?.user_id || user?.id;
    const sessionInfo = userId ? sessionMap.get(userId) : null;
    return {
      ...user,
      _userId: userId,
      _lastSession: sessionInfo ? sessionInfo.dateValue : null,
      _appVersion: sessionInfo?.session?.app_version || null,
      _deviceName: sessionInfo?.session?.device_name || null,
      _os: sessionInfo?.session?.os || null,
    };
  });
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [runs, setRuns] = useState([]);

  const navigate = useNavigate();

  const mergedUsers = useMemo(
    () => mergeUsersWithSessions(users, sessions),
    [users, sessions]
  );

  const setActionBusy = (key, value) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  };

  const handleAuthStatus = async (status) => {
    if (status === 401) {
      await forceLogout();
      navigate("/login", { replace: true });
      return true;
    }
    if (status === 403) {
      navigate("/forbidden", { replace: true });
      return true;
    }
    return false;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, sessionsRes, runsRes] = await Promise.all([
        fetchWithAuth("/api/admin/users"),
        fetchWithAuth("/api/admin/sessions"),
        fetchWithAuth("/api/admin/runs"),
      ]);

      const usersParsed = await parseApiResponse(usersRes);
      if (await handleAuthStatus(usersParsed.status)) return;
      if (!usersParsed.ok) {
        throw new Error(
          usersParsed.data?.msg || `Usuarios: ${usersParsed.status}`
        );
      }

      const sessionsParsed = await parseApiResponse(sessionsRes);
      if (await handleAuthStatus(sessionsParsed.status)) return;
      if (!sessionsParsed.ok) {
        throw new Error(
          sessionsParsed.data?.msg || `Sesiones: ${sessionsParsed.status}`
        );
      }

      const runsParsed = await parseApiResponse(runsRes);
      if (await handleAuthStatus(runsParsed.status)) return;
      if (!runsParsed.ok) {
        throw new Error(
          runsParsed.data?.msg || `Runs: ${runsParsed.status}`
        );
      }

      setUsers(
        Array.isArray(usersParsed.data)
          ? usersParsed.data
          : usersParsed.data?.users || []
      );
      setSessions(
        Array.isArray(sessionsParsed.data)
          ? sessionsParsed.data
          : sessionsParsed.data?.sessions || []
      );
      setRuns(
        Array.isArray(runsParsed.data)
          ? runsParsed.data
          : runsParsed.data?.runs || []
      );
    } catch (err) {
      setError(
        err?.message
          ? `No se pudieron cargar los datos: ${err.message}`
          : "No se pudieron cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateUserLocal = (userId, patch) => {
    setUsers((prev) =>
      prev.map((user) => {
        const id = user?.user_id || user?.id;
        if (id !== userId) return user;
        return { ...user, ...patch };
      })
    );
  };

  const clearUserSessions = (userId) => {
    setSessions((prev) =>
      prev.filter((session) => {
        const id = session?.user_id || session?.userId || session?.id;
        return id !== userId;
      })
    );
  };

  const handleToggleWhitelist = async (user) => {
    const userId = user?._userId;
    if (!userId) return;
    const next = !user.is_whitelisted;
    const key = `${userId}-whitelist`;
    setActionBusy(key, true);
    setNotice("");
    setActionError("");
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/whitelist`, {
        method: "PATCH",
        body: JSON.stringify({ is_whitelisted: next }),
      });
      const parsed = await parseApiResponse(res);
      if (await handleAuthStatus(parsed.status)) return;
      if (!parsed.ok) {
        throw new Error(parsed.data?.msg || `HTTP ${parsed.status}`);
      }
      updateUserLocal(userId, { is_whitelisted: next });
      setNotice(`Whitelist ${next ? "aprobada" : "desaprobada"}.`);
    } catch (err) {
      setActionError(
        `No se pudo actualizar whitelist: ${err?.message || "error desconocido"}`
      );
    } finally {
      setActionBusy(key, false);
    }
  };

  const handleToggleStatus = async (user) => {
    const userId = user?._userId;
    if (!userId) return;
    const next = user.status === "active" ? "blocked" : "active";
    const key = `${userId}-status`;
    setActionBusy(key, true);
    setNotice("");
    setActionError("");
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      const parsed = await parseApiResponse(res);
      if (await handleAuthStatus(parsed.status)) return;
      if (!parsed.ok) {
        throw new Error(parsed.data?.msg || `HTTP ${parsed.status}`);
      }
      updateUserLocal(userId, { status: next });
      if (next === "blocked") {
        clearUserSessions(userId);
      }
      setNotice(`Estado actualizado a ${next}.`);
    } catch (err) {
      setActionError(
        `No se pudo actualizar estado: ${err?.message || "error desconocido"}`
      );
    } finally {
      setActionBusy(key, false);
    }
  };

  const handleToggleRole = async (user) => {
    const userId = user?._userId;
    if (!userId) return;
    const next = user.role === "admin" ? "user" : "admin";
    const key = `${userId}-role`;
    setActionBusy(key, true);
    setNotice("");
    setActionError("");
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: next }),
      });
      const parsed = await parseApiResponse(res);
      if (await handleAuthStatus(parsed.status)) return;
      if (!parsed.ok) {
        throw new Error(parsed.data?.msg || `HTTP ${parsed.status}`);
      }
      updateUserLocal(userId, { role: next });
      setNotice(`Rol actualizado a ${next}.`);
    } catch (err) {
      setActionError(
        `No se pudo actualizar rol: ${err?.message || "error desconocido"}`
      );
    } finally {
      setActionBusy(key, false);
    }
  };

  const handleCloseSession = async (user) => {
    const userId = user?._userId;
    if (!userId) return;
    const key = `${userId}-session`;
    setActionBusy(key, true);
    setNotice("");
    setActionError("");
    try {
      const res = await fetchWithAuth(`/api/admin/sessions/${userId}`, {
        method: "DELETE",
      });
      const parsed = await parseApiResponse(res);
      if (await handleAuthStatus(parsed.status)) return;
      if (!parsed.ok) {
        throw new Error(parsed.data?.msg || `HTTP ${parsed.status}`);
      }
      clearUserSessions(userId);
      setNotice("Sesión cerrada.");
    } catch (err) {
      setActionError(
        `No se pudo cerrar sesión: ${err?.message || "error desconocido"}`
      );
    } finally {
      setActionBusy(key, false);
    }
  };

  const userEmailMap = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const userId = user?.user_id || user?.id;
      if (!userId) return;
      map.set(userId, user?.email || userId);
    });
    return map;
  }, [users]);

  const recentRuns = useMemo(() => {
    return runs.map((run) => ({
      ...run,
      _email: userEmailMap.get(run.user_id) || run.user_id,
    }));
  }, [runs, userEmailMap]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12 lg:px-10">
        <header className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-black-400">
              Bonos CAI
            </span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Panel Admin
            </h1>
            <p className="text-sm text-white/80">
              Administrá usuarios, roles y sesiones.
            </p>
          </div>
          <div className="ml-auto">
            <button
              className={`${actionButtonClass} border border-red-700 text-white hover:border-rose-400 hover:text-rose-200`}
              onClick={async () => {
                await forceLogout();
                navigate("/login", { replace: true });
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {notice && (
          <div
            className={`${cardClass} border border-sky-400/30 bg-sky-500/10 text-sm`}
          >
            {notice}
          </div>
        )}
        {actionError && (
          <div
            className={`${cardClass} border border-rose-400/30 bg-rose-500/10 text-sm text-rose-100`}
          >
            {actionError}
          </div>
        )}

        <section className={cardClass}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Usuarios registrados
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Estado de whitelist, roles y sesiones activas.
              </p>
            </div>
            <div className="ml-auto">
              <button
                className={`${actionButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200`}
                onClick={loadData}
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Refrescar"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-sm text-white/70">Cargando datos...</div>
          )}

          {!loading && error && (
            <div className="mt-6 text-sm text-rose-200">{error}</div>
          )}

          {!loading && !error && mergedUsers.length === 0 && (
            <div className="mt-6 text-sm text-white/70">
              No hay usuarios para mostrar.
            </div>
          )}

          {!loading && !error && mergedUsers.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-white/70">
                  <tr className="border-b border-red-800/70">
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Whitelist</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Última sesión</th>
                    <th className="px-3 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedUsers.map((user) => {
                    const userId = user?._userId || user?.id || user?.user_id;
                    const isWhitelisted = !!user?.is_whitelisted;
                    const role = user?.role || "user";
                    const status = user?.status || "active";

                    return (
                      <tr
                        key={userId || user?.email}
                        className="border-b border-red-900/60"
                      >
                        <td className="px-3 py-4">
                          <div className="font-medium text-white">{user?.email || "-"}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {[
                              user?._appVersion ? `v${user._appVersion}` : null,
                              user?._deviceName || null,
                              user?._os || null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Sin telemetría"}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`${badgeBase} ${
                              isWhitelisted
                                ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
                                : "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30"
                            }`}
                          >
                            {isWhitelisted ? "Aprobado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`${badgeBase} ${
                              role === "admin"
                                ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30"
                                : "bg-slate-500/20 text-slate-200 ring-1 ring-slate-500/30"
                            }`}
                          >
                            {role}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`${badgeBase} ${
                              status === "blocked"
                                ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-white/80">
                          {formatDate(user?._lastSession)}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              className={`${actionButtonClass} border border-red-700 text-white hover:border-emerald-400 hover:text-emerald-200 disabled:opacity-50`}
                              disabled={actionLoading[`${userId}-whitelist`]}
                              onClick={() => handleToggleWhitelist(user)}
                            >
                              {actionLoading[`${userId}-whitelist`]
                                ? "..."
                                : isWhitelisted
                                ? "Desaprobar"
                                : "Aprobar"}
                            </button>
                            <button
                              className={`${actionButtonClass} border border-red-700 text-white hover:border-amber-400 hover:text-amber-200 disabled:opacity-50`}
                              disabled={actionLoading[`${userId}-status`]}
                              onClick={() => handleToggleStatus(user)}
                            >
                              {actionLoading[`${userId}-status`]
                                ? "..."
                                : status === "active"
                                ? "Bloquear"
                                : "Desbloquear"}
                            </button>
                            <button
                              className={`${actionButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200 disabled:opacity-50`}
                              disabled={actionLoading[`${userId}-role`]}
                              onClick={() => handleToggleRole(user)}
                            >
                              {actionLoading[`${userId}-role`]
                                ? "..."
                                : role === "admin"
                                ? "Quitar admin"
                                : "Hacer admin"}
                            </button>
                            <button
                              className={`${actionButtonClass} border border-red-700 text-white hover:border-rose-400 hover:text-rose-200 disabled:opacity-50`}
                              disabled={actionLoading[`${userId}-session`]}
                              onClick={() => handleCloseSession(user)}
                            >
                              {actionLoading[`${userId}-session`]
                                ? "..."
                                : "Cerrar sesión"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Últimas ejecuciones
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Historial reciente de runs del runner.
              </p>
            </div>
          </div>

          {recentRuns.length === 0 ? (
            <div className="mt-6 text-sm text-white/70">
              No hay ejecuciones para mostrar.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-white/70">
                  <tr className="border-b border-red-800/70">
                    <th className="px-3 py-3">Usuario</th>
                    <th className="px-3 py-3">Inicio</th>
                    <th className="px-3 py-3">Fin</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.id} className="border-b border-red-900/60">
                      <td className="px-3 py-4">{run._email}</td>
                      <td className="px-3 py-4 text-white/80">
                        {formatDate(run.start_time)}
                      </td>
                      <td className="px-3 py-4 text-white/80">
                        {formatDate(run.end_time)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`${badgeBase} ${
                            run.status === "success"
                              ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
                              : run.status === "error"
                              ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30"
                              : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-white/70">
                        {run.error ? String(run.error).slice(0, 120) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
