import React from 'react'

const cardClass = 'rounded-xl border border-red-800 bg-red-900/60 p-6 shadow-xl shadow-red-950/30 backdrop-blur'
const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
const runButtonClass = `inline-flex items-center justify-center rounded-lg bg-sky-500/90 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`
const testButtonClass = `inline-flex items-center justify-center rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-500/40 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`
const stopButtonClass = `inline-flex items-center justify-center rounded-lg border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`

export default function Controls({ running, onRun, onRunTest, onStop }) {
  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Controles</h2>
          <p className="mt-1 text-sm text-white">
            Inicia la automatizacion o detenla cuando necesites intervenir.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onRun} disabled={running} className={runButtonClass}>
            {running ? 'Ejecutando...' : 'Ejecutar automatizacion'}
          </button>
          <button onClick={onRunTest} disabled={running} className={testButtonClass}>
            {running ? 'Ejecutando...' : 'Ejecutar modo test'}
          </button>
          <button onClick={onStop} disabled={!running} className={stopButtonClass}>
            Detener
          </button>
        </div>
      </div>
    </section>
  )
}
