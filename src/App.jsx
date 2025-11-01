import React, { useEffect, useRef, useState } from "react";
import PersonasForm from "./components/PersonasForm.jsx";
import Controls from "./components/Controls.jsx";
import LogsViewer from "./components/LogsViewer.jsx";
import LoginBox from "./components/LoginBox.jsx";
import { fetchWithAuth } from "./lib/api";

import { supabase } from "./lib/supabase";
import { clearSession } from "./lib/session";

const cardClass =
  "rounded-xl border border-red-800 bg-red-900/60 p-6 shadow-xl shadow-red-950/30 backdrop-blur";
const inputClass =
  "w-full rounded-lg border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-white placeholder-red-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40";
const baseButtonClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

const SECTORES = [
  { value: "52073", label: "PAVONI ALTA" },
  { value: "52074", label: "PAVONI BAJA" },
  { value: "52107", label: "SANTORO BAJA" },
];

export default function App({ allowed, ready }) {
  const [isLogged, setIsLogged] = useState(false);
  const [running, setRunning] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [logs, setLogs] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [config, setConfig] = useState(() => {
    // carga desde localStorage si existe
    const saved = localStorage.getItem("bonosConfig");
    if (saved) {
      const parsed = JSON.parse(saved);
      const validValues = new Set(SECTORES.map((s) => s.value));
      if (!validValues.has(parsed.sector)) {
        parsed.sector = SECTORES[0].value; // '52073'
      }
      const found = SECTORES.find(s => s.value === parsed.sector);
      parsed.sectorName = found ? found.label : '';
      return parsed;
    }
    return {
      url: "https://cai.boleteriavip.com.ar/event/description/1056",
      sector: SECTORES[0].value, // '52073'
      sectorName: SECTORES[0].label,
      cantidad: 1,
      horaHabilitacion: "18:00:00",
      personas: [{ socio: "", dni: "" }],
    };
  });

  // SSE (cuando armes el backend)
  const sseRef = useRef(null);
  useEffect(() => {
    if (!running) return;
    const es = new EventSource("/api/logs");
    sseRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs((prev) => [...prev, data]);
      } catch {
        setLogs((prev) => [...prev, { level: "info", message: e.data }]);
      }
    };
    es.onerror = () => {
      setLogs((prev) => [
        ...prev,
        { level: "error", message: "Fallo en el stream de logs" },
      ]);
      es.close();
    };
    return () => es.close();
  }, [running]);

  // useEffect(() => {
  //   if (!allowed || !ready) {                  // Supabase aún no validó la sesión
  //     setIsLogged(false)
  //     return
  //   }

  //   const token = localStorage.getItem('bp_token')
  //   const sessionId = localStorage.getItem('bp_session_id')
  //   if (!token || !sessionId) {
  //     setIsLogged(false)
  //     return
  //   }

  //   let cancelled = false
  //   ;(async () => {
  //     try {
  //       const res = await fetchWithAuth('/api/bvip/session')
  //       if (cancelled) return
  //       if (res.ok) {
  //         setIsLogged(true)
  //         setLogs(prev => [...prev, { level: 'success', message: 'Sesión lista.' }])
  //       } else {
  //         setIsLogged(false)
  //       }
  //     } catch {
  //       if (!cancelled) setIsLogged(false)
  //     }
  //   })()

  //   return () => { cancelled = true }
  // }, [allowed, ready])

  // guardar config al salir de edición
  const guardarConfig = () => {
    localStorage.setItem("bonosConfig", JSON.stringify(config));
    setEditMode(false);
  };

  const handleLogin = async () => {
    setLogs((prev) => [
      ...prev,
      { level: "info", message: "Abriendo login..." },
    ]);
    try {
      const res = await fetchWithAuth("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Fallo login");
      const data = await res.json();
      if (data.eventUrl) {
        setConfig((prev) => ({ ...prev, url: data.eventUrl }));
      }
      setIsLogged(true);
      setLogs((prev) => [
        ...prev,
        { level: "success", message: "Sesión lista." },
      ]);
    } catch (e) {
      setLogs((prev) => [
        ...prev,
        { level: "error", message: `Login falló: ${e.message}` },
      ]);
    }
  };

  const handleRun = async (isTest = false) => {
    setLogs((prev) => [
      ...prev,
      { level: "info", message: "Iniciando automatización..." },
    ]);
    setRunning(true);
    try {
      // payload normal por defecto
      let payload = { ...config };

      // si es test, agregamos flags para backend (sin romper el formato original)
      if (isTest) {
        payload = {
          ...config,
          simulateLocal: true,
          simulate: {
            preFile: "prueba3.html", // pantalla “todavía no habilitado”
            liveFile: "prueba.html", // formulario habilitado
            confirmFile: "prueba2.html", // formulario confirmar 
            finalFile: "prueba4.html", // post-compra
            preMs: 10000, // 10s simulando espera/cola
          },
        };
      } 

      const res = await fetchWithAuth("/api/run", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Fallo al iniciar");
      setRunning(false);
      if (sseRef.current) sseRef.current.close();
      // progreso por SSE
    } catch (e) {
      setLogs((prev) => [
        ...prev,
        { level: "error", message: `Run falló: ${e.message}` },
      ]);
      setRunning(false);
    } 
  };

  const handleStop = async () => {
    try {
      await fetchWithAuth("/api/stop", { method: "POST" });
      setLogs((prev) => [
        ...prev,
        { level: "warning", message: "Proceso detenido por el usuario." },
      ]);
    } finally {
      setRunning(false);
      if (sseRef.current) sseRef.current.close();
    }
  };

  // helpers
  const setCantidad = (n) => {
    const cantidad = Number(n);
    const personas = [...config.personas];
    while (personas.length < cantidad) personas.push({ socio: "", dni: "" });
    while (personas.length > cantidad) personas.pop();
    setConfig((c) => ({ ...c, cantidad, personas }));
  };

  const statusChipClass = `inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
    isLogged
      ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
      : "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30"
  }`;

  const loginButtonClass = `${baseButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12 lg:px-10">
        <header className="space-y-3 flex">
          <div className="flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-black-400">
              Bonos CAI
            </span>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Automatización de canje de bonos
            </h1>
            <p className="max-w-2xl text-sm text-white sm:text-base">
              Configurá los datos y controlá la automatización desde una sola
              pantalla.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className={`${baseButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50`}
              onClick={async () => {
                setIsLogged(false);
                setRunning(false);
                if (sseRef.current) sseRef.current.close();

                clearSession(); // limpia bp_token / bp_session_id
                await supabase.auth.signOut(); // cierra la sesión de Supabase
                window.location.href = "/login";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className={`${cardClass}`}>
          <h2 className="text-lg font-semibold text-white">Iniciar Sesión</h2>
          <p className="mt-1 text-sm text-white">
            Inicia sesión con tu usuario de CAI Boleteriavip.
          </p>

          <LoginBox
            isLogged={isLogged}
            running={running}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onLogin={handleLogin}
          />
        </section>

        <section className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="flex-wrap">
              <h2 className="text-lg font-semibold text-white">
                Configuración básica
              </h2>
              <p className="mt-1 text-sm text-white">
                URL, sector, cantidad y hora de habilitación que usará el bot.
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  editMode
                    ? "bg-sky-500/15 text-sky-200"
                    : "bg-red-700/40 text-white"
                }`}
              >
                {editMode ? "Edición habilitada" : "Edición bloqueada"}
              </span>
              {!editMode ? (
                <button
                  className={`${baseButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50`}
                  onClick={() => setEditMode(true)}
                  disabled={running} // no permitir entrar a edición mientras corre
                >
                  Modificar
                </button>
              ) : (
                <button
                  className={`${baseButtonClass} bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/30 hover:bg-emerald-400`}
                  onClick={guardarConfig}
                >
                  Guardar
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              <span className="text-xs uppercase tracking-wide text-white">
                URL del evento
              </span>
              <input
                className={inputClass}
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                disabled={!editMode || running}
              />
            </label>

            {/* SELECT de Sector */}
            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              <span className="text-xs uppercase tracking-wide text-white">
                Sector
              </span>
              <select
                className={inputClass}
                value={config.sector}
                onChange={(e) => {
                  const value = e.target.value;
                  const found = SECTORES.find(s => s.value === value);
                  setConfig({
                  ...config,
                  sector: value,
                  sectorName: found ? found.label : '',
                  });
                }}
                disabled={!editMode || running}
              >
                {SECTORES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            {/* SELECT de Cantidad 1..6 */}
            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              <span className="text-xs uppercase tracking-wide text-white">
                Cantidad
              </span>
              <select
                className={inputClass}
                value={config.cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={!editMode || running}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              <span className="text-xs uppercase tracking-wide text-white">
                Hora habilitación (HH:MM:SS)
              </span>
              <input
                className={inputClass}
                value={config.horaHabilitacion}
                onChange={(e) =>
                  setConfig({ ...config, horaHabilitacion: e.target.value })
                }
                placeholder="18:00:00"
                disabled={!editMode || running}
              />
            </label>
          </div>
        </section>

        <PersonasForm
          personas={config.personas}
          onChange={(personas) => setConfig({ ...config, personas })}
          disabled={!editMode || running}
        />

        <Controls
          running={running}
          onRun={() => handleRun(false)} // real
          onRunTest={() => handleRun(true)} // test
          onStop={handleStop}
        />

        <LogsViewer logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
}
