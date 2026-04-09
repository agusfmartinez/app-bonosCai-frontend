import { Link } from "react-router-dom";
import { useLatestVersion } from "../../lib/latestVersion";
import { cardClass, baseButtonClass, loginButtonClass } from "../../styles/classes";

const painPoints = [
  "Llegas tarde y te quedas sin lugar.",
  "La página se cuelga justo cuando abre.",
  "Perdes tiempo completando el formulario manualmente.",
  "En segundos, ya no quedan lugares.",
];

const benefits = [
  "Ejecuta el canje de bonos en el horario exacto.",
  "Evita completar a mano el formulario.",
  "Guarda tu configuración para próximos partidos.",
  "Asegura tus chances de conseguir lugar.",
];

const steps = [
  {
    title: "Configurás tus datos",
    description: "Sector, cantidad y socios.",
  },
  {
    title: "Dejás todo listo",
    description: "Antes del horario de apertura.",
  },
  {
    title: "El bot ejecuta por vos",
    description: "En el momento exacto, en segundos.",
  },
];

export default function LandingPage() {
  const { latest } = useLatestVersion({ channel: "stable" });
  const downloadReady = Boolean(latest?.url);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950 pb-20">

      {/* HERO */}
      <section id="hero" className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center anchor-offset">
        <div className="max-w-xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-200/80">
            Bot Bonos CAI
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Automatizá el canje de bonos y asegurá tu lugar en segundos.
          </h1>

          <p className="text-sm text-red-100/70">
            Lo configurás una vez. El bot entra, completa y confirma por vos en el momento exacto.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* <a
              href={downloadReady ? latest.url : "#"}
              className={`${baseButtonClass} ${downloadReady ? "bg-red-500 text-white hover:bg-red-400" : "cursor-not-allowed bg-red-900 text-red-200/70"}`}
            >
              Descargar app
            </a> */}

            <a href="#download" className={loginButtonClass}>
              Descargar app
            </a>
          </div>

          {latest?.version && (
            <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">
              Versión actual: v{latest.version}
            </p>
          )}
        </div>

        {/* BLOQUE DIFERENCIAL */}
        <div className={`${cardClass} grid gap-4`}>
          <div className={`${cardClass} p-5`}>
            <p className="text-xs uppercase tracking-[0.4em] text-red-200/70">
              Ventaja real
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              Cuando otros recién están entrando, vos ya terminaste.
            </p>
            <p className="mt-2 text-sm text-red-100/70">
              Menos errores. Más velocidad. Más chances.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`${cardClass} p-4`}>
              <p className="text-xs uppercase tracking-[0.3em] text-red-200">
                Timing perfecto
              </p>
              <p className="mt-2 text-sm text-red-100">
                Ejecuta en el segundo exacto.
              </p>
            </div>

            <div className={`${cardClass} p-4`}>
              <p className="text-xs uppercase tracking-[0.3em] text-red-200">
                Sin errores
              </p>
              <p className="mt-2 text-sm text-red-100">
                Datos cargados, acción inmediata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <div className={cardClass}>
          <h2 className="text-2xl font-semibold text-white">
            El canje de bonos es una carrera contra el tiempo
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {painPoints.map((text) => (
              <div key={text} className={`${cardClass} p-4 text-sm text-red-100`}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUCION */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <div className={cardClass}>
          <h2 className="text-2xl font-semibold text-white">
            El bot lo hace por vos
          </h2>

          <p className="mt-3 text-sm text-red-100/70">
            Automatiza el proceso completo: el bot entra, completa con tus datos y confirma sin que tengas que estar.
          </p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <h2 className="text-2xl font-semibold text-white">
          Beneficios claros
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {benefits.map((text) => (
            <div key={text} className={`${cardClass} p-4 text-sm text-red-100`}>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <h2 className="text-2xl font-semibold text-white">
          Cómo funciona
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className={`${cardClass} p-5`}>
              <p className="text-xs uppercase tracking-[0.3em] text-red-200/80">
                Paso {index + 1}
              </p>

              <p className="mt-3 text-sm text-white">{step.title}</p>

              <p className="mt-2 text-sm text-red-100/70">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="download" className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <div className={`${cardClass} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              No dependas más de llegar a tiempo
            </h2>
            <p className="mt-2 text-sm text-red-100/70">
              Configurá una vez. Ejecutá siempre en el momento justo.
            </p>
          </div>

          <Link to="/login" className={`${baseButtonClass} bg-red-500 text-white hover:bg-red-400`}>
              Descargar app
            </Link>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="mx-auto w-full max-w-6xl px-6 py-12 anchor-offset">
        <div className={cardClass}>
          <h2 className="text-2xl font-semibold text-white">
            Contacto
          </h2>

          <p className="mt-2 text-sm text-red-100/70">
            ¿Querés acceso o tenés dudas? Escribinos.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a href="mailto:soporte@bonoscai.com" className={loginButtonClass}>
              soporte@bonoscai.com
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10 text-xs uppercase tracking-[0.3em] text-red-200/60">
        <span>Bot Bonos CAI</span>
      </footer>
    </div>
  );
}
